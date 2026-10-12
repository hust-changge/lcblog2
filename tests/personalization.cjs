const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');

const root = resolve(__dirname, '..');
const source = readFileSync(resolve(root, 'B1gchangBlog-Frontend/src/utils/twikoo.js'), 'utf8')
  .replaceAll('export ', '').replaceAll('import.meta.env', 'env');
const evaluate = (env) => runInNewContext(source + '\n({ getTwikooEnvId, loadTwikoo })', { env });
(async () => {
  const offline = evaluate({});
  assert.equal(offline.getTwikooEnvId(), '/twikoo-proxy/');
  await assert.rejects(offline.loadTwikoo(), /评论暂未开放/);
  assert.equal(evaluate({ VITE_TWIKOO_URL: 'https://comments.example.com/' }).getTwikooEnvId(), 'https://comments.example.com');
  const home = readFileSync(resolve(root, 'B1gchangBlog-Frontend/src/views/Home.vue'), 'utf8');
  assert.ok(home.includes('B1gchangBlog'));
  assert.ok(home.includes('18872617747@163.com'));
  assert.ok(!/阿叶|butterfly\.ayeez|421300955/.test(home));
  console.log('PASS: personal profile and offline comments; explicit personal comment URL supported.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
