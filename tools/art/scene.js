// Сцена: заглядываешь в брошенную кладовку. Приоткрытая дверь, луч фонарика,
// пыль, трафарет с номером бокса, виньетка. Предмет рисуется поверх.

import {
  W, H, OPEN, FLOOR_Y, n, lerp, poly, polar, arcPath,
  shade, withAlpha, speckle, PALETTES,
} from './lib.js';

const LEFT = OPEN.x;
const RIGHT = OPEN.x + OPEN.w;
const TOP = OPEN.y;
const BOTTOM = OPEN.y + OPEN.h;
const CORRIDOR_WALL = '#0c0a09';

/** Трафаретный номер бокса — с дырками, как отбитая краска */
function stencil(rnd) {
  const letter = rnd.pick(['A', 'B', 'C', 'D', 'E', 'F', 'M', 'P', 'R', '12', '24']);
  const num = rnd.int(100, 989);
  const txt = `${letter}-${num}`;
  const x = rnd.range(24, 46);
  const y = rnd.range(112, 148);
  const size = rnd.range(26, 34);
  let out = `<text x="${n(x)}" y="${n(y)}" font-family="'Arial Black',Arial,sans-serif"
    font-size="${n(size)}" font-weight="900" letter-spacing="2"
    fill="#cbb994" opacity="0.5">${txt}</text>`;
  // Пробиваем трафарет
  for (let i = 0; i < rnd.int(4, 7); i++) {
    out += `<rect x="${n(x + rnd.range(0, size * 2.6))}" y="${n(y - size * 0.62 + rnd() * size * 0.6)}"
      width="${n(rnd.range(4, 13))}" height="${n(rnd.range(1.6, 4))}" fill="${CORRIDOR_WALL}" opacity="0.85"/>`;
  }
  // Подтёки
  out += `<rect x="${n(x + rnd.range(0, size * 2))}" y="${n(y)}" width="${n(rnd.range(2, 5))}"
    height="${n(rnd.range(10, 30))}" fill="#8f7f61" opacity="0.22"/>`;
  return out;
}

/** Мусор и обломки на полу кладовки */
function debris(rnd, count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = rnd.range(LEFT + 24, RIGHT - 24);
    const y = rnd.range(BOTTOM - 46, BOTTOM - 6);
    const k = rnd.int(0, 2);
    if (k === 0) {
      out += `<rect x="${n(x)}" y="${n(y)}" width="${n(rnd.range(10, 26))}" height="${n(rnd.range(3, 6))}"
        fill="#6b5b44" opacity="${n(rnd.range(0.3, 0.55))}" transform="rotate(${n(rnd.range(-24, 24))} ${n(x)} ${n(y)})"/>`;
    } else if (k === 1) {
      out += `<path d="M ${n(x)} ${n(y)} l ${n(rnd.range(-9, 9))} ${n(rnd.range(-5, 5))}
        l ${n(rnd.range(-8, 8))} ${n(rnd.range(-4, 4))}" stroke="#5c4e3a"
        stroke-width="${n(rnd.range(1.4, 2.6))}" fill="none" opacity="${n(rnd.range(0.3, 0.5))}"/>`;
    } else {
      out += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rnd.range(4, 10))}" ry="${n(rnd.range(2, 5))}"
        fill="#4a3f30" opacity="${n(rnd.range(0.25, 0.45))}"/>`;
    }
  }
  return out;
}

/** Пыль в луче */
function motes(cx, beamHalf, rnd, count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const t = rnd();
    const spread = lerp(40, beamHalf, t);
    const x = cx + rnd.range(-spread, spread);
    const y = lerp(0, BOTTOM + 40, t);
    const r = rnd.range(0.7, 2.4);
    out += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="#f0e0bd"
      opacity="${n(rnd.range(0.12, 0.5) * (1 - t * 0.5))}"/>`;
  }
  return out;
}

/** Светлая полоса света на задней стене от фонаря */
function backLight(pal, rnd, cx) {
  const w = rnd.range(230, 300);
  return `<ellipse cx="${n(cx + rnd.range(-40, 40))}" cy="${n(FLOOR_Y - 40)}" rx="${n(w * 0.5)}" ry="150"
    fill="url(#backglow)" opacity="${n(0.5 + pal.beamAlpha)}"/>`;
}

export function defs(pal) {
  return `<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${pal.wallTop}"/>
    <stop offset="1" stop-color="${pal.wallBot}"/>
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${pal.floorTop}"/>
    <stop offset="1" stop-color="${pal.floorBot}"/>
  </linearGradient>
  <linearGradient id="door" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${shade(pal.metalDark, 0.18)}"/>
    <stop offset="0.45" stop-color="${pal.metal}"/>
    <stop offset="1" stop-color="${shade(pal.metalDark, -0.25)}"/>
  </linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${pal.beam}" stop-opacity="${n(pal.beamAlpha * 1.5)}"/>
    <stop offset="0.55" stop-color="${pal.beam}" stop-opacity="${n(pal.beamAlpha * 0.7)}"/>
    <stop offset="1" stop-color="${pal.beam}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="beamCore" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff6de" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#fff6de" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="backglow">
    <stop offset="0" stop-color="${pal.beam}" stop-opacity="0.3"/>
    <stop offset="1" stop-color="${pal.beam}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.48" r="0.75">
    <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.82"/>
  </radialGradient>
  <radialGradient id="halolight" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${pal.beam}" stop-opacity="0.4"/>
    <stop offset="1" stop-color="${pal.beam}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="2.4"/>
  </filter>
  <clipPath id="opening">
    <rect x="${LEFT}" y="${TOP}" width="${OPEN.w}" height="${OPEN.h}" rx="3"/>
  </clipPath>
</defs>`;
}

export function scene({ pal, rnd, item }) {
  const cx = OPEN.x + OPEN.w * 0.5 + rnd.range(-14, 14);
  const beamHalf = rnd.range(250, 320);
  const swing = rnd.range(0, 22);
  const apexX = cx + rnd.range(-70, 70);
  const doorBandW = 44 + swing;

  let s = '';

  // ── коридор снаружи ────────────────────────────────────────────────
  s += `<rect width="${W}" height="${H}" fill="${CORRIDOR_WALL}"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  // бетонные швы коридора
  for (let i = 0; i < 3; i++) {
    const y = 70 + i * 165;
    s += `<rect x="0" y="${n(y)}" width="${W}" height="2" fill="#1b1714" opacity="0.7"/>`;
  }
  s += speckle(0, 0, W, H, rnd, '#4a4238', 90, 0.09);

  // ── проём ──────────────────────────────────────────────────────────
  s += `<rect x="${n(LEFT - 26)}" y="${n(TOP - 26)}" width="${n(OPEN.w + 52)}" height="${n(OPEN.h + 52)}"
    rx="6" fill="#151210"/>`;
  s += `<rect x="${n(LEFT - 14)}" y="${n(TOP - 14)}" width="${n(OPEN.w + 28)}" height="${n(OPEN.h + 28)}"
    rx="4" fill="url(#door)"/>`;

  s += `<g clip-path="url(#opening)">`;
  // задняя стена
  s += `<rect x="${LEFT}" y="${TOP}" width="${OPEN.w}" height="${n(FLOOR_Y - TOP + 4)}" fill="url(#wall)"/>`;
  // боковые стены (уход вглубь)
  s += `<path d="${poly([[LEFT, TOP], [LEFT + 46, TOP + 30], [LEFT + 46, FLOOR_Y + 8], [LEFT, FLOOR_Y + 4]])}" fill="#000" opacity="0.34"/>`;
  s += `<path d="${poly([[RIGHT, TOP], [RIGHT - 46, TOP + 30], [RIGHT - 46, FLOOR_Y + 8], [RIGHT, FLOOR_Y + 4]])}" fill="#000" opacity="0.34"/>`;
  // пол
  s += `<rect x="${LEFT}" y="${FLOOR_Y}" width="${OPEN.w}" height="${n(BOTTOM - FLOOR_Y + 4)}" fill="url(#floor)"/>`;
  // разметка пола
  s += `<rect x="${LEFT}" y="${FLOOR_Y}" width="${OPEN.w}" height="1.5" fill="#000" opacity="0.5"/>`;
  // потёки и пятна на стене
  for (let i = 0; i < rnd.int(3, 6); i++) {
    const wx = rnd.range(LEFT + 30, RIGHT - 30);
    const wy = rnd.range(TOP + 10, FLOOR_Y - 40);
    s += `<ellipse cx="${n(wx)}" cy="${n(wy)}" rx="${n(rnd.range(12, 44))}" ry="${n(rnd.range(20, 80))}"
      fill="#0d0a07" opacity="${n(rnd.range(0.08, 0.2))}"/>`;
  }
  s += speckle(LEFT, TOP, OPEN.w, FLOOR_Y - TOP, rnd, '#000', 70, 0.22);
  s += backLight(pal, rnd, cx);
  s += debris(rnd, rnd.int(4, 9));

  // ── предмет ────────────────────────────────────────────────────────
  s += item;

  // ── луч фонарика поверх предмета ────────────────────────────────────
  s += `<polygon points="${poly([[apexX, -60], [cx - beamHalf, H + 40], [cx + beamHalf, H + 40]])}" fill="url(#beam)"/>`;
  s += `<polygon points="${poly([[apexX, -60], [cx - beamHalf * 0.34, H + 40], [cx + beamHalf * 0.34, H + 40]])}" fill="url(#beamCore)"/>`;
  s += motes(cx, beamHalf, rnd, rnd.int(40, 80));
  s += `</g>`; // конец clip

  // ── дверь снаружи, прикрывает левый край проёма ─────────────────────
  s += `<rect x="${n(LEFT - 14)}" y="${n(TOP - 14)}" width="${n(doorBandW)}" height="${n(OPEN.h + 28)}" fill="url(#door)"/>`;
  // рёбра жалюзи
  for (let y = TOP - 6; y < BOTTOM + 8; y += 13) {
    s += `<rect x="${n(LEFT - 14)}" y="${n(y)}" width="${n(doorBandW)}" height="4" fill="#000" opacity="0.34"/>`;
    s += `<rect x="${n(LEFT - 14)}" y="${n(y + 4)}" width="${n(doorBandW)}" height="1.5" fill="#fff" opacity="0.07"/>`;
  }
  s += `<rect x="${n(LEFT + doorBandW - 5)}" y="${n(TOP - 14)}" width="5" height="${n(OPEN.h + 28)}" fill="#000" opacity="0.42"/>`;
  // петли
  for (const hy of [TOP + 30, FLOOR_Y - 20]) {
    s += `<rect x="${n(LEFT - 12)}" y="${n(hy)}" width="34" height="17" rx="3" fill="${shade(pal.metalDark, 0.1)}"/>`;
    s += `<circle cx="${n(LEFT + 8)}" cy="${n(hy + 8.5)}" r="3.4" fill="#0a0908"/>`;
  }
  // навесной замок
  s += `<g transform="translate(${n(LEFT + doorBandW - 2)} ${n(FLOOR_Y + 62)})">
    <path d="M 6 0 a 8 8 0 0 1 16 0 v 8 h -16 z" fill="none" stroke="#9a938a" stroke-width="4"/>
    <rect x="0" y="8" width="28" height="22" rx="3" fill="#8d857b"/>
    <rect x="0" y="8" width="28" height="7" rx="3" fill="#b3aaa0" opacity="0.7"/>
    <circle cx="14" cy="19" r="3.6" fill="#26221e"/>
  </g>`;

  // ── рама справа и перекладина сверху ───────────────────────────────
  s += `<rect x="${n(RIGHT - 3)}" y="${n(TOP - 14)}" width="18" height="${n(OPEN.h + 28)}" fill="#0e0c0a"/>`;
  s += `<rect x="${n(LEFT - 14)}" y="${n(TOP - 30)}" width="${n(OPEN.w + 28)}" height="17" fill="#0e0c0a"/>`;
  s += `<rect x="${n(LEFT - 14)}" y="${n(TOP - 30)}" width="${n(OPEN.w + 28)}" height="3" fill="#3a342c" opacity="0.6"/>`;

  // ── трафарет и передняя виньетка ───────────────────────────────────
  s += stencil(rnd);
  s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;

  return s;
}

export function wrap(inner, pal) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${inner}</svg>`;
}
