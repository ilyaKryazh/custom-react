import { describe, it, expect, beforeEach } from 'vitest';
import { render, createElement } from '../src/index';
import { HTMLelement } from '../src/tree-types';

describe('render function', () => {
  let rootElement: HTMLElement;

  beforeEach(() => {
    // Create a fresh root element for each test
    rootElement = document.createElement('div');
    rootElement.innerHTML = ''; // Clear any existing content
  });

  describe('string rendering', () => {
    it('should render a simple string as text node', () => {
      const text = 'Hello World';
      render(text, rootElement);

      expect(rootElement.textContent).toBe('Hello World');
      expect(rootElement.childNodes.length).toBe(1);
      expect(rootElement.firstChild?.nodeType).toBe(Node.TEXT_NODE);
    });

    it('should render empty string', () => {
      render('', rootElement);

      expect(rootElement.textContent).toBe('');
      expect(rootElement.childNodes.length).toBe(1);
    });
  });

  describe('HTML element rendering', () => {
    it('should render a simple HTML element', () => {
      const element: HTMLelement = {
        type: 'div',
        props: null,
        childrens: [],
      };

      render(element, rootElement);

      expect(rootElement.children.length).toBe(1);
      expect(rootElement.firstElementChild?.tagName).toBe('DIV');
    });

    it('should render HTML element with text content', () => {
      const element: HTMLelement = {
        type: 'p',
        props: null,
        childrens: ['Hello World'],
      };

      render(element, rootElement);

      expect(rootElement.children.length).toBe(1);
      expect(rootElement.firstElementChild?.tagName).toBe('P');
      expect(rootElement.firstElementChild?.textContent).toBe('Hello World');
    });

    it('should render HTML element with props/attributes', () => {
      const element: HTMLelement = {
        type: 'div',
        props: {
          id: 'test-id',
          class: 'test-class',
          'data-test': 'test-value',
        },
        childrens: [],
      };

      render(element, rootElement);

      const renderedElement = rootElement.firstElementChild as HTMLElement;
      expect(renderedElement.id).toBe('test-id');
      expect(renderedElement.className).toBe('test-class');
      expect(renderedElement.getAttribute('data-test')).toBe('test-value');
    });

    it('should render HTML element with numeric and boolean props', () => {
      const element: HTMLelement = {
        type: 'input',
        props: {
          value: 42,
          disabled: true,
          checked: false,
        },
        childrens: [],
      };

      render(element, rootElement);

      const renderedElement = rootElement.firstElementChild as HTMLInputElement;
      expect(renderedElement.getAttribute('value')).toBe('42');
      expect(renderedElement.getAttribute('disabled')).toBe('true');
      expect(renderedElement.getAttribute('checked')).toBe('false');
    });

    it('should render nested HTML elements', () => {
      const element: HTMLelement = {
        type: 'div',
        props: { id: 'parent' },
        childrens: [
          {
            type: 'span',
            props: { id: 'child' },
            childrens: ['Nested text'],
          },
        ],
      };

      render(element, rootElement);

      const parent = rootElement.firstElementChild as HTMLElement;
      const child = parent.firstElementChild as HTMLElement;

      expect(parent.id).toBe('parent');
      expect(child.tagName).toBe('SPAN');
      expect(child.id).toBe('child');
      expect(child.textContent).toBe('Nested text');
    });
  });

  describe('function component rendering', () => {
    it('should render function component', () => {
      const MyComponent = (props: any) => ({
        type: 'div',
        props: { id: props.id },
        childrens: [props.children],
      });

      const element: HTMLelement = {
        type: MyComponent,
        props: { id: 'component-id', children: 'Component content' },
        childrens: [],
      };

      render(element, rootElement);

      const renderedElement = rootElement.firstElementChild as HTMLElement;
      expect(renderedElement.tagName).toBe('DIV');
      expect(renderedElement.id).toBe('component-id');
      expect(renderedElement.textContent).toBe('Component content');
    });

    it('should render function component that returns string', () => {
      const TextComponent = () => 'Function component text';

      const element: HTMLelement = {
        type: TextComponent,
        props: {},
        childrens: [],
      };

      render(element, rootElement);

      expect(rootElement.textContent).toBe('Function component text');
    });

    it('should render function component that returns array', () => {
      const ListComponent = () => [
        { type: 'li', props: null, childrens: ['Item 1'] },
        { type: 'li', props: null, childrens: ['Item 2'] },
      ];

      const element: HTMLelement = {
        type: ListComponent,
        props: {},
        childrens: [],
      };

      render(element, rootElement);

      expect(rootElement.children.length).toBe(2);
      expect(rootElement.children[0].tagName).toBe('LI');
      expect(rootElement.children[0].textContent).toBe('Item 1');
      expect(rootElement.children[1].tagName).toBe('LI');
      expect(rootElement.children[1].textContent).toBe('Item 2');
    });
  });

  describe('array rendering', () => {
    it('should render array of strings', () => {
      const elements = ['Hello', ' ', 'World'];

      render(elements, rootElement);

      expect(rootElement.textContent).toBe('Hello World');
      expect(rootElement.childNodes.length).toBe(3);
    });

    it('should render array of HTML elements', () => {
      const elements: HTMLelement[] = [
        { type: 'h1', props: null, childrens: ['Title'] },
        { type: 'p', props: null, childrens: ['Paragraph'] },
      ];

      render(elements, rootElement);

      expect(rootElement.children.length).toBe(2);
      expect(rootElement.children[0].tagName).toBe('H1');
      expect(rootElement.children[0].textContent).toBe('Title');
      expect(rootElement.children[1].tagName).toBe('P');
      expect(rootElement.children[1].textContent).toBe('Paragraph');
    });

    it('should render mixed array of strings and elements', () => {
      const elements: (string | HTMLelement)[] = [
        'Start ',
        { type: 'strong', props: null, childrens: ['bold'] },
        ' end',
      ];

      render(elements, rootElement);

      expect(rootElement.textContent).toBe('Start bold end');
      expect(rootElement.childNodes.length).toBe(3);
      expect(rootElement.children.length).toBe(1);
      expect(rootElement.children[0].tagName).toBe('STRONG');
    });

    it('should render empty array', () => {
      render([], rootElement);

      expect(rootElement.childNodes.length).toBe(0);
    });
  });

  describe('complex nested structures', () => {
    it('should render deeply nested elements', () => {
      const element: HTMLelement = {
        type: 'div',
        props: { id: 'level1' },
        childrens: [
          {
            type: 'div',
            props: { id: 'level2' },
            childrens: [
              {
                type: 'span',
                props: { id: 'level3' },
                childrens: ['Deep text'],
              },
            ],
          },
        ],
      };

      render(element, rootElement);

      const level1 = rootElement.firstElementChild as HTMLElement;
      const level2 = level1.firstElementChild as HTMLElement;
      const level3 = level2.firstElementChild as HTMLElement;

      expect(level1.id).toBe('level1');
      expect(level2.id).toBe('level2');
      expect(level3.id).toBe('level3');
      expect(level3.textContent).toBe('Deep text');
    });

    it('should render function component with nested elements', () => {
      const CardComponent = (props: any) => ({
        type: 'div',
        props: { class: 'card' },
        childrens: [
          { type: 'h2', props: null, childrens: [props.title] },
          { type: 'p', props: null, childrens: [props.content] },
        ],
      });

      const element: HTMLelement = {
        type: CardComponent,
        props: {
          title: 'Card Title',
          content: 'Card content with multiple words',
        },
        childrens: [],
      };

      render(element, rootElement);

      const card = rootElement.firstElementChild as HTMLElement;
      expect(card.className).toBe('card');
      expect(card.children[0].tagName).toBe('H2');
      expect(card.children[0].textContent).toBe('Card Title');
      expect(card.children[1].tagName).toBe('P');
      expect(card.children[1].textContent).toBe(
        'Card content with multiple words'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined props gracefully', () => {
      const element: HTMLelement = {
        type: 'div',
        props: null,
        childrens: ['Content'],
      };

      expect(() => render(element, rootElement)).not.toThrow();
      expect(rootElement.firstElementChild?.textContent).toBe('Content');
    });

    it('should handle empty children array', () => {
      const element: HTMLelement = {
        type: 'div',
        props: { id: 'empty' },
        childrens: [],
      };

      render(element, rootElement);

      expect(rootElement.firstElementChild?.id).toBe('empty');
      expect(rootElement.firstElementChild?.childNodes.length).toBe(0);
    });

    it('should handle undefined children', () => {
      const element: HTMLelement = {
        type: 'div',
        props: { id: 'no-children' },
        // childrens is undefined
      };

      expect(() => render(element, rootElement)).not.toThrow();
      expect(rootElement.firstElementChild?.id).toBe('no-children');
    });
  });
});
