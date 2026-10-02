import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const failure = () => Promise.reject(new Error('Storage unavailable'));
function worker({ openFails = false, readFails = false, writeFails = false, offline = false, cached } = {}) {
  const handlers = {};
  const network = new Response('full-resolution image');
  const cache = { put: writeFails ? failure : async () => {}, addAll: writeFails ? failure : async () => {} };
  vm.runInNewContext(source, {
    Request: class { constructor(url) { this.url = url; } },
    fetch: offline ? failure : async () => network,
    caches: {
      open: openFails ? failure : async () => cache,
      match: readFails ? failure : async () => cached,
    },
    self: { addEventListener: (name, handler) => { handlers[name] = handler; }, skipWaiting() {} },
  });
  return { handlers, network };
}
async function request(worker, destination = 'image') {
  let response;
  worker.handlers.fetch({ request: { method: 'GET', destination, mode: 'cors', url: 'https://example.test/card.jpg' }, respondWith: value => { response = value; } });
  return response;
}
for (const destination of ['image', 'script']) {
  for (const options of [{}, { openFails: true }, { writeFails: true }, { readFails: true, writeFails: true }]) {
    const w = worker(options);
    assert.equal(await request(w, destination), w.network, `${destination}: ${JSON.stringify(options)}`);
  }
}
const cached = new Response('offline image');
assert.equal(await request(worker({ offline: true, cached })), cached);
assert.equal(await request(worker({ offline: true, cached }), 'script'), cached);
await assert.rejects(request(worker({ offline: true })), /Storage unavailable/);
for (const options of [{}, { openFails: true }, { writeFails: true }]) {
  let installation;
  worker(options).handlers.install({ waitUntil: value => { installation = value; } });
  await installation;
}
console.log('Verified network delivery despite cache read/open/write failures, offline fallback, genuine network failures, and installation with full storage.');

const index = fs.readFileSync('public/index.html', 'utf8');
for (const [, asset, version] of index.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))\?v=([a-f0-9]{12})"/g)) {
  assert.equal(version, crypto.createHash('sha256').update(fs.readFileSync(`public/${asset}`)).digest('hex').slice(0, 12), `${asset} must bypass stale HTTP cache`);
}
assert(index.includes('lifecycle.js?v=') && index.includes('data.js?v='));
console.log('Verified content-addressed script and stylesheet URLs.');
