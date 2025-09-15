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

export function render(elements: HTMLelement[]) {}
