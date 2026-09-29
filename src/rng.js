// Детерминированный ГПСЧ. Одинаковый сид -> одинаковая картинка,
// иначе генератор нельзя было бы перезапустить и получить те же 100 картинок.

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRng(seed) {
  let a = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;

  const rnd = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Дробное в диапазоне
  rnd.range = (min, max) => min + rnd() * (max - min);
  // Целое в диапазоне (обе границы включительно)
  rnd.int = (min, max) => Math.floor(min + rnd() * (max - min + 1));
  rnd.pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  rnd.chance = (p) => rnd() < p;
  // Приблизительно нормальное распределение (сумма трёх равномерных)
  rnd.bell = (min, max) => {
    const t = (rnd() + rnd() + rnd()) / 3;
    return min + t * (max - min);
  };
  rnd.shuffle = (arr) => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  return rnd;
}
