// types/node-fetch.d.ts
declare module 'node-fetch' {
  const fetch: typeof import('undici').fetch;
  export default fetch;
}
// final commit
