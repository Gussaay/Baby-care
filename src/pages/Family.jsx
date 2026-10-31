import { blankState, isBackup, sessionsFor, today } from '../lib/logic.js';
import { useI18n } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { Btn, Card } from '../components/ui.jsx';

export default function Family({ open }) {
  const { t, childAge, lang, setLang } = useI18n();
  const { state, replace } = useStore();

  const doExport = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    a.download = `baby-care-${today()}.json`;
    a.click();
  };
  const doImport = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!isBackup(data)) throw new Error('bad file');
      replace({ ...blankState(), ...data });
    } catch { window.alert(t('badFile')); }
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('children')}</h2>
          <Btn variant="primary" onClick={() => open('childForm')}>+ {t('addChild')}</Btn>
        </div>
        <div className="flex flex-col gap-2">
          {state.children.length ? state.children.map((c) => (
            <Card key={c.id} className="flex items-center justify-between !p-3">
              <div>
                <b>{c.name}</b> <span className="text-slate-500">{childAge(c)}</span>
                <div className="text-sm text-slate-500">{t('sessionsLogged', { n: sessionsFor(state, c.id).length })}</div>
              </div>
              <Btn onClick={() => open('childForm', { id: c.id })}>{t('edit')}</Btn>
            </Card>
          )) : <p className="text-slate-500">{t('noChildren')}</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-bold">{t('language')}</h3>
        <div className="flex gap-2">
          <Btn variant={lang === 'en' ? 'on' : 'default'} onClick={() => setLang('en')}>English</Btn>
          <Btn variant={lang === 'ar' ? 'on' : 'default'} onClick={() => setLang('ar')}>العربية</Btn>
        </div>
      </section>

      <section>
        <h3 className="mb-1 font-bold">{t('backup')}</h3>
        <p className="mb-3 text-sm text-slate-500">{t('backupText')}</p>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={doExport}>⬇ {t('export')}</Btn>
          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 active:scale-95">
            ⬆ {t('import')}
            <input type="file" accept="application/json" hidden onChange={doImport} />
          </label>
          <Btn variant="danger" onClick={() => window.confirm(t('eraseQ')) && replace(blankState())}>{t('erase')}</Btn>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">{t('appName')} · {t('version', { v: import.meta.env.VITE_APP_VERSION })}</p>
    </div>
  );
}
