/**
 * Twikoo：Vite 动态 import 时 UMD 的 default / 命名空间形态不一致，需多路径解析。
 * 本地 localhost 直连 https://twikoo 会 CORS，开发/预览走 /twikoo-proxy（见 vite.config.js）。
 */

let _twikooApiCache = null;

function pickTwikooApi(mod) {
  if (!mod || typeof mod !== 'object') return null;
  const candidates = [mod, mod.default, mod.twikoo, mod.default?.default];
  for (const c of candidates) {
    if (c && typeof c.init === 'function') return c;
  }
  return null;
}

/**
 * @returns {Promise<{ init: Function }>}
 */
export async function loadTwikoo() {
  if (!import.meta.env.VITE_TWIKOO_URL) throw new Error('评论暂未开放');
  if (_twikooApiCache) return _twikooApiCache;

  const tryImports = [
    () => import('twikoo'),
    () => import('twikoo/dist/twikoo.all.min.js')
  ];

  let lastErr = null;
  for (const load of tryImports) {
    try {
      const mod = await load();
      const api = pickTwikooApi(mod);
      if (api) {
        _twikooApiCache = api;
        return api;
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `Twikoo 模块无效：缺少 init${lastErr ? `（${lastErr.message || lastErr}）` : ''}`
  );
}

/** Personal comment service can be configured with VITE_TWIKOO_URL. */
export function getTwikooEnvId() {
  const configured = import.meta.env.VITE_TWIKOO_URL;
  return configured ? configured.replace(/\/$/, '') : '/twikoo-proxy/';
}
