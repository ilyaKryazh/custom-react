import { rerender } from "../index";

// Hook registry system
interface HookInstance {
  type: string;
  value: any;
  setter?: Function;
}

let hookRegistry: Map<string, HookInstance[]> = new Map();
let currentComponentId: string | null = null;
let hookIndex = 0;

// Hook system functions
export function setCurrentComponentForHooks(componentId: string | null) {
  currentComponentId = componentId;
}

export function getCurrentComponentId(): string | null {
  return currentComponentId;
}

export function getHookRegistry(): Map<string, HookInstance[]> {
  return hookRegistry;
}

export function getCurrentHooks(): HookInstance[] {
  if (!currentComponentId) return [];
  return hookRegistry.get(currentComponentId) || [];
}

export function setCurrentHooks(hooks: HookInstance[]) {
  if (!currentComponentId) return;
  hookRegistry.set(currentComponentId, hooks);
}

export function getCurrentHookIndex(): number {
  return hookIndex;
}

export function incrementHookIndex(): void {
  hookIndex++;
}

export function resetHookIndex(): void {
  hookIndex = 0;
}

export function cleanupHooks(): void {
  hookRegistry.clear();
  currentComponentId = null;
  hookIndex = 0;
}

// Generic hook creator
export function createHook<T>(
  hookType: string,
  initialValue: T,
  hookFactory: (value: T, setValue: (value: T) => void) => [T, (value: T) => void]
): [T, (value: T) => void] {
  const currentHooks = getCurrentHooks();
  const currentIndex = getCurrentHookIndex();

  // Initialize hook if it doesn't exist
  if (!currentHooks[currentIndex]) {
    const setValue = (value: T) => {
      const newValue = (typeof value === 'function') ? (value as (prev: T) => T)(currentHooks[currentIndex].value) : value;
      currentHooks[currentIndex].value = newValue;
      setCurrentHooks(currentHooks);
      rerender();
      return newValue;
    };

    currentHooks[currentIndex] = {
      type: hookType,
      value: initialValue,
      setter: setValue as (value: T) => void
    };
    setCurrentHooks(currentHooks);
  }

  incrementHookIndex();
  return [currentHooks[currentIndex].value, currentHooks[currentIndex].setter!];
}

// Updated useState using the generic system
export const useState = <T>(value: T) => {
  return createHook('useState', value, (currentValue, setValue) => {
    return [currentValue, setValue];
  });
}

export const startRender = () => {
  resetHookIndex();
}