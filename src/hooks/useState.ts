import { createHook } from './createHook';

// useState hook implementation
export const useState = <T>(value: T) => {
  return createHook('useState', value, (currentValue, setValue) => {
    return [currentValue, setValue];
  });
};
