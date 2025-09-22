import { vNode, HTMLprop } from './tree-types';

export var prevNode: null | string | vNode | (vNode | string)[] = null;

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
    root.appendChild(createNode(elements));
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
      if (old_Node !== new_Node && domNode.nodeType === Node.TEXT_NODE) {
        domNode.textContent = new_Node;
      }
      continue;
    }

    if (typeof old_Node === 'string' && typeof new_Node === 'object') {
      parent.replaceChild(createNode(new_Node), domNode);
      continue;
    }

    if (typeof old_Node === 'object' && typeof new_Node === 'string') {
      if (typeof old_Node.type === 'function') {
        const executed = old_Node.type(old_Node.props || {});
        diff(parent, executed, new_Node);
        continue;
      }

      parent.replaceChild(document.createTextNode(new_Node), domNode);
      continue;
    }

    if (typeof old_Node === 'object' && typeof new_Node === 'object') {
      if (old_Node.type !== new_Node.type) {
        parent.replaceChild(createNode(new_Node), domNode);
        continue;
      }

      if (typeof new_Node.type === 'function') {
        const executed = new_Node.type(new_Node.props || {});
        diff(parent, old_Node, executed);
        continue;
      }

      if (typeof new_Node.type === 'string') {
        const el = domNode as HTMLElement;

        updateProps(el, old_Node.props || {}, new_Node.props || {});

        diff(el, old_Node.childrens, new_Node.childrens);
      }
    }
  }
}

function createNode(
  vNode: vNode | string | (string | vNode)[]
): Node | DocumentFragment {
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    for (const node of vNode) {
      fragment.appendChild(createNode(node));
    }
    return fragment;
  }

  if (typeof vNode === 'string') {
    return document.createTextNode(vNode);
  }

  if (typeof vNode.type === 'function') {
    return createNode(vNode.type(vNode.props || {}));
  }

  const el = document.createElement(vNode.type);
  if (vNode.props) {
    for (const [key, value] of Object.entries(vNode.props)) {
      el.setAttribute(key, String(value));
    }
  }

  if (vNode.childrens) {
    vNode.childrens.forEach(child => {
      el.appendChild(createNode(child));
    });
  }

  return el;
}

function updateProps(
  el: HTMLElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) {
  for (const key in oldProps) {
    if (!(key in oldProps)) {
      el.removeAttribute(key);
    }
  }

  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      el.setAttribute(key, String(newProps[key]));
    }
  }
}
