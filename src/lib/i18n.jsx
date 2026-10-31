import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dict } from './strings.js';
import { ageMonths, daysAgo } from './logic.js';

const LANG_KEY = 'babyCare.lang';
const I18n = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch { /* storage unavailable */ }
  return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${dict[lang].appName} · ${dict[lang === 'ar' ? 'en' : 'ar'].appName}`;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const value = useMemo(() => {
    const d = dict[lang];
    const t = (key, vars = {}) => {
      const v = d[key] ?? dict.en[key] ?? key;
      if (typeof v === 'function') return v(vars.n ?? 0);
      return v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    };
    const tn = (obj) => (obj ? obj[lang] || obj.en : '');
    const fmtMins = (m) => (m >= 60 ? `${Math.floor(m / 60)}${d.hour} ${m % 60 ? `${m % 60}${d.min}` : ''}`.trim() : `${m}${d.min}`);
    const fmtAge = (m) => {
      if (m == null) return '';
      if (m < 24) return `${m} ${d.mo}`;
      const y = Math.floor(m / 12);
      return `${y} ${d.yr}${m % 12 ? ` ${m % 12} ${d.mo}` : ''}`;
    };
    const relDay = (date) => {
      const n = daysAgo(date);
      return n <= 0 ? d.today : n === 1 ? d.yesterday : t('daysAgo', { n });
    };
    const childAge = (c) => fmtAge(ageMonths(c?.birthDate));
    return { lang, setLang, toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'), rtl: lang === 'ar', t, tn, fmtMins, fmtAge, relDay, childAge };
  }, [lang]);

  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);
