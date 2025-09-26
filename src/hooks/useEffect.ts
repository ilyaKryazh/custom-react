import { createHook } from './useState';

// useEffect hook implementation
export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  return createHook('useEffect', { effect, deps }, (currentValue, setValue) => {
    // This is a simplified useEffect - in a real implementation,
    // you'd want to track dependencies and cleanup functions
    const runEffect = () => {
      const cleanup = effect();
      if (cleanup) {
        // Store cleanup function for later execution
        setValue({ ...currentValue, cleanup });
      }
    };

    return [currentValue, runEffect];
  });
}

// useRef hook implementation
export function useRef<T>(initialValue: T) {
  return createHook('useRef', { current: initialValue }, (currentValue, setValue) => {
    const ref = {
      get current() {
        return currentValue.current;
      },
      set current(value: T) {
        setValue({ current: value });
      }
    };

    return [ref, () => {}]; // useRef doesn't need a setter
  });
}
