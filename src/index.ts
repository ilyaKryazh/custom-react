import { HTMLelement, HTMLprop } from './tree-types';

export function createElement(
  type: string | Function,
  props: HTMLprop | null,
  ...childrens: (string | HTMLelement)[]
): HTMLelement {
  return {
    type,
    props,
    childrens,
  };
}

export function render(
  elements: string | HTMLelement | (HTMLelement | string)[],
  root: HTMLElement
) {
  if (Array.isArray(elements)) {
    for (const elem of elements) {
      render(elem, root);
    }
  } else if (typeof elements === 'object') {
    if (typeof elements.type === 'function') {
      const executed = elements.type(elements.props);
      render(executed, root);
    } else if (typeof elements.type === 'string') {
      const element = document.createElement(elements.type);
      if (elements.props) {
        for (const key in elements.props) {
          if (elements.props.hasOwnProperty(key)) {
            const elem = String(elements.props[key]);
            element.setAttribute(key, elem);
          }
        }
      }
      root.appendChild(element);
      if (elements.childrens) {
        render(elements.childrens, element);
      }
    }
  } else if (typeof elements === 'string') {
    root.appendChild(document.createTextNode(elements));
  }
}
