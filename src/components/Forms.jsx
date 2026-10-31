import { useState } from 'react';
import { domains, skills, toyTypes, typeById } from '../lib/catalogue.js';
import { ageFits, today, uid } from '../lib/logic.js';
import { useI18n } from '../lib/i18n.jsx';
import { useStore } from '../lib/store.jsx';
import { Badge, Btn, Chip, Field, SectionLabel, Sheet, SkillChips, ToyPic, enjoyEmoji, inputCls } from './ui.jsx';

function resizeImage(file, size) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, size / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * s);
      cv.height = Math.round(img.height * s);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      res(cv.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function Footer({ left, onCancel, saveDisabled }) {
  const { t } = useI18n();
  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      {left || <span />}
      <div className="flex gap-2">
        <Btn onClick={onCancel}>{t('cancel')}</Btn>
        <Btn variant="primary" type="submit" disabled={saveDisabled}>{t('save')}</Btn>
      </div>
    </div>
  );
}

export function ToyForm({ id, onClose }) {
  const { t, tn, lang } = useI18n();
  const { state, update } = useStore();
  const existing = id && state.toys.find((x) => x.id === id);
  const [d, setD] = useState(() => existing
    ? { ...existing, skillIds: [...existing.skillIds] }
    : { name: '', type: '', emoji: '🎁', minAge: 0, maxAge: 144, skillIds: [], notes: '' });
  const set = (patch) => setD((x) => ({ ...x, ...patch }));

  const pickType = (ty) => {
    const prevName = typeById[d.type] ? tn(typeById[d.type].name) : '';
    set({
      type: ty.id, emoji: ty.emoji, minAge: ty.age[0], maxAge: ty.age[1], skillIds: [...ty.skills],
      name: !d.name || d.name === prevName ? ty.name[lang] : d.name,
    });
  };
  const toggleSkill = (sid) => set({ skillIds: d.skillIds.includes(sid) ? d.skillIds.filter((x) => x !== sid) : [...d.skillIds, sid] });

  const submit = (e) => {
    e.preventDefault();
    const name = d.name.trim();
    if (!name) return;
    let { minAge, maxAge } = d;
    if (minAge > maxAge) [minAge, maxAge] = [maxAge, minAge];
    update((s) => {
      if (existing) Object.assign(s.toys.find((x) => x.id === id), { ...d, name, minAge, maxAge });
      else s.toys.push({ ...d, name, minAge, maxAge, id: uid(), createdAt: today(), archived: false, type: d.type || 'other' });
    });
    onClose();
  };
  const remove = () => {
    if (!window.confirm(t('removeToyQ', { name: d.name }))) return;
    update((s) => { s.toys.find((x) => x.id === id).archived = true; });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">{existing ? t('editToy') : t('addRealToy')}</h2>
        <div>
          <SectionLabel>{t('stepType')}</SectionLabel>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {toyTypes.map((ty) => (
              <button type="button" key={ty.id} onClick={() => pickType(ty)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-semibold ${d.type === ty.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white'}`}>
                <span className="text-2xl">{ty.emoji}</span>{tn(ty.name)}
              </button>
            ))}
          </div>
        </div>
        <Field label={t('name')}>
          <input className={inputCls} required value={d.name} placeholder={t('namePh')} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label={t('photo')}>
          <input type="file" accept="image/*" capture="environment" className="text-sm font-normal"
            onChange={async (e) => { const f = e.target.files?.[0]; if (f) set({ photo: await resizeImage(f, 320) }); }} />
        </Field>
        {d.photo && (
          <div className="flex items-center gap-3">
            <img src={d.photo} alt="" className="w-20 rounded-lg" />
            <Btn className="!py-1 text-sm" onClick={() => set({ photo: undefined })}>{t('removePhoto')}</Btn>
          </div>
        )}
        <div>
          <SectionLabel>{t('stepAge')}</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('from')}><input className={inputCls} type="number" min="0" max="216" value={d.minAge} onChange={(e) => set({ minAge: +e.target.value || 0 })} /></Field>
            <Field label={t('to')}><input className={inputCls} type="number" min="0" max="216" value={d.maxAge} onChange={(e) => set({ maxAge: +e.target.value || 0 })} /></Field>
          </div>
        </div>
        <div>
          <SectionLabel>{t('stepSkills')}</SectionLabel>
          <div className="flex flex-col gap-3">
            {domains.map((dm) => (
              <div key={dm.id}>
                <div className="mb-1 text-sm font-bold">{dm.icon} {tn(dm.name)}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.filter((s) => s.domain === dm.id).map((s) => (
                    <Chip key={s.id} on={d.skillIds.includes(s.id)} onClick={() => toggleSkill(s.id)}>{tn(s.name)}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Field label={t('notes')}>
          <textarea className={inputCls} rows="2" value={d.notes} placeholder={t('notesPh')} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
        <Footer onCancel={onClose} left={existing && <Btn variant="danger" onClick={remove}>{t('removeToy')}</Btn>} />
      </form>
    </Sheet>
  );
}

export function ToyDetail({ id, onClose, open }) {
  const { t, tn, fmtAge, fmtMins, relDay } = useI18n();
  const { state } = useStore();
  const toy = state.toys.find((x) => x.id === id);
  if (!toy) return null;
  const ss = state.sessions.filter((s) => s.toyId === id).sort((a, b) => b.date.localeCompare(a.date));
  const mins = ss.reduce((a, s) => a + s.minutes, 0);
  return (
    <Sheet onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
          <ToyPic toy={toy} className="text-7xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{toy.name}</h2>
          <div className="text-sm text-slate-500">{tn(typeById[toy.type]?.name)} · {t('ages')} {fmtAge(toy.minAge) || '0'}–{fmtAge(toy.maxAge)}</div>
        </div>
        <div className="flex flex-wrap gap-1">{toy.skillIds.length ? <SkillChips ids={toy.skillIds} /> : <span className="text-slate-500">{t('noSkills')}</span>}</div>
        <div className="flex flex-wrap gap-2">
          <Badge>{t('sessions', { n: ss.length })}</Badge>
          <Badge>{t('total', { t: fmtMins(mins) })}</Badge>
          {ss[0] && <Badge>{t('last', { d: relDay(ss[0].date) })}</Badge>}
        </div>
        {toy.notes && <p className="text-sm">{toy.notes}</p>}
        <div className="mt-2 flex justify-between gap-2">
          <Btn onClick={() => open('toyForm', { id })}>{t('edit')}</Btn>
          <div className="flex gap-2">
            <Btn onClick={onClose}>{t('close')}</Btn>
            <Btn variant="primary" onClick={() => open('logForm', { toyId: id })}>▶ {t('logPlay')}</Btn>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

export function LogForm({ toyId, onClose }) {
  const { t } = useI18n();
  const { state, update } = useStore();
  const toys = state.toys.filter((x) => !x.archived);
  const [d, setD] = useState({
    childId: state.selectedChild !== 'all' ? state.selectedChild : state.children[0]?.id,
    toyId: toyId || null, minutes: 15, enjoyment: 2, date: today(), note: '',
  });
  const set = (patch) => setD((x) => ({ ...x, ...patch }));
  const c = state.children.find((x) => x.id === d.childId);
  const sorted = toys.slice().sort((a, b) => (ageFits(b, c) - ageFits(a, c)) || a.name.localeCompare(b.name));

  const submit = (e) => {
    e.preventDefault();
    if (!d.toyId) return;
    update((s) => { s.sessions.push({ id: uid(), ...d, date: d.date || today() }); });
    onClose();
  };
  const segBtn = (on) => (on ? 'on' : 'default');

  return (
    <Sheet onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">▶ {t('logPlay')}</h2>
        <div className="flex flex-wrap gap-2">
          {state.children.map((ch) => <Btn key={ch.id} variant={segBtn(d.childId === ch.id)} onClick={() => set({ childId: ch.id })}>{ch.name}</Btn>)}
        </div>
        <div>
          <SectionLabel>{t('whichToy')}</SectionLabel>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {sorted.map((x) => (
              <button type="button" key={x.id} onClick={() => set({ toyId: x.id })}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-semibold ${d.toyId === x.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white'}`}>
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg"><ToyPic toy={x} className="text-2xl" /></span>
                <span className="line-clamp-2 text-center">{x.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>{t('howLong')}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 30, 45, 60].map((m) => <Btn key={m} variant={segBtn(d.minutes === m)} className="!px-3" onClick={() => set({ minutes: m })}>{m}{t('min')}</Btn>)}
          </div>
        </div>
        <div>
          <SectionLabel>{t('enjoy')}</SectionLabel>
          <div className="flex gap-2">
            {[1, 2, 3].map((e) => <Btn key={e} variant={segBtn(d.enjoyment === e)} className="text-2xl" onClick={() => set({ enjoyment: e })}>{enjoyEmoji(e)}</Btn>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('date')}><input className={inputCls} type="date" value={d.date} max={today()} onChange={(e) => set({ date: e.target.value })} /></Field>
          <div><Field label={t('note')}><input className={inputCls} value={d.note} placeholder={t('optional')} onChange={(e) => set({ note: e.target.value })} /></Field></div>
        </div>
        <Footer onCancel={onClose} saveDisabled={!d.toyId} />
      </form>
    </Sheet>
  );
}

export function ChildForm({ id, onClose }) {
  const { t } = useI18n();
  const { state, update } = useStore();
  const c = id && state.children.find((x) => x.id === id);
  const [name, setName] = useState(c?.name || '');
  const [birthDate, setBirth] = useState(c?.birthDate || '');

  const submit = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    update((s) => {
      if (c) Object.assign(s.children.find((x) => x.id === id), { name: n, birthDate });
      else {
        const child = { id: uid(), name: n, birthDate };
        s.children.push(child);
        if (s.children.length === 1) s.selectedChild = child.id;
      }
    });
    onClose();
  };
  const remove = () => {
    if (!window.confirm(t('delChildQ', { name: c.name }))) return;
    update((s) => {
      s.children = s.children.filter((x) => x.id !== id);
      s.sessions = s.sessions.filter((x) => x.childId !== id);
      if (s.selectedChild === id) s.selectedChild = 'all';
    });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">{c ? t('editChild') : t('addChild')}</h2>
        <Field label={t('name')}><input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label={t('birth')}><input className={inputCls} type="date" value={birthDate} max={today()} onChange={(e) => setBirth(e.target.value)} /></Field>
        <Footer onCancel={onClose} left={c && <Btn variant="danger" onClick={remove}>{t('del')}</Btn>} />
      </form>
    </Sheet>
  );
}
