/**
 * Browser polyfills for Node.js modules
 * Required for CosmJS and other crypto libraries
 */

import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer available globally
globalThis.Buffer = Buffer;
globalThis.process = process;

// Additional polyfills that might be needed
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

// Polyfill require function for browser
if (typeof globalThis.require === 'undefined') {
  globalThis.require = function(id: string) {
    throw new Error(`Cannot require '${id}' in browser environment. Use ES6 imports instead.`);
  };
}

// Set up window globals for older libraries
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
  window.global = window;
  
  // Also add require to window for older libraries
  if (typeof (window as any).require === 'undefined') {
    (window as any).require = globalThis.require;
  }
}

export {};