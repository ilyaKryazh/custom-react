import { vNode, HTMLprop } from './tree-types';
import { createNode, updateProps } from './utils';

export var prevNode: null | string | vNode | (vNode | string)[] = null;

export function resetPrevNode() {
  prevNode = null;
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
  elements: string | vNode | (vNode | string)[],
  root: HTMLElement
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
}

export function diff(
  parent: HTMLElement,
  old_vNode?: string | vNode | (vNode | string)[],
  new_vNode?: string | vNode | (vNode | string)[]
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

    if (typeof old_Node === 'string' && typeof new_Node === 'object') {
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
