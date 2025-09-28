import { vNode } from './tree-types';
import {
  ComponentInstance,
  componentRegistry,
  componentStack,
  HookContextInstance,
  HookInstance,
  rerender,
} from './index';

export function createNode(
  vNode:
    | vNode
    | string
    | number
    | boolean
    | (string | number | boolean | vNode)[]
): Node | DocumentFragment {
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    for (const node of vNode) {
      fragment.appendChild(createNode(node));
    }
    return fragment;
  }

  if (
    typeof vNode === 'string' ||
    typeof vNode === 'number' ||
    typeof vNode === 'boolean'
  ) {
    return document.createTextNode(vNode.toString());
  }

  if (vNode == null) {
    return document.createTextNode('');
  }

  if (typeof vNode.type === 'function') {
    return createNode(vNode.type(vNode.props || {}));
  }

  const el = document.createElement(vNode.type);
  if (vNode.props) {
    for (const [key, value] of Object.entries(vNode.props)) {
      if (isEventProp(key)) {
        el.addEventListener(
          getEventName(getHTMLAttributeName(key)),
          value as unknown as EventListener
        );
      } else {
        if (typeof value === 'boolean') {
          value
            ? el.setAttribute(getHTMLAttributeName(key), '')
            : el.removeAttribute(getHTMLAttributeName(key));
        } else {
            el.setAttribute(getHTMLAttributeName(key), String(value));
        }
      }
    }
  }

  if (vNode.childrens) {
    vNode.childrens.forEach(child => {
      el.appendChild(createNode(child));
    });
  }

  return el;
}

export function updateProps(
  el: HTMLElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) {
  if (!el) return;

  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (isEventProp(key)) {
        el.removeEventListener(
          getEventName(getHTMLAttributeName(key)),
          oldProps[key]
        );
      } else {
        el.removeAttribute(key);
      }
    }
  }

  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      if (isEventProp(key)) {
        // Remove old event listener if it exists
        if (oldProps[key]) {
          el.removeEventListener(
            getEventName(getHTMLAttributeName(key)),
            oldProps[key]
          );
        }
        // Add new event listener
        el.addEventListener(
          getEventName(getHTMLAttributeName(key)),
          newProps[key]
        );
      } else {
        if (typeof newProps[key] === 'boolean') {
          newProps[key]
            ? el.setAttribute(getHTMLAttributeName(key), '')
            : el.removeAttribute(getHTMLAttributeName(key));
        } else {
          el.setAttribute(getHTMLAttributeName(key), String(newProps[key]));
        }
      }
    }
  }
}

function getHTMLAttributeName(jsxPropName: string): string {
  const propMap: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    onClick: 'onclick',
    onChange: 'onchange',
    onSubmit: 'onsubmit',
    onMouseOver: 'onmouseover',
    onMouseOut: 'onmouseout',
    onFocus: 'onfocus',
    onBlur: 'onblur',
    onKeyDown: 'onkeydown',
    onKeyUp: 'onkeyup',
    onKeyPress: 'onkeypress',
    onLoad: 'onload',
    onError: 'onerror',
    onScroll: 'onscroll',
    onResize: 'onresize',
  };

  return propMap[jsxPropName] || jsxPropName;
}

function isEventProp(propName: string): boolean {
  return propName.startsWith('on') && propName.length > 2;
}

function getEventName(propName: string): string {
  return propName.slice(2).toLowerCase();
}
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

export function getCurrentComponent(
  currentComponentId: string
): ComponentInstance | null {
  return componentRegistry.get(currentComponentId) || null;
}

export function generateHookId(): string {
  return `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function registerHook(
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

export function startRender(componentId: string) {
  const currentComponent = getCurrentComponent(componentId);
  if (!currentComponent) {
    throw new Error('Cannot start render without a component context');
  }
  currentComponent.hooksIndex = 0;
}

