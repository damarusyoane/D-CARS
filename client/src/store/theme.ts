import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

// Function to get the system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default to light if matchMedia is not available
};

// Create the theme store with persist middleware
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system', // Default to system preference
      resolvedTheme: getSystemTheme(),
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
        set({ 
          theme: newTheme,
          resolvedTheme: newTheme === 'system' ? getSystemTheme() : newTheme
        });
      },
      setTheme: (theme) => set({ 
        theme,
        resolvedTheme: theme === 'system' ? getSystemTheme() : theme
      }),
    }),
    {
      name: 'd-cars-theme',
      partialize: (state) => ({ theme: state.theme }), // Only persist the theme setting
    }
  )
);