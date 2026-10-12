const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const component = readFileSync(resolve(__dirname, '../B1gchangBlog-Frontend/src/components/MagneticCursor.vue'), 'utf8');
const script = component.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/import .*?from 'vue';/, '');
let mounted, unmount, move;
const dot = { style: {} };
const context = {
  ref: () => ({ value: dot }),
  onMounted: (fn) => { mounted = fn; },
  onBeforeUnmount: (fn) => { unmount = fn; },
  window: {
    innerWidth: 800, innerHeight: 600,
    matchMedia: () => ({ matches: true }),
    addEventListener: (name, fn) => { assert.equal(name, 'pointermove'); move = fn; },
    removeEventListener: (name, fn) => { assert.equal(name, 'pointermove'); assert.equal(fn, move); },
  },
};
runInNewContext(script, context);
mounted();
assert.equal(dot.style.transform, 'translate3d(400px, 300px, 0)');
move({ pointerType: 'mouse', clientX: 120, clientY: 80 });
assert.equal(dot.style.transform, 'translate3d(120px, 80px, 0)');
move({ pointerType: 'touch', clientX: 500, clientY: 500 });
assert.equal(dot.style.transform, 'translate3d(120px, 80px, 0)');
unmount();
console.log('PASS: dot follows mouse, ignores touch, and removes its listener.');
