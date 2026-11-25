import { useEffect, useState } from 'react';
import { SEED_ADMIN_STATE } from '../data/seedData';
import { AdminState } from '../types/admin';

const STORAGE_KEY = 'stroyopttorg_admin_v1';

function loadInitialState(): AdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ADMIN_STATE;
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    return {
      ...SEED_ADMIN_STATE,
      ...parsed,
      settings: {
        ...SEED_ADMIN_STATE.settings,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return SEED_ADMIN_STATE;
  }
}

export function useAdminStore() {
  const [state, setState] = useState<AdminState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in demo mode
    }
  }, [state]);

  const resetToSeed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(SEED_ADMIN_STATE);
  };

  return { state, setState, resetToSeed };
}
