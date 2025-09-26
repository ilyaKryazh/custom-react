import { describe, it, expect, beforeEach } from 'vitest';
import { renderComponent, cleanup, useState, useRef } from '../src/index';

// Test component 1
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Counter');

  return (
    <div className="counter">
      <h2>{name}: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setName(name === 'Counter' ? 'Updated' : 'Counter')}>
        Toggle Name
      </button>
    </div>
  );
}

// Test component 2
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="timer">
      <h3>Timer: {seconds}s</h3>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}

describe('Multiple Components Test', () => {
  let rootElement1;
  let rootElement2;

  beforeEach(() => {
    cleanup();
    rootElement1 = document.createElement('div');
    rootElement2 = document.createElement('div');
  });

  it('should handle multiple components independently', () => {
    // Render first component
    renderComponent(Counter, rootElement1);

    // Render second component
    renderComponent(Timer, rootElement2);

    // Verify both components rendered
    const counterH2 = rootElement1.querySelector('h2');
    const timerH3 = rootElement2.querySelector('h3');

    expect(counterH2?.textContent).toBe('Counter: 0');
    expect(timerH3?.textContent).toBe('Timer: 0s');

    // Interact with first component
    const incrementBtn = rootElement1.querySelector('button');
    incrementBtn?.click();

    // Verify only first component updated
    expect(counterH2?.textContent).toBe('Counter: 1');
    expect(timerH3?.textContent).toBe('Timer: 0s'); // Should remain unchanged
  });

  it('should handle multiple hooks in same component', () => {
    renderComponent(Counter, rootElement1);

    const counterH2 = rootElement1.querySelector('h2');
    const toggleBtn = rootElement1.querySelectorAll('button')[1];

    expect(counterH2?.textContent).toBe('Counter: 0');

    // Test name toggle
    toggleBtn?.click();
    expect(counterH2?.textContent).toBe('Updated: 0');

    // Test count increment
    const incrementBtn = rootElement1.querySelector('button');
    incrementBtn?.click();
    expect(counterH2?.textContent).toBe('Updated: 1');
  });
});
