import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot, useState } from '../src/index';

// Test components for automatic JSX rendering
function SimpleCounter() {
  const [count, setCount] = useState(0);

  return (
    <div className="simple-counter">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

function TodoItem({ text, onDelete }) {
  const [completed, setCompleted] = useState(false);
  return (
    <div className={`todo-item ${completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={completed}
        onClick={() => setCompleted(!completed)}
      />
      <span style={{ textDecoration: completed ? 'line-through' : 'none' }}>
        {text}
      </span>{' '}
      {/* Add space */}
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

function TodoList() {
  const [todos, setTodos] = useState(['Learn React', 'Build an app', 'Deploy to production']);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };

  const deleteTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div className="todo-list">
      <h1>Todo List</h1>
      <div className="add-todo">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <div className="todos">
        {todos.map((todo, index) => (
          <TodoItem
            key={index}
            text={todo}
            onDelete={() => deleteTodo(index)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`theme-container ${isDark ? 'dark' : 'light'}`}>
      <h3>Theme: {isDark ? 'Dark' : 'Light'}</h3>
      <button onClick={() => setIsDark(!isDark)}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>
      <p>This is some content that changes with the theme.</p>
    </div>
  );
}

describe('Automatic JSX Rendering', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('Simple Counter Component', () => {
    it('should render and automatically update counter', () => {
      const root = createRoot(container);
      root.render(SimpleCounter);

      // Initial render
      expect(container.querySelector('h2').textContent).toBe('Count: 0');

      // Test increment
      const incrementBtn = container.querySelector('button');
      incrementBtn.click();
      expect(container.querySelector('h2').textContent).toBe('Count: 1');

      // Test multiple increments
      incrementBtn.click();
      incrementBtn.click();
      expect(container.querySelector('h2').textContent).toBe('Count: 3');

      // Test decrement
      const decrementBtn = container.querySelectorAll('button')[1];
      decrementBtn.click();
      expect(container.querySelector('h2').textContent).toBe('Count: 2');

      // Test reset
      const resetBtn = container.querySelectorAll('button')[2];
      resetBtn.click();
      expect(container.querySelector('h2').textContent).toBe('Count: 0');
    });
  });

  describe('Todo List Component', () => {
    it('should render todo list and handle interactions', () => {
      const root = createRoot(container);
      root.render(TodoList);
      // Initial render
      expect(container.querySelector('h1').textContent).toBe('Todo List');
      expect(container.querySelectorAll('.todo-item').length).toBe(3);

      // Test adding new todo
      const input = container.querySelector('input');
      const addBtn = container.querySelector('button');

      input.value = 'New Todo Item';

      input.dispatchEvent(new Event('change'));

      addBtn.click();

      expect(container.querySelectorAll('.todo-item').length).toBe(4);
      expect(container.querySelectorAll('.todo-item')[3].textContent).toContain('New Todo Item');

      // Test completing a todo
      const firstCheckbox = container.querySelector('input[type="checkbox"]');
      firstCheckbox.click();
      expect(firstCheckbox.checked).toBe(true);
      expect(container.querySelector('.todo-item').classList.contains('completed')).toBe(true);

      // Test deleting a todo
      const deleteBtn = container.querySelector('.todo-item button');
      deleteBtn.click();
      expect(container.querySelectorAll('.todo-item').length).toBe(3);
    });
  });

  describe('Theme Toggle Component', () => {
    it('should toggle theme and update content', () => {
      const root = createRoot(container);
      root.render(ThemeToggle);

      // Initial render
      expect(container.querySelector('h3').textContent).toBe('Theme: Light');
      expect(container.querySelector('.theme-container').classList.contains('light')).toBe(true);

      // Toggle to dark mode
      const toggleBtn = container.querySelector('button');
      toggleBtn.click();

      expect(container.querySelector('h3').textContent).toBe('Theme: Dark');
      expect(container.querySelector('.theme-container').classList.contains('dark')).toBe(true);

      // Toggle back to light mode
      toggleBtn.click();

      expect(container.querySelector('h3').textContent).toBe('Theme: Light');
      expect(container.querySelector('.theme-container').classList.contains('light')).toBe(true);
    });
  });

  describe('Multiple State Updates', () => {
    it('should handle rapid state updates correctly', () => {
      const root = createRoot(container);
      root.render(SimpleCounter);

      const incrementBtn = container.querySelector('button');

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        incrementBtn.click();
      }

      expect(container.querySelector('h2').textContent).toBe('Count: 10');
    });
  });
});
