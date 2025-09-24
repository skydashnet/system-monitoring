import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

function createAuthStore() {
  const storedState = browser ? sessionStorage.getItem('authState') : null;
  const initialState: AuthState = storedState 
    ? JSON.parse(storedState) 
    : { isAuthenticated: false, username: null };

  const { subscribe, set } = writable<AuthState>(initialState);

  return {
    subscribe,
    login: (username: string) => {
      const newState: AuthState = { isAuthenticated: true, username };
      if (browser) {
        sessionStorage.setItem('authState', JSON.stringify(newState));
      }
      set(newState);
    },
    logout: () => {
      const newState: AuthState = { isAuthenticated: false, username: null };
      if (browser) {
        sessionStorage.removeItem('authState');
      }
      set(newState);
    }
  };
}

export const auth = createAuthStore();