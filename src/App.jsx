import { useCallback, useState } from 'react';
import { useI18n } from './lib/i18n.jsx';
import { useStore } from './lib/store.jsx';
import { demoState } from './lib/logic.js';
import { track } from './firebase.js';
import Toys from './pages/Toys.jsx';
import Skills from './pages/Skills.jsx';
import PlayLog from './pages/PlayLog.jsx';
import Family from './pages/Family.jsx';
import { ChildForm, LogForm, ToyDetail, ToyForm } from './components/Forms.jsx';

const TABS = [
  { id: 'toys', icon: '🧸', label: 'navToys', Page: Toys },
  { id: 'skills', icon: '🌱', label: 'navSkills', Page: Skills },
  { id: 'log', icon: '📒', label: 'navLog', Page: PlayLog },
  { id: 'family', icon: '👨‍👩‍👧', label: 'navFamily', Page: Family },
];
const MODALS = { toyForm: ToyForm, toyDetail: ToyDetail, logForm: LogForm, childForm: ChildForm };

export default function App() {
  const { t, toggle } = useI18n();
  const { state, update, replace } = useStore();
  const [view, setView] = useState('toys');
  const [modal, setModal] = useState(null);

  const close = useCallback(() => setModal(null), []);
  const open = useCallback((kind, props = {}) => {
    if (kind === 'logForm') {
      if (!state.toys.some((x) => !x.archived)) { window.alert(t('needToy')); return; }
      if (!state.children.length) { window.alert(t('needChild')); setModal(null); setView('family'); return; }
    }
    track('open_' + kind);
    setModal({ kind, props });
  }, [state, t]);

  const loadDemo = () => { replace(demoState(document.documentElement.lang)); track('load_demo'); };
  const { Page } = TABS.find((x) => x.id === view);
  const Modal = modal && MODALS[modal.kind];

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col">
      <header className="pt-safe sticky top-0 z-30 bg-brand-500 text-white shadow-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <img src="/icon.svg" alt="" className="h-9 w-9 rounded-xl ring-2 ring-white/40" />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold leading-tight">{t('appName')}</div>
            <div className="text-xs text-white/80">{t('tagline')}</div>
          </div>
          <select
            aria-label={t('child')}
            className="max-w-[9rem] rounded-xl border-0 bg-white/20 px-2 py-1.5 text-sm font-semibold text-white focus:outline-none [&>option]:text-slate-900"
            value={state.selectedChild}
            onChange={(e) => update((s) => { s.selectedChild = e.target.value; })}
          >
            <option value="all">{t('allChildren')}</option>
            {state.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={toggle} className="rounded-xl bg-white px-2.5 py-1.5 text-sm font-bold text-brand-600 active:scale-95" aria-label={t('language')}>
            {t('switchLang')}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-40 pt-4">
        <Page open={open} loadDemo={loadDemo} />
      </main>

      <button
        onClick={() => open('logForm')}
        className="fixed bottom-24 end-4 z-30 rounded-full bg-brand-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-brand-300 active:scale-95 sm:end-[max(1rem,calc(50vw-28rem))]"
      >
        ▶ {t('logPlay')}
      </button>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}>
        <div className="mx-auto grid max-w-4xl grid-cols-4">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 text-xs font-semibold ${view === tab.id ? 'text-brand-600' : 'text-slate-500'}`}>
              <span className={`rounded-full px-4 py-0.5 text-xl ${view === tab.id ? 'bg-brand-100' : ''}`}>{tab.icon}</span>
              {t(tab.label)}
            </button>
          ))}
        </div>
      </nav>

      {Modal && <Modal key={modal.kind + JSON.stringify(modal.props)} {...modal.props} onClose={close} open={open} />}
    </div>
  );
}
