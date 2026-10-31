import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { blankState } from './logic.js';

const KEY = 'babyCare.v1';
const OLD_KEY = 'playOrganiser.v1'; // data saved by the first (plain JS) version of the app

function load() {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
    if (raw) return { ...blankState(), ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return blankState();
}

const Store = createContext(null);

export function StoreProvider({ children, onSaveError }) {
  const [state, setState] = useState(load);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch { onSaveError?.(); }
  }, [state, onSaveError]);

  // update(draft => { ...mutate a copy... })
  const update = useCallback((fn) => {
    setState((prev) => {
      const next = structuredClone(prev);
      return fn(next) || next;
    });
  }, []);

  return <Store.Provider value={{ state, update, replace: setState }}>{children}</Store.Provider>;
}

export const useStore = () => useContext(Store);
