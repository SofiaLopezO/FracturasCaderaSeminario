// tests/_helpers/http.js
import { vi } from 'vitest';

export function mockReq(bodyOrQuery) {
  return {
    body: bodyOrQuery?.body ?? bodyOrQuery ?? {},
    query: bodyOrQuery?.query ?? {},
    headers: {},
    cookies: {},
    get: () => '',
  };
}

export function mockRes() {
  const res = { statusCode: 200, body: undefined };
  res.status = vi.fn((code) => { res.statusCode = code; return res; });
  res.json   = vi.fn((payload) => { res.body = payload; return res; });
  res.clearCookie = vi.fn(() => res);
  res.cookie = vi.fn(() => res);
  return res;
}
