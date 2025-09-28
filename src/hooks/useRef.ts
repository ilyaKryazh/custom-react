import { createHook } from './createHook';

// useRef hook implementation
export function useRef<T>(initialValue: T) {
  return createHook(
    'useRef',
    { current: initialValue },
    (currentValue, setValue) => {
      const ref = {
        get current() {
          return currentValue.current;
        },
        set current(value: T) {
          setValue({ current: value });
        },
      };

      return [ref, () => {}]; // useRef doesn't need a setter
    }
  );
}
