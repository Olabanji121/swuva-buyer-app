import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Debug: Check what's in AsyncStorage on load
AsyncStorage.getItem('swuva-auth-storage').then((data) => {
  console.log('[AuthStore] Raw AsyncStorage data:', data);
}).catch((err) => {
  console.error('[AuthStore] Failed to read AsyncStorage:', err);
});

// Note: We use AsyncStorage for Zustand persist because it has proper
// async adapter support. SecureStore doesn't work with createJSONStorage
// as Zustand expects sync getItem but SecureStore is fully async.
//
// For sensitive data (tokens), we store them separately in SecureStore
// via the useAuth hook. The rememberedEmail is non-sensitive.

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  // Remembered email for auto-fill on login screen
  rememberedEmail: string | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
  setRememberedEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      rememberedEmail: null,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          // Note: rememberedEmail is NOT cleared on logout
          // This is intentional - it's for auto-fill convenience
        }),

      setHydrated: (hydrated) => {
        console.log('[AuthStore] setHydrated called:', hydrated);
        set({ isHydrated: hydrated });
      },

      setRememberedEmail: (email) => {
        console.log('[AuthStore] setRememberedEmail called:', email);
        set({ rememberedEmail: email });
        // Verify it was set in Zustand state
        setTimeout(async () => {
          const current = get().rememberedEmail;
          console.log('[AuthStore] rememberedEmail in Zustand state:', current);
          // Also verify it was persisted to AsyncStorage
          try {
            const raw = await AsyncStorage.getItem('swuva-auth-storage');
            console.log('[AuthStore] AsyncStorage after set:', raw);
          } catch (e) {
            console.error('[AuthStore] Failed to verify AsyncStorage:', e);
          }
        }, 200);
      },
    }),
    {
      name: 'swuva-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('[AuthStore] Hydration STARTING...');
        // Return callback that runs when hydration finishes
        return (state, error) => {
          console.log('[AuthStore] Hydration FINISHED');
          console.log('[AuthStore] Hydrated state:', {
            hasUser: !!state?.user,
            isAuthenticated: state?.isAuthenticated,
            rememberedEmail: state?.rememberedEmail,
            error: error instanceof Error ? error.message : error,
          });
          if (error) {
            console.error('[AuthStore] Hydration error:', error);
          }
          // Always set hydrated to true, even on error
          // This prevents the app from hanging waiting for hydration
          useAuthStore.setState({ isHydrated: true });
          console.log('[AuthStore] isHydrated set to true');
        };
      },
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberedEmail: state.rememberedEmail,
      }),
    }
  )
);
