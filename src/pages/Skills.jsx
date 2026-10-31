import { useState } from 'react';
import { domains, skills } from '../lib/catalogue.js';
import { ageFits, favourite, sessionsFor, skillMinutes, toysForDomain } from '../lib/logic.js';
import { useI18n } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { Btn, Card, Chip } from '../components/ui.jsx';

export default function Skills({ open }) {
  const { t, tn, fmtMins } = useI18n();
  const { state } = useStore();
  const [period, setPeriod] = useState(7);
  const sel = state.children.find((c) => c.id === state.selectedChild);
  const ss = sessionsFor(state, state.selectedChild, period);
  const { bySkill, byDomain } = skillMinutes(state, ss);
  const max = Math.max(1, ...Object.values(byDomain));
  const total = ss.reduce((a, s) => a + s.minutes, 0);
  const neglected = domains.filter((d) => !byDomain[d.id]);
  const fav = favourite(state, ss);
  const noPlay = period === 7 ? 'noPlayWeek' : period === 30 ? 'noPlayMonth' : 'noPlayAll';

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{sel ? t('skillsFor', { name: sel.name }) : t('skills')}</h2>
        <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-slate-100">
          {[[7, 'week'], [30, 'month'], [3650, 'all']].map(([p, k]) => (
            <Btn key={p} variant={period === p ? 'on' : 'default'} className="!border-0 !px-3 !py-1" onClick={() => setPeriod(p)}>{t(k)}</Btn>
          ))}
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-500">{t('summary', { t: fmtMins(total), s: t('sessions', { n: ss.length }) })}</p>

      <div className="mb-4 flex flex-col gap-3">
        {state.toys.length > 0 && neglected.slice(0, 3).map((d) => {
          const opts = toysForDomain(state, d.id).filter((x) => !sel || ageFits(x, sel)).slice(0, 3);
          return (
            <Card key={d.id} className="border-s-4 !p-3" style={{ borderInlineStartColor: d.color }}>
              <b>{d.icon} {tn(d.name)}</b> {t(noPlay)}{' '}
              {opts.length ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-500">{t('tryToys')}</span>
                  {opts.map((x) => <Chip key={x.id} onClick={() => open('logForm', { toyId: x.id })}>{x.emoji} {x.name}</Chip>)}
                </div>
              ) : <span className="text-slate-500">{t('noToysLinked')}</span>}
            </Card>
          );
        })}
        {fav && <Card className="!p-3">😍 {t('favourite')} <b>{fav.emoji} {fav.name}</b></Card>}
      </div>

      <h3 className="mb-2 font-bold">{t('byArea')}</h3>
      <div className="flex flex-col gap-2">
        {domains.map((d) => {
          const mins = byDomain[d.id] || 0;
          return (
            <details key={d.id} className="group rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                <span className="w-40 shrink-0 text-sm font-semibold sm:w-56">{d.icon} {tn(d.name)}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <i className="block h-full rounded-full" style={{ width: `${(mins / max) * 100}%`, background: d.color }} />
                </span>
                <span className="w-14 text-end text-sm tabular-nums">{fmtMins(mins)}</span>
              </summary>
              <div className="flex flex-col gap-1 border-t border-slate-100 px-4 py-2 text-sm">
                {skills.filter((s) => s.domain === d.id).map((s) => {
                  const n = state.toys.filter((x) => !x.archived && x.skillIds.includes(s.id)).length;
                  return (
                    <div key={s.id} className="flex justify-between py-1">
                      <span>{tn(s.name)} <span className="text-xs text-slate-400">· {t('toysCount', { n })}</span></span>
                      <span className={bySkill[s.id] ? '' : 'text-slate-400'}>{bySkill[s.id] ? fmtMins(bySkill[s.id]) : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
