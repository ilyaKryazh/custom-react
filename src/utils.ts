import { vNode } from "./tree-types";

export function createNode(
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

  if (vNode == null) {
    return document.createTextNode('');
  }

  if (typeof vNode.type === 'function') {
    return createNode(vNode.type(vNode.props || {}));
  }

  const el = document.createElement(vNode.type);
  if (vNode.props) {
    for (const [key, value] of Object.entries(vNode.props)) {
      el.setAttribute(getHTMLAttributeName(key), String(value));
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
      el.removeAttribute(key);
    }
  }

  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      el.setAttribute(getHTMLAttributeName(key), String(newProps[key]));
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
