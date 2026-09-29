import { create } from 'zustand';

interface DemoModeState {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  toggleDemoMode: () => void;
}

export const useDemoModeStore = create<DemoModeState>((set) => ({
  isDemoMode: false,
  setDemoMode: (value: boolean) => set({ isDemoMode: value }),
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode }))
}));

export function useDemoMode() {
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode);
  const setDemoMode = useDemoModeStore((s) => s.setDemoMode);
  const toggleDemoMode = useDemoModeStore((s) => s.toggleDemoMode);

  return { isDemoMode, showDemoFeatures: isDemoMode, setDemoMode, toggleDemoMode };
}

useDemoMode.getState = useDemoModeStore.getState;
useDemoMode.setState = useDemoModeStore.setState;
useDemoMode.subscribe = useDemoModeStore.subscribe;

export default useDemoMode;

