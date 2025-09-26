import { vNode } from './tree-types';

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
        el.setAttribute(getHTMLAttributeName(key), String(value));
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
        el.setAttribute(getHTMLAttributeName(key), String(newProps[key]));
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
