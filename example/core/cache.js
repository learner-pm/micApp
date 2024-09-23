const cache = {};
const cacheExpirationTime = 10 * 1000; // 10 min

// 用于从指定的 URL 获取子应用的 HTML 内容
async function fetchApplicationHTML(app) {
  const cacheEntry = cache[app.url];
  const now = Date.now();
  if (
    app.cache &&
    cacheEntry &&
    now - cacheEntry?.timestamp < cacheExpirationTime
  ) {
    return cacheEntry.html;
  }
  const response = await fetch(app?.url);
  if (!response.ok) {
    throw new Error(`Failed to load application from ${app?.url}`);
  }
  const html = await response.text();
  cache[app?.url] = { html, timestamp: now };
  return html;
}

export { fetchApplicationHTML };
