import { useState } from 'react';
import { domains, skillById } from '../lib/catalogue.js';
import { FORGOTTEN_DAYS, ageFits, daysAgo, lastPlayed } from '../lib/logic.js';
import { useI18n } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { Badge, Btn, Chip, SkillChips, ToyPic } from '../components/ui.jsx';

export default function Toys({ open, loadDemo }) {
  const { t, tn, fmtAge, relDay } = useI18n();
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const sel = state.children.find((c) => c.id === state.selectedChild);
  const active = state.toys.filter((x) => !x.archived);

  if (!active.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="text-7xl">🧸</div>
        <h2 className="text-2xl font-bold">{t('firstToyTitle')}</h2>
        <p className="max-w-sm text-slate-600">{t('firstToyText')}</p>
        <Btn variant="primary" onClick={() => open('toyForm')}>+ {t('addAToy')}</Btn>
        <p className="text-sm text-slate-500">
          {t('or')} <button className="font-semibold text-brand-600 underline" onClick={loadDemo}>{t('tryDemo')}</button>
        </p>
      </div>
    );
  }

  const forgotten = (x) => { const l = lastPlayed(state, x.id); return !l || daysAgo(l) >= FORGOTTEN_DAYS; };
  let toys = active;
  if (filter === 'forgotten') toys = toys.filter(forgotten);
  else if (filter !== 'all') toys = toys.filter((x) => x.skillIds.some((s) => skillById[s]?.domain === filter));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('toyBox')} <span className="text-sm font-normal text-slate-500">({active.length})</span></h2>
        <Btn variant="primary" onClick={() => open('toyForm')}>+ {t('addToy')}</Btn>
      </div>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip on={filter === 'all'} onClick={() => setFilter('all')}>{t('filterAll')}</Chip>
        <Chip on={filter === 'forgotten'} onClick={() => setFilter('forgotten')}>💤 {t('filterForgotten', { n: FORGOTTEN_DAYS })}</Chip>
        {domains.map((d) => (
          <Chip key={d.id} on={filter === d.id} onClick={() => setFilter(d.id)}>{d.icon} {tn(d.name)}</Chip>
        ))}
      </div>
      {toys.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {toys.map((x) => {
            const l = lastPlayed(state, x.id);
            return (
              <button key={x.id} onClick={() => open('toyDetail', { id: x.id })}
                className="flex flex-col gap-2 rounded-2xl bg-white p-3 text-start shadow-sm ring-1 ring-slate-100 transition active:scale-[0.98]">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                  <ToyPic toy={x} className="text-5xl" />
                </div>
                <div className="font-bold leading-tight">{x.name}</div>
                <div className="flex flex-wrap gap-1">
                  <Badge warn={forgotten(x)}>{l ? `▶ ${relDay(l)}` : t('neverPlayed')}</Badge>
                  {sel && !ageFits(x, sel) && <Badge warn>{t('age')} {fmtAge(x.minAge)}–{fmtAge(x.maxAge)}</Badge>}
                </div>
                <div className="flex flex-wrap gap-1"><SkillChips ids={x.skillIds} max={3} /></div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500">{t('noMatch')}</p>
      )}
    </div>
  );
}
