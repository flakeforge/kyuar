/**
 * Deterministic PRNG for one module, so shapes with random variation render
 * the same on the server and in the browser.
 */
export function cellRandom(row: number, col: number, seed = 0x6b797561): () => number {
  let state = (Math.imul(row + 1, 0x9e3779b1) ^ Math.imul(col + 1, 0x85ebca77) ^ seed) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
