import {
  startRender,
  setCurrentComponentForHooks,
  cleanupHooks,
} from './hooks/useState';
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

// Component registry to track active components
interface ComponentInstance {
  id: string;
  component: Function;
  root: HTMLElement;
  elements: any;
}

let componentRegistry: Map<string, ComponentInstance> = new Map();
let currentComponentId: string | null = null;

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
  });
  return id;
}

function unregisterComponent(id: string): void {
  componentRegistry.delete(id);
  if (currentComponentId === id) {
    currentComponentId = null;
  }
}

function setCurrentComponent(id: string): void {
  currentComponentId = id;
  setCurrentComponentForHooks(id);
}

function getCurrentComponent(): ComponentInstance | null {
  if (!currentComponentId) return null;
  return componentRegistry.get(currentComponentId) || null;
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

export function rerender() {
  if (currentRoot === null) {
    throw new Error('Cannot rerender without a root element');
    return;
  }

  startRender();
  // Re-execute the component function to get new virtual DOM with updated state
  const currentComponent = getCurrentComponent();
  if (currentComponent) {
    const newElements = currentComponent.component();
    render(newElements, currentComponent.root);
  } else if (currentElements) {
    render(currentElements, currentRoot);
  }
}

// Public API for rendering components
export function renderComponent(component: Function, root: HTMLElement) {
  startRender();
  const elements = component();
  render(elements, root, component);
}

// Public API for rendering multiple components
export function renderMultipleComponents(
  components: Array<{ component: Function; root: HTMLElement }>
) {
  components.forEach(({ component, root }) => {
    renderComponent(component, root);
  });
}

// Cleanup function
export function cleanup() {
  componentRegistry.clear();
  currentComponentId = null;
  currentRoot = null;
  currentElements = null;
  prevNode = null;
  cleanupHooks();
}

// Export hooks
export { useState } from './hooks/useState';
export { useEffect, useRef } from './hooks/useEffect';
