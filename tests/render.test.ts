import { test, expect, beforeEach, afterEach } from 'vitest';
import { render } from '../src/index.ts';
import { HTMLelement } from '../src/tree-types.ts';

// Mock DOM environment for testing
let mockRoot: HTMLElement;

beforeEach(() => {
  // Create a mock root element for each test
  mockRoot = document.createElement('div');
  document.body.appendChild(mockRoot);
});

afterEach(() => {
  // Clean up after each test
  if (mockRoot && mockRoot.parentNode) {
    mockRoot.parentNode.removeChild(mockRoot);
  }
});

test('render should handle string input', () => {
  const stringInput = 'Hello World';

  render(stringInput, mockRoot);

  // Since render doesn't handle strings, the root should remain empty
  expect(mockRoot.children.length).toBe(0);
});

test('render should create single element', () => {
  const element: HTMLelement = {
    type: 'div',
    props: null,
    childrens: 'Hello World',
  };

  render([element], mockRoot);

  expect(mockRoot.children.length).toBe(1);
  expect(mockRoot.children[0].tagName).toBe('DIV');
});

test('render should create multiple elements', () => {
  const elements: HTMLelement[] = [
    {
      type: 'div',
      props: null,
      childrens: 'First div',
    },
    {
      type: 'span',
      props: null,
      childrens: 'Second span',
    },
    {
      type: 'p',
      props: null,
      childrens: 'Third paragraph',
    },
  ];

  render(elements, mockRoot);

  expect(mockRoot.children.length).toBe(3);
  expect(mockRoot.children[0].tagName).toBe('DIV');
  expect(mockRoot.children[1].tagName).toBe('SPAN');
  expect(mockRoot.children[2].tagName).toBe('P');
});

test('render should handle nested elements', () => {
  const element: HTMLelement = {
    type: 'div',
    props: null,
    childrens: [
      {
        type: 'span',
        props: null,
        childrens: 'Nested span',
      },
      {
        type: 'p',
        props: null,
        childrens: 'Nested paragraph',
      },
    ],
  };

  render([element], mockRoot);

  expect(mockRoot.children.length).toBe(1);
  const parentDiv = mockRoot.children[0] as HTMLElement;
  expect(parentDiv.tagName).toBe('DIV');
  expect(parentDiv.children.length).toBe(2);
  expect(parentDiv.children[0].tagName).toBe('SPAN');
  expect(parentDiv.children[1].tagName).toBe('P');
});

test('render should handle deeply nested elements', () => {
  const element: HTMLelement = {
    type: 'div',
    props: null,
    childrens: [
      {
        type: 'div',
        props: null,
        childrens: [
          {
            type: 'span',
            props: null,
            childrens: 'Deeply nested',
          },
        ],
      },
    ],
  };

  render([element], mockRoot);

  expect(mockRoot.children.length).toBe(1);
  const outerDiv = mockRoot.children[0] as HTMLElement;
  expect(outerDiv.tagName).toBe('DIV');
  expect(outerDiv.children.length).toBe(1);

  const innerDiv = outerDiv.children[0] as HTMLElement;
  expect(innerDiv.tagName).toBe('DIV');
  expect(innerDiv.children.length).toBe(1);

  const span = innerDiv.children[0] as HTMLElement;
  expect(span.tagName).toBe('SPAN');
});

test('render should handle elements with props', () => {
  const element: HTMLelement = {
    type: 'div',
    props: { id: 'test-id', className: 'test-class' },
    childrens: 'Element with props',
  };

  render([element], mockRoot);

  expect(mockRoot.children.length).toBe(1);
  const div = mockRoot.children[0] as HTMLElement;
  expect(div.tagName).toBe('DIV');
  // Note: The current render function doesn't set props, so this test documents current behavior
  // In a real implementation, you'd want to set the props on the created element
});

test('render should handle mixed children types', () => {
  const element: HTMLelement = {
    type: 'div',
    props: null,
    childrens: [
      {
        type: 'span',
        props: null,
        childrens: 'Text child',
      },
      'String child',
    ],
  };

  render([element], mockRoot);

  expect(mockRoot.children.length).toBe(1);
  const parentDiv = mockRoot.children[0] as HTMLElement;
  console.log('parentDiv', mockRoot.innerHTML);
  expect(parentDiv.tagName).toBe('DIV');
  expect(parentDiv.children.length).toBe(1); // Both span element and text node
  expect(parentDiv.children[0].tagName).toBe('SPAN');
  expect(parentDiv.children[0].innerHTML).toBe('Text child');
});

test('render should handle empty array', () => {
  render([], mockRoot);

  expect(mockRoot.children.length).toBe(0);
});

test('render should handle elements with no children', () => {
  const element: HTMLelement = {
    type: 'br',
    props: null,
    childrens: undefined,
  };

  render([element], mockRoot);

  expect(mockRoot.children.length).toBe(1);
  expect(mockRoot.children[0].tagName).toBe('BR');
});
