import { sessionsFor } from '../lib/logic.js';
import { useI18n } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { Card, enjoyEmoji } from '../components/ui.jsx';

export default function PlayLog() {
  const { t, fmtMins, relDay } = useI18n();
  const { state, update } = useStore();
  const ss = sessionsFor(state).slice().sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
  if (!ss.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="text-6xl">▶️</div>
        <h2 className="text-2xl font-bold">{t('noLogTitle')}</h2>
        <p className="max-w-sm text-slate-600">{t('noLogText')}</p>
      </div>
    );
  }
  const del = (id) => {
    if (window.confirm(t('delEntryQ'))) update((s) => { s.sessions = s.sessions.filter((x) => x.id !== id); });
  };
  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">{t('navLog')}</h2>
      <div className="flex flex-col gap-2">
        {ss.map((s) => {
          const toy = state.toys.find((x) => x.id === s.toyId) || { name: t('deletedToy'), emoji: '❔' };
          const c = state.children.find((x) => x.id === s.childId);
          return (
            <Card key={s.id} className="flex items-center gap-3 !p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-2xl">
                {toy.photo ? <img src={toy.photo} alt="" className="h-full w-full object-cover" /> : toy.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div><b>{toy.name}</b> {enjoyEmoji(s.enjoyment)}</div>
                <div className="truncate text-sm text-slate-500">
                  {[c?.name, fmtMins(s.minutes), relDay(s.date), s.note].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button className="rounded-lg px-2 py-1 text-red-500 active:bg-red-50" aria-label={t('del')} onClick={() => del(s.id)}>✕</button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
