import { startRender, cleanupHooks } from './hooks/useState';
import { vNode, HTMLprop } from './tree-types';
import { createNode, updateProps } from './utils';

export var prevNode:
  | null
  | string
  | number
  | boolean
  | vNode
  | (vNode | string | number | boolean)[] = null;

let currentRoot: HTMLElement | null = null;
let currentElements:
  | string
  | number
  | boolean
  | vNode
  | (vNode | string | number | boolean)[]
  | null = null;

export interface HookInstance {
  type: string;
  value: any;
  setter?: (value: any) => void;
}

export interface HookContextInstance {
  id: string;
  hook: HookInstance;
}

// Component registry to track active components
export interface ComponentInstance {
  id: string;
  component: Function;
  root: HTMLElement;
  elements: any;
  hooksIndex: number;
  context?: Map<string, HookContextInstance>;
}

export let componentRegistry: Map<string, ComponentInstance> = new Map();
export let componentStack: Array<ComponentInstance> = [];

export function resetPrevNode() {
  prevNode = null;
}

// Internal functions for component management
function generateComponentId(): string {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function registerComponent(
  component: Function,
  root: HTMLElement,
  elements: any
): string {
  const id = generateComponentId();
  componentRegistry.set(id, {
    id,
    component,
    root,
    elements,
    context: new Map(),
    hooksIndex: 0,
  });
  return id;
}

function setCurrentComponent(id: string): void {
  const component = componentRegistry.get(id);
  if (!component) {
    throw new Error('Cannot set current component without a component context');
    return;
  }
  componentStack.push(component);
}

function getCurrentComponent(componentId: string): ComponentInstance | null {
  if (!componentId) return null;
  return componentRegistry.get(componentId) || null;
}

export function createElement(
  type: string | Function,
  props: HTMLprop | null,
  ...childrens: (string | vNode)[]
): vNode {
  return {
    type,
    props,
    childrens,
  };
}

export function render(
  elements:
    | string
    | number
    | boolean
    | vNode
    | (vNode | string | number | boolean)[],
  root: HTMLElement,
  component?: Function
) {
  if (prevNode === null) {
    if (elements == null) {
      // Don't render anything for null/undefined
      return;
    }
    const node = createNode(elements);
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // Append all children of the fragment
      while (node.firstChild) {
        root.appendChild(node.firstChild);
      }
    } else {
      root.appendChild(node);
    }
  } else {
    diff(root, prevNode, elements);
  }
  prevNode = elements;
  currentRoot = root;
  currentElements = elements;

  // Register component if provided
  if (component) {
    const componentId = registerComponent(component, root, elements);
    setCurrentComponent(componentId);
  }
}

export function diff(
  parent: HTMLElement,
  old_vNode?:
    | string
    | number
    | boolean
    | vNode
    | (vNode | string | number | boolean)[],
  new_vNode?:
    | string
    | number
    | boolean
    | vNode
    | (vNode | string | number | boolean)[]
) {
  const old_Arr = Array.isArray(old_vNode)
    ? old_vNode
    : old_vNode != null
      ? [old_vNode]
      : [];
  const new_Arr = Array.isArray(new_vNode)
    ? new_vNode
    : new_vNode != null
      ? [new_vNode]
      : [];

  let max = Math.max(old_Arr.length, new_Arr.length);

  for (let i = 0; i < max; i++) {
    const old_Node = old_Arr[i];
    const new_Node = new_Arr[i];
    const domNode = parent.childNodes[i];

    if (old_Node && new_Node == null) {
      if (domNode !== undefined) {
        parent.removeChild(domNode);
        i--;
        max--;
      }
      continue;
    }

    if (old_Node == null && new_Node) {
      const newNode = createNode(new_Node);
      if (domNode !== undefined) {
        parent.insertBefore(newNode, domNode);
      } else {
        parent.appendChild(newNode);
      }
      continue;
    }

    if (typeof old_Node === 'string' && typeof new_Node === 'string') {
      if (
        old_Node !== new_Node &&
        domNode &&
        domNode.nodeType === Node.TEXT_NODE
      ) {
        domNode.textContent = new_Node;
      }
      continue;
    }

    if (
      typeof old_Node === 'string' ||
      typeof old_Node === 'number' ||
      (typeof old_Node === 'boolean' && typeof new_Node === 'object')
    ) {
      if (domNode) {
        const newNode = createNode(new_Node);
        if (newNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          // Replace with the first child of the fragment, then append the rest
          const firstChild = newNode.firstChild;
          if (firstChild) {
            parent.replaceChild(firstChild, domNode);
            // Append remaining children
            while (newNode.firstChild) {
              parent.insertBefore(newNode.firstChild, firstChild.nextSibling);
            }
          }
        } else {
          parent.replaceChild(newNode, domNode);
        }
      }
      continue;
    }

    if (typeof old_Node === 'object' && typeof new_Node === 'string') {
      if (typeof old_Node.type === 'function') {
        const executed = old_Node.type(old_Node.props || {});
        diff(parent, executed, new_Node);
        continue;
      }

      if (domNode) {
        parent.replaceChild(document.createTextNode(new_Node), domNode);
      }
      continue;
    }

    if (typeof old_Node === 'object' && typeof new_Node === 'object') {
      if (old_Node.type !== new_Node.type) {
        if (domNode) {
          const newNode = createNode(new_Node);
          if (newNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            // Replace with the first child of the fragment, then append the rest
            const firstChild = newNode.firstChild;
            if (firstChild) {
              parent.replaceChild(firstChild, domNode);
              // Append remaining children
              while (newNode.firstChild) {
                parent.insertBefore(newNode.firstChild, firstChild.nextSibling);
              }
            }
          } else {
            parent.replaceChild(newNode, domNode);
          }
        }
        continue;
      }

      if (typeof new_Node.type === 'function') {
        const executed = new_Node.type(new_Node.props || {});
        diff(parent, old_Node, executed);
        continue;
      }

      if (typeof new_Node.type === 'string' && domNode) {
        const el = domNode as HTMLElement;

        updateProps(el, old_Node.props || {}, new_Node.props || {});

        diff(el, old_Node.childrens, new_Node.childrens);
      }
    }
  }
}

export function rerender(componentId: string) {
  if (currentRoot === null) {
    throw new Error('Cannot rerender without a root element');
    return;
  }

  if (!componentId) {
    throw new Error('Cannot rerender without a component context');
    return;
  }

  startRender(componentId);
  // Re-execute the component function to get new virtual DOM with updated state
  const currentComponent = getCurrentComponent(componentId);
  if (!currentComponent) {
    throw new Error('Cannot rerender without a component context');
    return;
  }

  // Set the component in the stack so hooks can access it
  setCurrentComponent(componentId);

  if (currentComponent) {
    const newElements = currentComponent.component();
    render(newElements, currentComponent.root);
  } else if (currentElements) {
    render(currentElements, currentRoot);
  }
}

// Public API for rendering components
export function renderComponent(
  componentFunction: Function,
  root: HTMLElement
) {
  // Register component first
  const componentId = registerComponent(componentFunction, root, null);
  setCurrentComponent(componentId);
  startRender(componentId);

  // Now execute the component function (hooks will have context)
  const elements = componentFunction();
  render(elements, root, componentFunction);
}

function getComponentContextId(context: HookContextInstance): string {
  return context.id || '';
}

// Cleanup function
export function cleanup() {
  componentRegistry.clear();
  componentStack = [];
  currentRoot = null;
  currentElements = null;
  prevNode = null;
  cleanupHooks();
}

export function pushComponent(component: ComponentInstance) {
  componentStack.push(component);
}

export function popComponent() {
  componentStack.pop();
}

// createRoot function - React 18 style root API
export function createRoot(container: HTMLElement) {
  return {
    render(component: Function) {
      // Clear the container
      container.innerHTML = '';

      // Reset global state
      resetPrevNode();
      currentRoot = container;
      currentElements = null;

      // Register and render the component
      const componentId = registerComponent(component, container, null);
      setCurrentComponent(componentId);
      startRender(componentId);

      // Execute the component function and render
      const elements = component();
      render(elements, container, component);
    }
  };
}

// Export hooks
export { useState } from './hooks/useState';
export { useEffect, useRef } from './hooks/useEffect';
