/**
 * Zustand Store Template
 *
 * Usage: Copy and adapt for client-side state management
 * Location: src/stores/
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface FeatureItem {
  id: string;
  name: string;
  value: number;
}

interface FeatureState {
  // State
  items: FeatureItem[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed (as functions)
  selectedItem: () => FeatureItem | undefined;
  totalValue: () => number;

  // Actions
  addItem: (item: FeatureItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<FeatureItem>) => void;
  setSelected: (id: string | null) => void;
  reset: () => void;
}

// Initial state (for reset)
const initialState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

/**
 * Basic Store (no persistence)
 */
export const useFeatureStore = create<FeatureState>()((set, get) => ({
  ...initialState,

  // Computed values
  selectedItem: () => {
    const { items, selectedId } = get();
    return items.find((item) => item.id === selectedId);
  },

  totalValue: () => {
    return get().items.reduce((sum, item) => sum + item.value, 0);
  },

  // Actions
  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  setSelected: (id) => {
    set({ selectedId: id });
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Store with Persistence (saves to AsyncStorage)
 */
export const usePersistedFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      ...initialState,

      selectedItem: () => {
        const { items, selectedId } = get();
        return items.find((item) => item.id === selectedId);
      },

      totalValue: () => {
        return get().items.reduce((sum, item) => sum + item.value, 0);
      },

      addItem: (item) => {
        set((state) => ({ items: [...state.items, item] }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        }));
      },

      setSelected: (id) => set({ selectedId: id }),
      reset: () => set(initialState),
    }),
    {
      name: 'feature-storage', // Storage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        items: state.items,
        selectedId: state.selectedId,
      }),
    }
  )
);

/**
 * Store with Immer (for complex nested updates)
 */
interface NestedState {
  data: {
    items: FeatureItem[];
    meta: {
      lastUpdated: number | null;
      version: number;
    };
  };
  updateItemName: (id: string, name: string) => void;
  incrementVersion: () => void;
}

export const useImmerStore = create<NestedState>()(
  immer((set) => ({
    data: {
      items: [],
      meta: {
        lastUpdated: null,
        version: 1,
      },
    },

    // Immer allows direct mutations
    updateItemName: (id, name) => {
      set((state) => {
        const item = state.data.items.find((i) => i.id === id);
        if (item) {
          item.name = name;
          state.data.meta.lastUpdated = Date.now();
        }
      });
    },

    incrementVersion: () => {
      set((state) => {
        state.data.meta.version += 1;
      });
    },
  }))
);

/**
 * Store with Async Actions
 */
interface AsyncState {
  data: FeatureItem[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useAsyncStore = create<AsyncState>()((set) => ({
  data: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      set({ data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },
}));

/**
 * Subscribing to store changes (outside React)
 */
// useFeatureStore.subscribe(
//   (state) => state.items,
//   (items, prevItems) => {
//     console.log('Items changed:', items.length);
//   }
// );
