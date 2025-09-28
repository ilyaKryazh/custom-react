import { test, expect, describe } from 'vitest';
import { createElement } from '../src/index';

describe('createElement', () => {
  describe('HTML element creation', () => {
    test('creates simple element with string children', () => {
      const element = createElement('div', null, 'Hello World');
      expect(element).toEqual({
        type: 'div',
        props: null,
        childrens: ['Hello World'],
      });
    });

    test('creates element with props', () => {
      const element = createElement(
        'button',
        { id: 'btn1', className: 'btn' },
        'Click me'
      );
      expect(element).toEqual({
        type: 'button',
        props: { id: 'btn1', className: 'btn' },
        childrens: ['Click me'],
      });
    });

    test('creates element without children', () => {
      const element = createElement('img', { src: 'image.jpg', alt: 'Image' });
      expect(element).toEqual({
        type: 'img',
        props: { src: 'image.jpg', alt: 'Image' },
        childrens: [],
      });
    });

    test('creates element with null props', () => {
      const element = createElement('span', null, 'text');
      expect(element).toEqual({
        type: 'span',
        props: null,
        childrens: ['text'],
      });
    });

    test('creates element with array of children', () => {
      const child1 = createElement('span', null, 'Child 1');
      const child2 = createElement('span', null, 'Child 2');
      const element = createElement(
        'div',
        { className: 'container' },
        child1,
        child2
      );

      expect(element).toEqual({
        type: 'div',
        props: { className: 'container' },
        childrens: [child1, child2],
      });
    });

    test('creates element with mixed children types', () => {
      const childElement = createElement('strong', null, 'Bold text');
      const element = createElement(
        'p',
        null,
        'Normal text',
        childElement,
        ' more text'
      );

      expect(element).toEqual({
        type: 'p',
        props: null,
        childrens: ['Normal text', childElement, ' more text'],
      });
    });
  });

  describe('Function component creation', () => {
    test('creates element from function component', () => {
      const Button = (props: any) => {
        return createElement('button', props, props.label);
      };

      const element = createElement(Button, { label: 'Click me', id: 'btn1' });
      expect(element).toEqual({
        type: Button,
        props: { label: 'Click me', id: 'btn1' },
        childrens: [],
      });
    });

    test('creates element from function component with no props', () => {
      const Title = () => {
        return createElement('h1', null, 'My Title');
      };

      const element = createElement(Title, null);
      expect(element).toEqual({
        type: Title,
        props: null,
        childrens: [],
      });
    });

    test('creates element from function component with complex children', () => {
      const Card = (props: any) => {
        const header = createElement('h2', null, props.title);
        const content = createElement('p', null, props.content);
        return createElement('div', { className: 'card' }, header, content);
      };

      const element = createElement(Card, {
        title: 'Card Title',
        content: 'Card content goes here',
      });

      expect(element).toEqual({
        type: Card,
        props: {
          title: 'Card Title',
          content: 'Card content goes here',
        },
        childrens: [],
      });
    });

    test('creates nested function components', () => {
      const Button = (props: any) => {
        return createElement('button', props, props.label);
      };

      const Container = (props: any) => {
        return createElement(
          'div',
          props,
          createElement(Button, {
            label: props.buttonLabel,
            className: 'nested-btn',
          })
        );
      };

      const element = createElement(Container, {
        className: 'wrapper',
        buttonLabel: 'Nested Button',
      });

      expect(element).toEqual({
        type: Container,
        props: { className: 'wrapper', buttonLabel: 'Nested Button' },
        childrens: [],
      });
    });

    test('handles function component that returns null', () => {
      const ConditionalComponent = (props: any) => {
        if (!props.show) {
          return null;
        }
        return createElement('div', null, 'Visible content');
      };

      const element = createElement(ConditionalComponent, { show: false });
      expect(element).toEqual({
        type: ConditionalComponent,
        props: { show: false },
        childrens: [],
      });
    });

    test('handles function component that returns undefined', () => {
      const EmptyComponent = () => {
        return undefined;
      };

      const element = createElement(EmptyComponent, {});
      expect(element).toEqual({
        type: EmptyComponent,
        props: {},
        childrens: [],
      });
    });
  });

  describe('Edge cases', () => {
    test('handles empty string as type', () => {
      const element = createElement('', null, 'content');
      expect(element).toEqual({
        type: '',
        props: null,
        childrens: ['content'],
      });
    });

    test('handles numeric props', () => {
      const element = createElement(
        'div',
        { tabIndex: 0, dataId: 123 },
        'content'
      );
      expect(element).toEqual({
        type: 'div',
        props: { tabIndex: 0, dataId: 123 },
        childrens: ['content'],
      });
    });

    test('handles boolean props', () => {
      const element = createElement(
        'input',
        { disabled: true, required: false },
        ''
      );
      expect(element).toEqual({
        type: 'input',
        props: { disabled: true, required: false },
        childrens: [''],
      });
    });

    test('handles function component with complex return type', () => {
      const ComplexComponent = (props: any) => {
        if (props.type === 'button') {
          return createElement('button', props, props.children);
        } else if (props.type === 'div') {
          return createElement('div', props, props.children);
        }
        return createElement('span', null, 'default');
      };

      const buttonElement = createElement(
        ComplexComponent,
        {
          type: 'button',
          className: 'btn',
          children: 'Click me',
        },
        'Click me'
      );

      expect(buttonElement).toEqual({
        type: ComplexComponent,
        props: {
          type: 'button',
          className: 'btn',
          children: 'Click me',
        },
        childrens: ['Click me'],
      });
    });
  });
});
