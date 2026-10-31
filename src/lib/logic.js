// Pure app logic (no React, no DOM) so it can be unit-tested with `node --test`.
import { skillById, typeById } from './catalogue.js';

export const DAY = 86400000;
export const FORGOTTEN_DAYS = 14;

export const blankState = () => ({ children: [], toys: [], sessions: [], selectedChild: 'all' });
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const today = (now = new Date()) => isoDate(now);
export const isoDate = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export function ageMonths(birth, now = new Date()) {
  if (!birth) return null;
  const b = new Date(birth);
  return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth()) - (now.getDate() < b.getDate() ? 1 : 0);
}

export const daysAgo = (d, now = Date.now()) => Math.floor((now - new Date(d + 'T12:00:00').getTime()) / DAY + 0.5);

export function sessionsFor(state, childId = state.selectedChild, days = null, now = Date.now()) {
  return state.sessions.filter(
    (s) => (childId === 'all' || s.childId === childId) && (days == null || daysAgo(s.date, now) < days),
  );
}

export function lastPlayed(state, toyId) {
  const ss = sessionsFor(state).filter((s) => s.toyId === toyId);
  if (!ss.length) return null;
  return ss.reduce((a, b) => (a.date > b.date ? a : b)).date;
}

// Each session's minutes count towards every skill (and every domain once) linked to the toy.
export function skillMinutes(state, sessions) {
  const bySkill = {};
  const byDomain = {};
  for (const s of sessions) {
    const t = state.toys.find((x) => x.id === s.toyId);
    if (!t) continue;
    const doms = new Set();
    for (const sk of t.skillIds) {
      bySkill[sk] = (bySkill[sk] || 0) + s.minutes;
      if (skillById[sk]) doms.add(skillById[sk].domain);
    }
    for (const d of doms) byDomain[d] = (byDomain[d] || 0) + s.minutes;
  }
  return { bySkill, byDomain };
}

export const toysForDomain = (state, d) =>
  state.toys.filter((t) => !t.archived && t.skillIds.some((s) => skillById[s]?.domain === d));

export function ageFits(toy, child, now = new Date()) {
  const m = ageMonths(child?.birthDate, now);
  return m == null || (m >= toy.minAge && m <= toy.maxAge);
}

export function favourite(state, sessions) {
  const agg = {};
  for (const s of sessions) (agg[s.toyId] ||= []).push(s.enjoyment || 2);
  let best = null;
  let bestAvg = 0;
  for (const [id, arr] of Object.entries(agg)) {
    const t = state.toys.find((x) => x.id === id);
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length + arr.length * 0.01;
    if (t && avg > bestAvg) { bestAvg = avg; best = t; }
  }
  return best;
}

export function isBackup(data) {
  return !!data && Array.isArray(data.toys) && Array.isArray(data.children) && Array.isArray(data.sessions);
}

export function makeToy(type, name) {
  const ty = typeById[type];
  return { id: uid(), name, type, emoji: ty.emoji, minAge: ty.age[0], maxAge: ty.age[1], skillIds: [...ty.skills], notes: '', createdAt: today(), archived: false };
}

export function demoState(lang = 'en') {
  const birth = (m) => { const d = new Date(); d.setMonth(d.getMonth() - m); return isoDate(d); };
  const ar = lang === 'ar';
  const kids = [
    { id: uid(), name: ar ? 'سارة' : 'Sara', birthDate: birth(30) },
    { id: uid(), name: ar ? 'عمر' : 'Omar', birthDate: birth(14) },
  ];
  const toys = [
    makeToy('blocks', ar ? 'مكعبات خشبية' : 'Wooden blocks'),
    makeToy('puzzle', ar ? 'بازل الحيوانات' : 'Animal puzzle'),
    makeToy('book', ar ? 'قصص قبل النوم' : 'Bedtime stories'),
    makeToy('ball', ar ? 'الكرة الحمراء' : 'Red ball'),
    makeToy('sorter', ar ? 'صندوق الأشكال' : 'Shape sorter'),
    makeToy('crayons', ar ? 'ألوان شمعية' : 'Crayons'),
    makeToy('doll', ar ? 'الدبدوب' : 'Teddy bear'),
    makeToy('music', ar ? 'الطبلة الصغيرة' : 'Little drum'),
  ];
  const ago = (n) => isoDate(new Date(Date.now() - n * DAY));
  const sessions = [[0, 0, 1, 20, 3], [0, 2, 0, 10, 2], [1, 3, 2, 15, 3], [0, 5, 3, 15, 2], [1, 7, 1, 10, 3], [0, 1, 4, 20, 2], [1, 4, 5, 5, 1], [0, 0, 20, 30, 3]]
    .map(([k, t, d, m, e]) => ({ id: uid(), childId: kids[k].id, toyId: toys[t].id, date: ago(d), minutes: m, enjoyment: e, note: '' }));
  return { children: kids, toys, sessions, selectedChild: kids[0].id };
}
