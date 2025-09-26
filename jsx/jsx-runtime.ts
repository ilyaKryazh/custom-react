// Simple JSX runtime implementation
import { createElement } from '../src/index';

export function jsx(type: any, props: any, key?: any) {
  // Extract children from props
  const { children, ...htmlProps } = props || {};

  // Normalize children
  let normalizedChildren: (string | any)[] = [];
  if (children !== undefined) {
    if (Array.isArray(children)) {
      normalizedChildren = children;
    } else {
      normalizedChildren = [children];
    }
  }

  // Call createElement with type, HTML props (without children), and children as separate arguments
  return createElement(type, htmlProps, ...normalizedChildren);
}

export function jsxs(type: any, props: any, key?: any) {
  // Same as jsx but for multiple children - jsx already handles arrays properly
  return jsx(type, props, key);
}

// jsxDEV is used in development mode
export function jsxDEV(type: any, props: any, key?: any, isStaticChildren?: boolean, source?: any, self?: any) {
  // For development, we can add additional debugging info if needed
  // For now, just use the same logic as jsx
  return jsx(type, props, key);
}

export function Fragment(props: any) {
  return props.children;
}

// JSX namespace for TypeScript
export namespace JSX {
  export interface Element {
    type: any;
    props: any;
    key?: any;
    $$typeof: symbol;
  }

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicElements {
    [elemName: string]: any;
  }
}
