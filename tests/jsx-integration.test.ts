import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { render, resetPrevNode } from '../src/index';
import App from './jsx/App';

describe('JSX Integration Tests - Real JSX Files', () => {
  let rootElement: HTMLElement; 

  beforeEach(() => {
    // Reset the prevNode state before each test
    resetPrevNode();
    // Create a fresh root element for each test
    rootElement = document.createElement('div');
    rootElement.innerHTML = '';
  });

  describe('App.jsx Component', () => {
    it('should render the App component and generate proper DOM structure', () => {
      // Render the App component
      const appElement = App();
      render(appElement, rootElement);

      // Verify the root div exists
      expect(rootElement.children.length).toBe(1);
      const appDiv = rootElement.firstElementChild as HTMLElement;
      expect(appDiv.tagName).toBe('DIV');
      expect(appDiv.className).toBe('app');

      // Verify the h1 element
      expect(appDiv.children.length).toBe(3);
      const h1 = appDiv.children[0] as HTMLElement;
      expect(h1.tagName).toBe('H1');
      expect(h1.textContent).toBe('Hello, World!');

      // Verify the paragraph element
      const p = appDiv.children[1] as HTMLElement;
      expect(p.tagName).toBe('P');
      expect(p.textContent).toBe('This is a simple JSX component.');

      // Verify the button element
      const button = appDiv.children[2] as HTMLButtonElement;
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('Click me');
      // Check that the button has an onclick event listener attached
      expect(button.onclick).toBeDefined();

      // Mock the alert function to capture the message
      let alertMessage: string | null = null;
      const originalAlert = window.alert;
      window.alert = (message: string) => {
        alertMessage = message;
      };

      // Simulate the button click
      button.click();

      // Wait for the click to be processed and check the alert message
      expect(alertMessage).toBe('Button clicked!');

      // Restore the original alert function
      window.alert = originalAlert;
    });

  });
});