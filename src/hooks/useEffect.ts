import { createHook } from './createHook';

// useEffect hook implementation
export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  return createHook('useEffect', { effect, deps }, (currentValue, setValue) => {
    // This is a simplified useEffect - in a real implementation,
    // you'd want to track dependencies and cleanup functions
    const runEffect = () => {
      const cleanup = effect();
      if (cleanup) {
        // Store cleanup function for later execution
        setValue({ ...currentValue, cleanup } as any);
      }
    };

    return [currentValue, runEffect];
  });
}

