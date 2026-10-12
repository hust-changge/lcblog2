const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '../..');
const env = { ...process.env, IMAGE_TAG: 'a'.repeat(40), MYSQL_ROOT_PASSWORD: 'check-only', MYSQL_PASSWORD: 'check-only', HM_JWT_SECRET_KEY: 'check-only-secret-of-at-least-32-bytes', HTTP_BIND: '127.0.0.1' };
const config = spawnSync('docker', ['compose', '-f', 'deploy/registry/compose.yml', 'config', '--format', 'json'], { cwd: root, env, encoding: 'utf8' });
assert.equal(config.status, 0, config.stderr);
const model = JSON.parse(config.stdout);
assert.equal(model.name, 'lcblog2');
assert.equal(model.services.mysql.ports, undefined);
assert.equal(model.services.backend.ports, undefined);
assert.equal(model.services.nginx.ports[0].host_ip, '127.0.0.1');
for (const name of ['backend', 'nginx']) {
  assert.ok(model.services[name].image.endsWith(':' + env.IMAGE_TAG));
  assert.equal(model.services[name].build, undefined);
}
assert.equal(model.services.mysql.environment.MYSQL_USER, model.services.backend.environment.SPRING_DATASOURCE_USERNAME);
assert.equal(model.services.mysql.environment.MYSQL_PASSWORD, model.services.backend.environment.SPRING_DATASOURCE_PASSWORD);
for (const file of ['.dockerignore', 'B1gchangBlog-Backend/.dockerignore']) {
  assert.ok(readFileSync(resolve(root, file), 'utf8').includes('**/application-local-secret.yml'));
}
assert.match(readFileSync(resolve(__dirname, '02-disable-default-admin.sql'), 'utf8'), /SET status = 0/);
const missingTag = spawnSync('docker', ['compose', '-f', 'deploy/registry/compose.yml', 'config', '--quiet'], { cwd: root, env: { ...env, IMAGE_TAG: '' }, encoding: 'utf8' });
assert.notEqual(missingTag.status, 0, 'Deployment must reject a missing image version');
console.log('PASS: matching image versions, isolated database, loopback HTTP, excluded local secrets, and required image tag.');
