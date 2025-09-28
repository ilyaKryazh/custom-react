import { HookInstance } from '../index';
import {
  getCurrentComponentId,
  getCurrentComponent,
  incrementHookIndex,
  registerHook,
} from '../utils';
import { rerender } from '../index';

// Generic hook creator
export function createHook<T>(
  hookType: string,
  initialValue: T,
  hookFactory: (
    value: T,
    setValue: (value: T) => void
  ) => [T, (value: T) => void]
): [T, (value: T) => void] {
  const currentComponentId = getCurrentComponentId();
  if (!currentComponentId) {
    throw new Error('Cannot create hook without a component context');
  }

  const currentComponent = getCurrentComponent(currentComponentId);
  if (!currentComponent) {
    throw new Error('Cannot create hook without a component context');
  }

  // Use hook index instead of unique ID
  const hookIndex = currentComponent.hooksIndex;
  const hookId = `hook_${hookIndex}`;

  // Check if hook already exists (for re-renders)
  let currentHook = currentComponent.context?.get(hookId)?.hook;

  if (!currentHook) {
    // First render - create new hook
    currentHook = registerHook(
      hookId,
      hookType,
      initialValue,
      hookFactory,
      currentComponentId
    );
  }

  const setValue = (value: T) => {
    const newValue =
      typeof value === 'function'
        ? (value as (prev: T) => T)(currentHook.value)
        : value;
    currentHook.value = newValue;
    rerender(currentComponentId);
    return newValue;
  };

  currentHook.setter = setValue;

  incrementHookIndex(currentComponentId);
  return [currentHook.value, currentHook.setter];
}
