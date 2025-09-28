// Export all hooks
export { useState } from './useState';
export { useEffect } from './useEffect';
export { useRef } from './useRef';

// Export hook utilities from utils
export {
  getCurrentComponentId,
  getHookRegistry,
  getCurrentHooks,
  setCurrentHooks,
  getCurrentHookIndex,
  incrementHookIndex,
  resetComponentIndex,
  cleanupHooks,
  getCurrentComponent,
  generateHookId,
  registerHook,
  startRender,
} from '../utils';

// Export hook creator
export { createHook } from './createHook';
