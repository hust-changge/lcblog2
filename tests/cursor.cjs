const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const root = resolve(__dirname, '..');
const component = readFileSync(resolve(root, 'B1gchangBlog-Frontend/src/components/FairyDustCursor.vue'), 'utf8');
const script = component.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm, '');
function check(fine, reduced, enabled) {
  let mounted, unmount, created = 0, destroyed = 0;
  runInNewContext(script, {
    onMounted: fn => { mounted = fn; },
    onBeforeUnmount: fn => { unmount = fn; },
    window: { matchMedia: query => ({ matches: query === '(pointer: fine)' ? fine : reduced }) },
    fairyDustCursor: function(options) {
      created++;
      assert.equal(options.fairySymbol, '*');
      assert.deepEqual(Array.from(options.colors), ['#D61C59', '#E7D84B', '#1B8798']);
      this.destroy = () => { destroyed++; };
    },
  });
  mounted();
  assert.equal(created, enabled ? 1 : 0);
  unmount();
  assert.equal(destroyed, created);
}
check(true, false, true);
check(false, false, false);
check(true, true, false);
for (const file of ['base.css', 'css/style.css']) {
  assert.ok(!readFileSync(resolve(root, 'B1gchangBlog-Frontend/src/assets', file), 'utf8').includes('cursor: none'));
}
console.log('PASS: Fairy Dust initialization, touch/reduced-motion filtering, cleanup and native cursor restored.');
