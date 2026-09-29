// Общие помощники отрисовки + палитры по тирам.

export const W = 800;
export const H = 600;

// Внутренние размеры кладовки
export const OPEN = { x: 200, y: 84, w: 420, h: 424 };
export const FLOOR_Y = 402; // линия, где задняя стена meets пол
export const STAGE = { cx: 410, base: 446, w: 330, h: 300 };

// ── математика ─────────────────────────────────────────────────────────
export const n = (v) => Math.round(v * 100) / 100;
export const lerp = (a, b, t) => a + (b - a) * t;

export function poly(points) {
  return points.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');
}

// Точка на окружности, градусы: 0 = вправо, 90 = вниз
export function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

export function arcPath(cx, cy, r, from, to) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  return `M ${n(x1)} ${n(y1)} A ${n(r)} ${n(r)} 0 ${large} ${sweep} ${n(x2)} ${n(y2)}`;
}

// ── цвет ───────────────────────────────────────────────────────────────
function toRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function toHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** amt > 0 — светлее, amt < 0 — темнее. Диапазон примерно -1..1 */
export function shade(hex, amt) {
  const [r, g, b] = toRgb(hex);
  if (amt >= 0) {
    return toHex([lerp(r, 255, amt), lerp(g, 255, amt), lerp(b, 255, amt)]);
  }
  return toHex([r * (1 + amt), g * (1 + amt), b * (1 + amt)]);
}

export function withAlpha(hex, a) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${n(a)})`;
}

// ── палитры ────────────────────────────────────────────────────────────
// Тир задаёт настроение света, НЕ настоящую ценность лота.
export const PALETTES = {
  cheap: {
    wallTop: '#332d26',
    wallBot: '#191512',
    floorTop: '#2a231c',
    floorBot: '#141110',
    beam: '#c9b488',
    beamAlpha: 0.2,
    glow: '#8d7c56',
    metal: '#6f6a62',
    metalDark: '#3a3733',
    accent: '#8a5a2b',
    dust: '#b6a888',
  },
  mid: {
    wallTop: '#3a3022',
    wallBot: '#1b150e',
    floorTop: '#332818',
    floorBot: '#191309',
    beam: '#f0d9a4',
    beamAlpha: 0.26,
    glow: '#b9945a',
    metal: '#8c8272',
    metalDark: '#463f35',
    accent: '#b07d2e',
  },
  rich: {
    wallTop: '#3b2d18',
    wallBot: '#100a05',
    floorTop: '#3a2a14',
    floorBot: '#150d05',
    beam: '#ffe2a6',
    beamAlpha: 0.32,
    glow: '#ffc861',
    metal: '#a8905f',
    metalDark: '#4d3d22',
    accent: '#ffc95e',
    dust: '#ffe0a8',
  },
};

// ── общие куски геометрии ──────────────────────────────────────────────

/** Контактная тень под предметом */
export function contactShadow(cx, base, w, rnd, opacity = 0.5) {
  const rx = w * 0.5;
  return `<ellipse cx="${n(cx)}" cy="${n(base + 6)}" rx="${n(rx)}" ry="${n(Math.max(9, rx * 0.16))}"
    fill="#000" opacity="${n(opacity)}" filter="url(#soft)"/>`;
}

/** Металлический блик — светлая полоса слева */
export function metalSheen(x, y, w, h, pal, amt = 0.22) {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w * 0.28)}" height="${n(h)}"
    fill="${withAlpha(shade(pal.metal, 0.5), amt)}"/>`;
}

/** Ржавые потёртости поверх формы */
export function grime(cx, cy, w, h, rnd, pal, count = 4) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = cx + rnd.range(-w * 0.38, w * 0.38);
    const y = cy + rnd.range(-h * 0.38, h * 0.38);
    const r = rnd.range(2.5, Math.max(3, Math.min(w, h) * 0.11));
    out += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r)}" ry="${n(r * rnd.range(0.5, 1))}"
      fill="#2a1d10" opacity="${n(rnd.range(0.1, 0.26))}"/>`;
  }
  return out;
}

/** Скол/трещина */
export function crack(cx, cy, len, rnd, color = '#1a120b', op = 0.5) {
  const pts = [[cx, cy]];
  let x = cx;
  let y = cy;
  const steps = Math.max(2, Math.round(len / 12));
  for (let i = 0; i < steps; i++) {
    x += rnd.range(-9, 9);
    y += len / steps;
    pts.push([x, y]);
  }
  return `<polyline points="${poly(pts)}" fill="none" stroke="${color}" stroke-width="${n(rnd.range(1.2, 2.6))}"
    stroke-linecap="round" opacity="${n(op)}"/>`;
}

/** Складки ткани — короткие дуги */
export function folds(cx, cy, w, h, rnd, color, op = 0.3, count = 3) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = cx + rnd.range(-w * 0.3, w * 0.3);
    const y = cy + rnd.range(-h * 0.3, h * 0.3);
    const r = rnd.range(10, 24);
    const a0 = rnd.range(0, 180);
    out += `<path d="${arcPath(x, y, r, a0, a0 + rnd.range(60, 140))}" fill="none"
      stroke="${color}" stroke-width="${n(rnd.range(1.4, 3))}" stroke-linecap="round" opacity="${n(op * rnd.range(0.6, 1.2))}"/>`;
  }
  return out;
}

/** Трещины по стеклу/зеркалу */
export function shards(cx, cy, r, rnd, color = '#dfe8ef', op = 0.35) {
  const spokes = rnd.int(4, 6);
  const branch = rnd.int(2, 3);
  let out = '';
  for (let i = 0; i < spokes; i++) {
    const a = (360 / spokes) * i + rnd.range(-12, 12);
    const [x2, y2] = polar(cx, cy, r, a);
    out += `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1.4" opacity="${n(op)}"/>`;
    const [bx, by] = polar(cx, cy, r * rnd.range(0.45, 0.7), a + rnd.range(-40, 40));
    out += `<line x1="${n(x2)}" y1="${n(y2)}" x2="${n(bx)}" y2="${n(by)}" stroke="${color}" stroke-width="1" opacity="${n(op * 0.6)}"/>`;
  }
  return out;
}

/** Мелкий текстурный шум точками */
export function speckle(x, y, w, h, rnd, color, count = 40, op = 0.1) {
  let out = '';
  for (let i = 0; i < count; i++) {
    out += `<circle cx="${n(x + rnd() * w)}" cy="${n(y + rnd() * h)}" r="${n(rnd.range(0.5, 1.5))}"
      fill="${color}" opacity="${n(op * rnd.range(0.4, 1))}"/>`;
  }
  return out;
}
