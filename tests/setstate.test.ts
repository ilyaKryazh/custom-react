import { describe, it, expect, beforeEach } from 'vitest';
import { renderComponent, resetPrevNode, cleanup } from '../src/index';
import { startRender } from '../src/hooks/useState';
import Counter from './jsx/Counter';

describe('setState Hook Test', () => {
  let rootElement: HTMLElement;

  beforeEach(() => {
    // Reset state before each test
    cleanup();
    startRender();
    resetPrevNode();
    // Create a fresh root element for each test
    rootElement = document.createElement('div');
    rootElement.innerHTML = '';
  });

  it.only('should update state and return new value when setState is called', () => {
    // Render the Counter component using the public API
    renderComponent(Counter, rootElement);
    console.log('rootElement: ', rootElement.innerHTML);

    // Verify initial render
    const h2 = rootElement.querySelector('h2');
    expect(h2).toBeTruthy();
    expect(h2?.textContent).toBe('Counter: 0');

    // Find the increment button and click it
    const incrementButton = rootElement.querySelector('button');
    expect(incrementButton).toBeTruthy();
    expect(incrementButton?.textContent).toBe('Increment');

    // Simulate button click
    incrementButton?.click();

    // Verify the component re-rendered with new state
    const h2_updated = rootElement.querySelector('h2');
    expect(h2_updated?.textContent).toBe('Counter: 1');
  });
});
