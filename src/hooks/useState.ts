import {
  ComponentInstance,
  componentRegistry,
  componentStack,
  HookContextInstance,
  HookInstance,
  rerender,
} from '../index';

// Hook registry system

let hookRegistry: Map<string, HookInstance[]> = new Map();
let currentComponentId: string | null = null;
let hookIndex = 0;

export function getCurrentComponentId(): string | null {
  return componentStack.length > 0
    ? componentStack[componentStack.length - 1].id
    : null;
}

export function getHookRegistry(): Map<string, HookInstance[]> {
  return hookRegistry;
}

export function getCurrentHooks(
  id: string,
  currentComponentId: string
): HookInstance[] {
  return hookRegistry.get(currentComponentId) || [];
}

export function setCurrentHooks(hooks: HookInstance[]) {
  if (!currentComponentId) return;
  hookRegistry.set(currentComponentId, hooks);
}

export function getCurrentHookIndex(): number {
  return hookIndex;
}

export function incrementHookIndex(componentId: string): void {
  if (componentRegistry.has(componentId)) {
    const component = componentRegistry.get(componentId);
    if (component) {
      component.hooksIndex++;
    }
  }
}

export function resetComponentIndex(componentId: string): void {
  hookIndex = 0;
  currentComponentId = componentId;
  if (componentRegistry.has(componentId)) {
    const component = componentRegistry.get(componentId);
    if (component) {
      component.hooksIndex = 0;
    }
  }
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

// Updated useState using the generic system
export const useState = <T>(value: T) => {
  return createHook('useState', value, (currentValue, setValue) => {
    return [currentValue, setValue];
  });
};

export const startRender = (componentId: string) => {
  const currentComponent = getCurrentComponent(componentId);
  if (!currentComponent) {
    throw new Error('Cannot start render without a component context');
  }
  currentComponent.hooksIndex = 0;
};

function generateHookId(): string {
  return `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function registerHook(
  id: string,
  hookType: string,
  initialValue: any,
  hookFactory: (
    value: any,
    setValue: (value: any) => void
  ) => [any, (value: any) => void],
  currentComponentId: string
): HookInstance {
  const currentComponent = getCurrentComponent(currentComponentId);

  if (!currentComponent) {
    throw new Error('Cannot register hook without a component context');
  }

  currentComponent?.context?.set(id, {
    id,
    hook: { type: hookType, value: initialValue, setter: undefined },
  });

  if (!currentComponent) {
    throw new Error('Cannot register hook without a component context');
  }

  const context = currentComponent.context?.get(id);
  if (!context) {
    throw new Error('Cannot register hook without a component context');
  }

  return context.hook;
}

function getCurrentComponent(
  currentComponentId: string
): ComponentInstance | null {
  return componentRegistry.get(currentComponentId) || null;
}
