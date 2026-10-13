const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const calls = [];
const url = 'https://img.example.com/images/test.png';
const source = fs.readFileSync(path.join(root, 'B1gchangBlog-AdminPanel/src/views/AddArticle.vue'), 'utf8')
  .split('<script>')[1].split('</script>')[0].replace(/\r/g, '')
  .replace(/^import .*\n/gm, '').replace('export default', 'component =');
const ctx = {
  component: null,
  uploadOssImage: async (file, dir) => { calls.push({ file, dir }); return { url }; },
  setTimeout: () => {}, console,
};
vm.runInNewContext(source, ctx);

(async () => {
  const state = {
    form: { cover: 'existing-cover' }, markdownContent: 'original article',
    parseFrontMatter() { this.parsed = true; },
    $message: { success() {}, error(message) { throw new Error(message); } },
  };
  const file = { name: 'test.png' };
  await ctx.component.methods.uploadArticleImage.call(state, { file }, 'content');
  assert.equal(calls[0].dir, 'images');
  assert.equal(state.form.cover, 'existing-cover', 'Body upload must preserve cover');
  assert.equal(state.markdownContent, `original article\n\n![图片](${url})\n`);
  assert.equal(state.parsed, true);
  await ctx.component.methods.uploadArticleImage.call(state, { file });
  assert.equal(calls[1].dir, 'covers');
  assert.equal(state.form.cover, url);
  assert.equal(state.coverUploading, false);
  console.log('PASS: body upload inserts Markdown without replacing cover; cover upload uses its own directory.');
})().catch(error => { console.error(error); process.exitCode = 1; });
