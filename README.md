# 🚀 Custom React Library

A lightweight, custom implementation of React with JSX support, hooks, and virtual DOM diffing. Built from scratch to understand the internals of React and provide a minimal yet powerful UI library.

## ✨ Features

- 🎯 **JSX Support** - Full JSX syntax with automatic transpilation
- 🔄 **Virtual DOM Diffing** - Efficient DOM updates with reconciliation
- 🪝 **React Hooks** - `useState`, `useEffect`, and `useRef` implementations
- ⚡ **Component System** - Function components with state management
- 🎨 **Event Handling** - Native DOM event support
- 📦 **TypeScript** - Full TypeScript support with type definitions
- 🧪 **Testing** - Comprehensive test suite with Vitest

## 🏗️ Architecture

### Core Components

#### 1. Virtual DOM System
- **vNode**: Core virtual node structure representing UI elements
- **createElement**: Factory function for creating virtual nodes
- **diff**: Reconciliation algorithm for efficient DOM updates

#### 2. Component Management
- **Component Registry**: Tracks active components and their state
- **Component Stack**: Manages component context during rendering
- **Hook System**: Manages component hooks and their lifecycle

#### 3. Rendering Engine
- **render**: Main rendering function with initial mount and updates
- **createRoot**: React 18-style root API for component rendering
- **rerender**: Triggers component re-rendering with updated state

### File Structure

```
custom-react-lib/
├── src/
│   ├── index.ts              # Main library exports and core functions
│   ├── tree-types.ts         # TypeScript type definitions
│   ├── utils.ts              # DOM utilities, helpers, and hook management
│   └── hooks/
│       ├── index.ts          # Hook exports and re-exports
│       ├── createHook.ts     # Generic hook creator function
│       ├── useState.ts       # State management hook
│       ├── useEffect.ts      # Effect hook implementation
│       └── useRef.ts         # Ref hook implementation
├── jsx/
│   ├── index.ts              # JSX runtime exports
│   └── jsx-runtime.ts        # JSX transformation implementation
├── tests/                    # Comprehensive test suite
│   ├── jsx/                  # JSX test components
│   └── *.test.ts             # Test files
└── dist/                     # Compiled output
```

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd custom-react-lib

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```

### Basic Usage

#### 1. Simple Component

```jsx
import { createRoot, useState } from './src/index';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// Render the component
const container = document.getElementById('app');
const root = createRoot(container);
root.render(Counter);
```

#### 2. Component with Props

```jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h2>Hello, {name}!</h2>
      <p>You are {age} years old.</p>
    </div>
  );
}

// Usage
root.render(() => <Greeting name="John" age={25} />);
```

#### 3. Using Hooks

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()]);
      setInput('');
    }
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🪝 Hooks API

### useState

Manages component state with automatic re-rendering.

```jsx
const [state, setState] = useState(initialValue);

// Functional updates
setState(prevState => prevState + 1);

// Direct updates
setState(newValue);
```

### useEffect

Handles side effects and lifecycle events.

```jsx
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup code
  };
}, [dependencies]);
```

### useRef

Creates a mutable ref object.

```jsx
const ref = useRef(initialValue);

// Access current value
console.log(ref.current);

// Update value
ref.current = newValue;
```

## 🎯 JSX Configuration

The library includes a custom JSX runtime that transforms JSX syntax into virtual DOM nodes.

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "my-lib",
    "baseUrl": ".",
    "paths": {
      "my-lib/jsx-runtime": ["./jsx/index.ts"],
      "my-lib/jsx-dev-runtime": ["./jsx/index.ts"]
    }
  }
}
```

### JSX Features

- **Fragments**: Use `<>` or `<Fragment>` for multiple root elements
- **Event Handlers**: Standard React event naming (`onClick`, `onChange`, etc.)
- **Props**: All standard HTML attributes plus custom props
- **Children**: Support for text, elements, and arrays

## 🔧 Development

### Available Scripts

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the library
npm run build

# Watch mode for development
npm run dev:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Testing

The library includes comprehensive tests covering:

- Component rendering and updates
- Hook functionality and state management
- JSX transformation and virtual DOM
- Event handling and user interactions
- Multiple component scenarios

Run tests with:

```bash
npm test
```

## 🏛️ Architecture Deep Dive

### Virtual DOM Diffing

The library implements an efficient diffing algorithm that:

1. **Compares** old and new virtual DOM trees
2. **Identifies** changes at the node level
3. **Updates** only the necessary DOM elements
4. **Handles** different node types (text, elements, components)

### Hook System

Hooks are managed through a sophisticated modular system:

- **Component Context**: Each component maintains its own hook registry
- **Hook Index**: Tracks hook order for consistent behavior
- **State Persistence**: Hooks maintain state across re-renders
- **Cleanup**: Automatic cleanup when components unmount
- **Modular Architecture**:
  - `createHook.ts`: Generic hook creator for all hook types
  - `useState.ts`: State management hook implementation
  - `useEffect.ts`: Effect hook implementation
  - `useRef.ts`: Ref hook implementation
  - `index.ts`: Centralized hook exports
  - `utils.ts`: Hook management utilities and registry (consolidated)

### Component Lifecycle

1. **Registration**: Component is registered with unique ID
2. **Rendering**: Virtual DOM is created from component function
3. **Mounting**: Virtual DOM is converted to real DOM
4. **Updates**: State changes trigger re-rendering
5. **Cleanup**: Component and hooks are cleaned up on unmount

## 🎨 Styling

The library supports standard HTML attributes and CSS:

```jsx
<div
  className="container"
  style={{
    backgroundColor: 'blue',
    padding: '20px'
  }}
>
  <h1 style={{ color: 'white' }}>Styled Content</h1>
</div>
```

## 🚧 Limitations

This is a learning project with some limitations compared to full React:

- No server-side rendering (SSR)
- Limited hook types (only useState, useEffect, useRef)
- No context API or advanced patterns
- Simplified event handling
- No concurrent features

## 🤝 Contributing

This is primarily an educational project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 Learning Resources

This implementation demonstrates:

- How React's virtual DOM works
- Component lifecycle management
- Hook system internals
- JSX transformation
- State management patterns
- DOM diffing algorithms

## 📄 License

ISC License - see LICENSE file for details.

---

**Built with ❤️ for learning React internals**
