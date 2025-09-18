import { HTMLelement, HTMLprop } from './tree-types';

export function createElement(
  type: string | Function,
  props: HTMLprop | null,
  childrens?: any
): HTMLelement {
  if (typeof type === 'function') {
    const executeFunc = type(props);
    return executeFunc;
  } else {
    return {
      type,
      props,
      childrens,
    };
  }
}

export function render(
  elements: string | (HTMLelement | string)[],
  root: HTMLElement
) {
  if (Array.isArray(elements)) {
    for (const elem of elements) {
      if (typeof elem === 'object') {
        const element = document.createElement(elem.type);
        root.appendChild(element);
        if (elem.childrens) {
          render(elem.childrens, element);
        }
      } else {
        root.appendChild(document.createTextNode(elem));
      }
    }
  } else if (typeof elements === 'string') {
    root.appendChild(document.createTextNode(elements));
  }
}
