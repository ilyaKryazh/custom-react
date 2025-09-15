import { test, expect } from 'vitest';
import { createElement } from '../src/index.ts';
test('createElement', () => {
  expect(createElement('div', null, 'content')).toEqual({
    type: 'div',
    props: null,
    childrens: 'content',
  });
});

test('nestedElementCreate', () => {
  const button = function (props) {
    return createElement('button', null, props.label);
  };
  expect(createElement(button, { label: 'label' })).toEqual({
    type: 'button',
    props: null,
    childrens: 'label',
  });
});

test('nested2ElementCreate', () => {
  const button = function (props) {
    return createElement('button', null, props.label);
  };
  const button2 = function (props) {
    return createElement('button', props, button({ label: 'label' }));
  };
  expect(createElement(button2, { id: 1 })).toEqual({
    type: 'button',
    props: { id: 1 },
    childrens: {
      type: 'button',
      props: null,
      childrens: 'label',
    },
  });
});
