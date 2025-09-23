import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { render, createElement, prevNode, resetPrevNode } from '../src/index';
import { vNode } from '../src/tree-types';

describe('Re-render and Partial Render Tests', () => {
  let rootElement: HTMLElement;

  beforeEach(() => {
    // Reset the prevNode state before each test
    resetPrevNode();
    // Create a fresh root element for each test
    rootElement = document.createElement('div');
    rootElement.innerHTML = '';
  });

  describe('Text Node Re-rendering', () => {
    it('should update text content on re-render', () => {
      // Initial render
      render('Hello World', rootElement);
      expect(rootElement.textContent).toBe('Hello World');

      // Re-render with different text
      render('Updated Text', rootElement);
      expect(rootElement.textContent).toBe('Updated Text');
      expect(rootElement.childNodes.length).toBe(1);
    });

    it('should handle text to empty string re-render', () => {
      render('Some text', rootElement);
      expect(rootElement.textContent).toBe('Some text');

      render('', rootElement);
      expect(rootElement.textContent).toBe('');
      expect(rootElement.childNodes.length).toBe(1);
    });

    it('should handle empty string to text re-render', () => {
      render('', rootElement);
      expect(rootElement.textContent).toBe('');

      render('New text', rootElement);
      expect(rootElement.textContent).toBe('New text');
    });
  });

  describe('Element Re-rendering', () => {
    it('should update element props on re-render', () => {
      const element1: vNode = {
        type: 'div',
        props: { id: 'old-id', class: 'old-class' },
        childrens: ['Old content'],
      };

      const element2: vNode = {
        type: 'div',
        props: { id: 'new-id', class: 'new-class' },
        childrens: ['New content'],
      };

      render(element1, rootElement);
      let div = rootElement.firstElementChild as HTMLElement;
      expect(div.id).toBe('old-id');
      expect(div.className).toBe('old-class');
      expect(div.textContent).toBe('Old content');

      render(element2, rootElement);
      div = rootElement.firstElementChild as HTMLElement;
      expect(div.id).toBe('new-id');
      expect(div.className).toBe('new-class');
      expect(div.textContent).toBe('New content');
    });

    it('should update element children on re-render', () => {
      const element1: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: null, childrens: ['First paragraph'] },
          { type: 'p', props: null, childrens: ['Second paragraph'] },
        ],
      };

      const element2: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: null, childrens: ['Updated first paragraph'] },
          { type: 'h1', props: null, childrens: ['New heading'] },
        ],
      };

      render(element1, rootElement);
      let container = rootElement.firstElementChild as HTMLElement;
      expect(container.children.length).toBe(2);
      expect(container.children[0].textContent).toBe('First paragraph');
      expect(container.children[1].textContent).toBe('Second paragraph');

      render(element2, rootElement);
      container = rootElement.firstElementChild as HTMLElement;
      expect(container.children.length).toBe(2);
      expect(container.children[0].textContent).toBe('Updated first paragraph');
      expect(container.children[1].textContent).toBe('New heading');
      expect(container.children[1].tagName).toBe('H1');
    });

    it('should handle element type change on re-render', () => {
      const element1: vNode = {
        type: 'div',
        props: { id: 'test' },
        childrens: ['Div content'],
      };

      const element2: vNode = {
        type: 'span',
        props: { id: 'test' },
        childrens: ['Span content'],
      };

      render(element1, rootElement);
      expect(rootElement.firstElementChild?.tagName).toBe('DIV');

      render(element2, rootElement);
      expect(rootElement.firstElementChild?.tagName).toBe('SPAN');
      expect(rootElement.firstElementChild?.textContent).toBe('Span content');
    });
  });

  describe('Array Re-rendering', () => {
    it('should update array of strings on re-render', () => {
      const array1 = ['Hello', ' ', 'World'];
      const array2 = ['Goodbye', ' ', 'Universe'];

      render(array1, rootElement);
      expect(rootElement.textContent).toBe('Hello World');
      expect(rootElement.childNodes.length).toBe(3);

      render(array2, rootElement);
      expect(rootElement.textContent).toBe('Goodbye Universe');
      expect(rootElement.childNodes.length).toBe(3);
    });

    it('should handle array length changes on re-render', () => {
      const array1 = ['Item 1', 'Item 2', 'Item 3'];
      const array2 = ['Item A', 'Item B'];

      render(array1, rootElement);
      expect(rootElement.childNodes.length).toBe(3);
      expect(rootElement.textContent).toBe('Item 1Item 2Item 3');

      render(array2, rootElement);
      expect(rootElement.childNodes.length).toBe(2);
      expect(rootElement.textContent).toBe('Item AItem B');
    });

    it('should handle array to single element re-render', () => {
      const array = [
        { type: 'div', props: { id: 'div1' }, childrens: ['Div 1'] },
        { type: 'div', props: { id: 'div2' }, childrens: ['Div 2'] },
      ];
      const singleElement: vNode = {
        type: 'span',
        props: { id: 'single' },
        childrens: ['Single element'],
      };

      render(array, rootElement);
      expect(rootElement.children.length).toBe(2);

      render(singleElement, rootElement);
      expect(rootElement.children.length).toBe(1);
      expect(rootElement.firstElementChild?.tagName).toBe('SPAN');
    });

    it('should handle single element to array re-render', () => {
      const singleElement: vNode = {
        type: 'div',
        props: { id: 'single' },
        childrens: ['Single element'],
      };
      const array = [
        { type: 'span', props: { id: 'span1' }, childrens: ['Span 1'] },
        { type: 'span', props: { id: 'span2' }, childrens: ['Span 2'] },
      ];

      render(singleElement, rootElement);
      expect(rootElement.children.length).toBe(1);

      render(array, rootElement);
      expect(rootElement.children.length).toBe(2);
      expect(rootElement.children[0].tagName).toBe('SPAN');
    });
  });

  describe('Function Component Re-rendering', () => {
    it('should re-render function component with new props', () => {
      const Counter = (props: { count: number }) => ({
        type: 'div',
        props: { id: 'counter' },
        childrens: [`Count: ${props.count}`],
      });

      const element1: vNode = {
        type: Counter,
        props: { count: 0 },
        childrens: [],
      };

      const element2: vNode = {
        type: Counter,
        props: { count: 5 },
        childrens: [],
      };

      render(element1, rootElement);
      expect(rootElement.textContent).toBe('Count: 0');

      render(element2, rootElement);
      expect(rootElement.textContent).toBe('Count: 5');
    });

    it('should handle function component type change', () => {
      const Component1 = () => ({
        type: 'div',
        props: { id: 'comp1' },
        childrens: ['Component 1'],
      });

      const Component2 = () => ({
        type: 'span',
        props: { id: 'comp2' },
        childrens: ['Component 2'],
      });

      const element1: vNode = {
        type: Component1,
        props: {},
        childrens: [],
      };

      const element2: vNode = {
        type: Component2,
        props: {},
        childrens: [],
      };

      render(element1, rootElement);
      expect(rootElement.firstElementChild?.tagName).toBe('DIV');
      expect(rootElement.textContent).toBe('Component 1');

      render(element2, rootElement);
      expect(rootElement.firstElementChild?.tagName).toBe('SPAN');
      expect(rootElement.textContent).toBe('Component 2');
    });
  });

  describe('Partial Render Tests', () => {
    it('should add new elements to existing structure', () => {
      const initial: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: null, childrens: ['Existing paragraph'] },
        ],
      };

      const updated: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: null, childrens: ['Existing paragraph'] },
          { type: 'p', props: null, childrens: ['New paragraph'] },
          { type: 'span', props: null, childrens: ['New span'] },
        ],
      };

      render(initial, rootElement);
      let container = rootElement.firstElementChild as HTMLElement;
      expect(container.children.length).toBe(1);

      render(updated, rootElement);
      container = rootElement.firstElementChild as HTMLElement;
      expect(container.children.length).toBe(3);
      expect(container.children[0].textContent).toBe('Existing paragraph');
      expect(container.children[1].textContent).toBe('New paragraph');
      expect(container.children[2].textContent).toBe('New span');
    });

    it('should remove elements from existing structure', () => {
      const initial: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: null, childrens: ['Keep this'] },
          { type: 'p', props: null, childrens: ['Remove this'] },
          { type: 'span', props: null, childrens: ['Also remove'] },
        ],
      };

      const updated: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: null, childrens: ['Keep this'] },
        ],
      };

      render(initial, rootElement);
      let container = rootElement.firstElementChild as HTMLElement;
      expect(container.children.length).toBe(3);

      render(updated, rootElement);
      container = rootElement.firstElementChild as HTMLElement;
      expect(container.children.length).toBe(1);
      expect(container.children[0].textContent).toBe('Keep this');
    });

    it('should update specific elements in array without affecting others', () => {
      const initial: vNode = {
        type: 'ul',
        props: { id: 'list' },
        childrens: [
          { type: 'li', props: { id: 'item1' }, childrens: ['Item 1'] },
          { type: 'li', props: { id: 'item2' }, childrens: ['Item 2'] },
          { type: 'li', props: { id: 'item3' }, childrens: ['Item 3'] },
        ],
      };

      const updated: vNode = {
        type: 'ul',
        props: { id: 'list' },
        childrens: [
          { type: 'li', props: { id: 'item1' }, childrens: ['Updated Item 1'] },
          { type: 'li', props: { id: 'item2' }, childrens: ['Item 2'] },
          { type: 'li', props: { id: 'item3' }, childrens: ['Updated Item 3'] },
        ],
      };

      render(initial, rootElement);
      let list = rootElement.firstElementChild as HTMLElement;
      expect(list.children[0].textContent).toBe('Item 1');
      expect(list.children[1].textContent).toBe('Item 2');
      expect(list.children[2].textContent).toBe('Item 3');

      render(updated, rootElement);
      list = rootElement.firstElementChild as HTMLElement;
      expect(list.children[0].textContent).toBe('Updated Item 1');
      expect(list.children[1].textContent).toBe('Item 2'); // Should remain unchanged
      expect(list.children[2].textContent).toBe('Updated Item 3');
    });

    it('should handle mixed content updates (text and elements)', () => {
      const initial: (string | vNode)[] = [
        'Start ',
        { type: 'strong', props: null, childrens: ['bold'] },
        ' middle ',
        { type: 'em', props: null, childrens: ['italic'] },
        ' end',
      ];

      const updated: (string | vNode)[] = [
        'Updated start ',
        { type: 'strong', props: null, childrens: ['updated bold'] },
        ' middle ',
        { type: 'em', props: null, childrens: ['updated italic'] },
        ' end',
      ];

      render(initial, rootElement);
      expect(rootElement.textContent).toBe('Start bold middle italic end');

      render(updated, rootElement);
      expect(rootElement.textContent).toBe('Updated start updated bold middle updated italic end');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null to element re-render', () => {
      render(null as any, rootElement);
      expect(rootElement.childNodes.length).toBe(0);

      const element: vNode = {
        type: 'div',
        props: null,
        childrens: ['New content'],
      };

      render(element, rootElement);
      expect(rootElement.children.length).toBe(1);
      expect(rootElement.textContent).toBe('New content');
    });

    it('should handle element to null re-render', () => {
      const element: vNode = {
        type: 'div',
        props: null,
        childrens: ['Content'],
      };

      render(element, rootElement);
      expect(rootElement.children.length).toBe(1);

      render(null as any, rootElement);
      expect(rootElement.childNodes.length).toBe(0);
    });

    it('should handle undefined children gracefully', () => {
      const element1: vNode = {
        type: 'div',
        props: { id: 'test' },
        childrens: ['Content'],
      };

      const element2: vNode = {
        type: 'div',
        props: { id: 'test' },
        // childrens is undefined
      };

      render(element1, rootElement);
      expect(rootElement.textContent).toBe('Content');

      expect(() => render(element2, rootElement)).not.toThrow();
      expect(rootElement.firstElementChild?.id).toBe('test');
    });

    it('should handle prop removal on re-render', () => {
      const element1: vNode = {
        type: 'div',
        props: { id: 'test', class: 'old-class', 'data-value': '123' },
        childrens: ['Content'],
      };

      const element2: vNode = {
        type: 'div',
        props: { id: 'test' }, // class and data-value removed
        childrens: ['Content'],
      };

      render(element1, rootElement);
      let div = rootElement.firstElementChild as HTMLElement;
      expect(div.className).toBe('old-class');
      expect(div.getAttribute('data-value')).toBe('123');

      render(element2, rootElement);
      div = rootElement.firstElementChild as HTMLElement;
      expect(div.className).toBe('');
      expect(div.getAttribute('data-value')).toBeNull();
    });

    it('should handle text to element re-render', () => {
      render('Just text', rootElement);
      expect(rootElement.textContent).toBe('Just text');

      const element: vNode = {
        type: 'div',
        props: { id: 'new-element' },
        childrens: ['Now an element'],
      };

      render(element, rootElement);
      expect(rootElement.firstElementChild?.tagName).toBe('DIV');
      expect(rootElement.textContent).toBe('Now an element');
    });

    it('should handle element to text re-render', () => {
      const element: vNode = {
        type: 'div',
        props: { id: 'element' },
        childrens: ['Element content'],
      };

      render(element, rootElement);
      expect(rootElement.firstElementChild?.tagName).toBe('DIV');

      render('Just text now', rootElement);
      expect(rootElement.firstChild?.nodeType).toBe(Node.TEXT_NODE);
      expect(rootElement.textContent).toBe('Just text now');
    });
  });

  describe('Performance and State Management', () => {
    it('should maintain DOM references for unchanged elements', () => {
      const element1: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: { id: 'unchanged' }, childrens: ['Unchanged content'] },
          { type: 'p', props: { id: 'changing' }, childrens: ['Original content'] },
        ],
      };

      const element2: vNode = {
        type: 'div',
        props: { id: 'container' },
        childrens: [
          { type: 'p', props: { id: 'unchanged' }, childrens: ['Unchanged content'] },
          { type: 'p', props: { id: 'changing' }, childrens: ['Updated content'] },
        ],
      };

      render(element1, rootElement);
      const container = rootElement.firstElementChild as HTMLElement;
      const unchangedElement = container.children[0];
      const changingElement = container.children[1];

      render(element2, rootElement);
      const newContainer = rootElement.firstElementChild as HTMLElement;

      // The unchanged element should be the same DOM node
      expect(newContainer.children[0]).toBe(unchangedElement);
      expect(newContainer.children[0].textContent).toBe('Unchanged content');

      // The changing element should have updated content
      expect(newContainer.children[1].textContent).toBe('Updated content');
    });

    it('should handle complex nested re-renders efficiently', () => {
      const createNestedElement = (level: number, content: string): vNode => ({
        type: 'div',
        props: { id: `level-${level}` },
        childrens: level > 0
          ? [createNestedElement(level - 1, content)]
          : [content],
      });

      const element1 = createNestedElement(3, 'Deep content');
      const element2 = createNestedElement(3, 'Updated deep content');

      render(element1, rootElement);
      expect(rootElement.textContent).toBe('Deep content');

      render(element2, rootElement);
      expect(rootElement.textContent).toBe('Updated deep content');

      // Verify the structure is maintained
      const container = rootElement.firstElementChild as HTMLElement;
      expect(container.id).toBe('level-3');
      expect(container.children[0].id).toBe('level-2');
      expect(container.children[0].children[0].id).toBe('level-1');
      expect(container.children[0].children[0].children[0].id).toBe('level-0');
    });
  });
});
