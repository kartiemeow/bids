// Дорогой лут (лоты 91–100). Предметы драгоценные: золото, нефрит, самоцветы.
// Рисуем ярче и детальнее среднего тира, но сцена остаётся той же кладовкой.

import { n, lerp, poly, polar, arcPath, shade, withAlpha, grime, crack, speckle } from './lib.js';

const DEFS = `<defs>
  <linearGradient id="gGold" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#fff0bd"/>
    <stop offset="0.28" stop-color="#f7cf6a"/>
    <stop offset="0.62" stop-color="#d9a02c"/>
    <stop offset="1" stop-color="#8f5f14"/>
  </linearGradient>
  <linearGradient id="gJade" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#c9f0c8"/>
    <stop offset="0.35" stop-color="#6fbf88"/>
    <stop offset="0.75" stop-color="#2f7a4c"/>
    <stop offset="1" stop-color="#17452c"/>
  </linearGradient>
  <linearGradient id="gRock" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#6b635a"/>
    <stop offset="0.4" stop-color="#37322c"/>
    <stop offset="1" stop-color="#15120f"/>
  </linearGradient>
  <linearGradient id="gShell" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#f2dcaa"/>
    <stop offset="0.4" stop-color="#c69a4e"/>
    <stop offset="1" stop-color="#6d4a1c"/>
  </linearGradient>
  <linearGradient id="gFrame" x1="0" y1="0" x2="0.25" y2="1">
    <stop offset="0" stop-color="#ffe9a8"/>
    <stop offset="0.35" stop-color="#c99a35"/>
    <stop offset="0.72" stop-color="#8a6216"/>
    <stop offset="1" stop-color="#e8c56a"/>
  </linearGradient>
  <linearGradient id="gVelvet" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0" stop-color="#7a1220"/>
    <stop offset="0.5" stop-color="#4d0a13"/>
    <stop offset="1" stop-color="#26050b"/>
  </linearGradient>
  <linearGradient id="gSilver" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#f4f7fa"/>
    <stop offset="0.4" stop-color="#b9c2cb"/>
    <stop offset="1" stop-color="#5d666f"/>
  </linearGradient>
  <linearGradient id="gCanvas" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0" stop-color="#3c2f1c"/>
    <stop offset="0.55" stop-color="#241a10"/>
    <stop offset="1" stop-color="#120c07"/>
  </linearGradient>
  <radialGradient id="gGemR" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#ff9aa2"/>
    <stop offset="1" stop-color="#8e1220"/>
  </radialGradient>
  <radialGradient id="gGemB" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#9fd0ff"/>
    <stop offset="1" stop-color="#123a7a"/>
  </radialGradient>
  <radialGradient id="gGemE" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#b6ffe6"/>
    <stop offset="1" stop-color="#0d5c42"/>
  </radialGradient>
  <radialGradient id="gGlowGold" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffd98a" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
  </radialGradient>
</defs>`;

/** Мягкий контровой свет вокруг предмета */
const rim = (cx, y, w, h, op = 0.34) =>
  `<ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(w * 0.62)}" ry="${n(h * 0.64)}" fill="url(#gGlowGold)" opacity="${n(op)}"/>`;

/** Искра-блик */
const sparkle = (x, y, s, op = 0.9) =>
  `<path d="${poly([[x, y - s], [x + s * 0.2, y - s * 0.2], [x + s, y], [x + s * 0.2, y + s * 0.2],
    [x, y + s], [x - s * 0.2, y + s * 0.2], [x - s, y], [x - s * 0.2, y - s * 0.2]])}"
    fill="#fff8e0" opacity="${n(op)}"/>`;

/** Мелкие пылинки-искры вокруг предмета. floor — линия пола: пыль не должна
 *  уходить под сцену, поэтому вертикальный размах сверху ограничиваем. */
const dust = (cx, y, rx, ry, rnd, count = 14, floor = Infinity) => {
  const ryMax = Math.min(ry, floor - y);
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * rx * r;
    const yy = y + Math.sin(a) * Math.max(0, ryMax) * r;
    out += `<circle cx="${n(x)}" cy="${n(yy)}" r="${n(rnd.range(0.8, 2.6))}" fill="#ffeab8"
      opacity="${n(rnd.range(0.15, 0.55))}"/>`;
  }
  return out;
};

/** Светящаяся трещина в камне */
const hotCrack = (cx, cy, len, rnd) => {
  const pts = [[cx, cy]];
  let x = cx;
  let y = cy;
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    x += rnd.range(-16, 16);
    y -= len / steps;
    pts.push([x, y]);
  }
  const d = `M ${poly(pts).split(' ').join(' L ')}`;
  return `<path d="${d}" fill="none" stroke="#ff8a2b" stroke-width="7" stroke-linecap="round"
      opacity="0.35" filter="url(#soft)"/>
    <path d="${d}" fill="none" stroke="#ff9b3a" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <path d="${d}" fill="none" stroke="#ffe2a8" stroke-width="1.2" stroke-linecap="round" opacity="0.95"/>`;
};

/** Матрёшка. body может быть url(#градиент) — тогда цвет головы задаётся явно. */
function doll(x, base, w, h, body, trim, rnd, headFill) {
  const hr = w * 0.34;
  const hcy = base - h + hr;
  const head = headFill || shade(body, 0.1);
  let s = `<ellipse cx="${n(x)}" cy="${n(base + 3)}" rx="${n(w * 0.6)}" ry="9" fill="#000"
    opacity="0.42" filter="url(#soft)"/>`;
  s += `<path d="M ${n(x - w * 0.5)} ${n(base)} q ${n(-w * 0.04)} ${n(-h * 0.48)} ${n(w * 0.14)} ${n(-h * 0.6)}
    q ${n(w * 0.2)} ${n(-h * 0.09)} ${n(w * 0.4)} 0 q ${n(w * 0.2)} ${n(h * 0.12)} ${n(w * 0.22)} ${n(h * 0.6)} Z" fill="${body}"/>`;
  s += `<path d="M ${n(x - w * 0.44)} ${n(base)} q ${n(w * 0.1)} ${n(-h * 0.3)} ${n(w * 0.2)} ${n(-h * 0.42)}
    l 0 ${n(h * 0.42)} Z" fill="#fff" opacity="0.12"/>`;
  s += `<circle cx="${n(x)}" cy="${n(hcy)}" r="${n(hr)}" fill="${head}"/>`;
  s += `<path d="M ${n(x - hr * 0.94)} ${n(hcy + hr * 0.62)} q ${n(hr * 0.94)} ${n(hr * 0.52)} ${n(hr * 1.88)} 0
    l 0 ${n(hr * 0.36)} q ${n(-hr * 0.94)} ${n(h * 0.08)} ${n(-hr * 1.88)} 0 Z" fill="${trim}"/>`;
  s += `<circle cx="${n(x - hr * 0.34)}" cy="${n(hcy - hr * 0.12)}" r="3.1" fill="#2a1a10"/>`;
  s += `<circle cx="${n(x + hr * 0.34)}" cy="${n(hcy - hr * 0.12)}" r="3.1" fill="#2a1a10"/>`;
  s += `<path d="M ${n(x - hr * 0.3)} ${n(hcy + hr * 0.34)} q ${n(hr * 0.3)} ${n(hr * 0.26)} ${n(hr * 0.6)} 0"
    stroke="#2a1a10" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="${n(x)}" cy="${n(base - h * 0.44)}" r="${n(w * 0.2)}" fill="none" stroke="${trim}"
    stroke-width="2.4" opacity="0.85"/>`;
  s += `<circle cx="${n(x)}" cy="${n(base - h * 0.44)}" r="${n(w * 0.1)}" fill="${trim}" opacity="0.85"/>`;
  return s;
}

export const RICH = {
  // 91 ── Золотой слиток
  goldbar({ rnd, pal, cx, base }) {
    const bw = 128; // ширина слитка
    const bh = 40; // высота
    const topIn = 20; // скос верхней грани
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 4)}" rx="126" ry="15" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    // отражение на полу
    s += `<ellipse cx="${n(cx)}" cy="${n(base + 12)}" rx="112" ry="12" fill="url(#gGold)" opacity="0.2"/>`;
    // штабель: два нижних, один наверху со смещением
    const bars = [
      { x: cx - 68, y: base - 26, w: bw, r: -3 },
      { x: cx + 68, y: base - 26, w: bw, r: 3 },
      { x: cx, y: base - 66, w: bw, r: -1 },
    ];
    for (const b of bars) {
      const x = b.x;
      const y = b.y;
      const w = b.w;
      const h = bh;
      const ti = topIn;
      s += `<g transform="rotate(${n(b.r)} ${n(x)} ${n(y + h)})">`;
      // тёмная боковая грань (глубина)
      s += `<path d="${poly([[x + w / 2, y], [x + w / 2 - ti + 14, y - 11], [x + w / 2 - ti + 14, y + h - 11], [x + w / 2, y + h]])}" fill="#6b4710"/>`;
      // верхняя грань
      s += `<path d="${poly([[x - w / 2 + ti, y], [x + w / 2 - ti, y], [x + w / 2 - ti + 14, y - 11], [x - w / 2 + ti + 14, y - 11]])}" fill="#fff0bd"/>`;
      // передняя грань — трапеция
      s += `<path d="${poly([[x - w / 2 + ti, y], [x + w / 2 - ti, y], [x + w / 2, y + h], [x - w / 2, y + h]])}" fill="url(#gGold)"/>`;
      // клеймо
      s += `<rect x="${n(x - 26)}" y="${n(y + h * 0.2)}" width="52" height="18" rx="2" fill="#8a5f16" opacity="0.55"/>`;
      s += `<text x="${n(x)}" y="${n(y + h * 0.2 + 13)}" font-family="'Arial Black',Arial,sans-serif"
        font-size="11" font-weight="900" text-anchor="middle" fill="#ffe9a8" opacity="0.95">999.9</text>`;
      s += `<text x="${n(x)}" y="${n(y + h * 0.78)}" font-family="Arial,sans-serif" font-size="9"
        text-anchor="middle" fill="#7a5210" opacity="0.8">1 KG · FINE GOLD</text>`;
      // блики
      s += `<path d="M ${n(x - w / 2 + ti + 5)} ${n(y + 3)} L ${n(x - w / 2 + 3)} ${n(y + h - 3)}" stroke="#fff6d2" stroke-width="4" opacity="0.45"/>`;
      s += `<path d="M ${n(x + w / 2 - ti - 5)} ${n(y + 3)} L ${n(x + w / 2 - 3)} ${n(y + h - 3)}" stroke="#5e3f0c" stroke-width="3" opacity="0.4"/>`;
      s += `</g>`;
      s += sparkle(x + w * 0.28, y - 4, 7, 0.5);
    }
    // монетки рядом для масштаба
    for (let i = 0; i < 3; i++) {
      const px = cx + 122 + (i % 2) * 20;
      const py = base - 8 - Math.floor(i / 2) * 9;
      s += `<ellipse cx="${n(px)}" cy="${n(py)}" rx="11" ry="5" fill="url(#gGold)"/>`;
      s += `<ellipse cx="${n(px)}" cy="${n(py - 1)}" rx="11" ry="5" fill="#f7cf6a"/>`;
      s += `<ellipse cx="${n(px)}" cy="${n(py - 1.6)}" rx="6" ry="2.6" fill="#8f5f14" opacity="0.6"/>`;
    }
    s += rim(cx, base - 70, 240, 150, 0.32);
    s += dust(cx, base - 96, 130, 92, rnd, 12);
    return s + grime(cx, base - 70, 210, 90, rnd, pal, 3);
  },

  // 92 ── Нефритовый лев
  jade({ rnd, pal, cx, base }) {
    const jg = 'url(#gJade)';
    const hx = cx + rnd.range(-4, 4);
    const hy = base - 158;
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="104" ry="13" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    // подставка
    s += `<rect x="${n(cx - 68)}" y="${n(base - 24)}" width="136" height="24" rx="4" fill="#4b2a17"/>`;
    s += `<rect x="${n(cx - 68)}" y="${n(base - 24)}" width="136" height="6" rx="3" fill="#7c4a26"/>`;
    s += `<path d="M ${n(cx - 46)} ${n(base - 24)} q 6 -12 0 -20 h 92 q -6 8 0 20 z" fill="#5a3319"/>`;
    // тело
    s += `<path d="M ${n(cx - 54)} ${n(base - 24)} q ${n(-8)} ${n(-72)} ${n(22)} ${n(-86)}
      q ${n(32)} ${n(-16)} ${n(58)} 0 q ${n(28)} ${n(16)} ${n(26)} ${n(86)} Z" fill="${jg}"/>`;
    s += `<ellipse cx="${n(cx + 4)}" cy="${n(base - 96)}" rx="32" ry="30" fill="${shade('#3f8f5c', 0.1)}"/>`;
    // облачный узор на боку
    s += `<path d="${arcPath(cx - 22, base - 78, 15, 200, 20)}" fill="none" stroke="#d8f0d0" stroke-width="2.4" opacity="0.5"/>`;
    s += `<path d="${arcPath(cx + 6, base - 66, 12, 190, 350)}" fill="none" stroke="#d8f0d0" stroke-width="2.2" opacity="0.45"/>`;
    // лапы
    for (const dx of [-34, 36]) {
      s += `<path d="M ${n(cx + dx - 12)} ${n(base - 80)} h 24 v 38 a 12 12 0 0 1 -24 0 z" fill="${jg}"/>`;
      s += `<rect x="${n(cx + dx - 12)}" y="${n(base - 46)}" width="24" height="7" rx="3" fill="#123d25" opacity="0.5"/>`;
      s += `<circle cx="${n(cx + dx)}" cy="${n(base - 58)}" r="4" fill="none" stroke="#e8c25a" stroke-width="1.8" opacity="0.8"/>`;
    }
    // хвост
    s += `<path d="M ${n(cx - 46)} ${n(base - 46)} q ${n(-34)} ${n(-6)} ${n(-22)} ${n(-40)}
      q ${n(8)} ${n(-24)} ${n(24)} ${n(-26)}" fill="none" stroke="#2f7a4c" stroke-width="9" stroke-linecap="round"/>`;
    s += `<circle cx="${n(cx - 40)}" cy="${n(base - 92)}" r="9" fill="#3f9a5f"/>`;
    // грива
    for (let i = 0; i < 12; i++) {
      const a = -188 + i * 15.5;
      const [px, py] = polar(hx, hy, 33, a);
      s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(rnd.range(9, 13))}" fill="${jg}"/>`;
      s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(rnd.range(3.4, 5.4))}" fill="none"
        stroke="#12402a" stroke-width="1.8" opacity="0.7"/>`;
    }
    // морда
    s += `<ellipse cx="${n(hx)}" cy="${n(hy + 6)}" rx="24" ry="21" fill="${shade('#57a874', 0.12)}"/>`;
    s += `<ellipse cx="${n(hx)}" cy="${n(hy + 13)}" rx="11" ry="7" fill="#0f3524"/>`;
    s += `<path d="M ${n(hx - 9)} ${n(hy + 18)} q 9 6 18 0" stroke="#0f3524" stroke-width="2.4" fill="none"/>`;
    for (const dx of [-11, 11]) {
      s += `<ellipse cx="${n(hx + dx)}" cy="${n(hy + 1)}" rx="5.5" ry="4.6" fill="#f0d27a"/>`;
      s += `<circle cx="${n(hx + dx)}" cy="${n(hy + 1)}" r="2" fill="#241a08"/>`;
      s += `<circle cx="${n(hx + dx - 1.4)}" cy="${n(hy - 0.4)}" r="0.9" fill="#fff" opacity="0.9"/>`;
    }
    s += rim(cx, base - 110, 210, 220, 0.28);
    s += dust(cx, base - 120, 120, 110, rnd, 10);
    s += sparkle(hx + 30, hy - 34, 8, 0.6);
    return s + grime(cx, base - 110, 150, 200, rnd, pal, 2);
  },

  // 93 ── Метеорит
  meteorite({ rnd, pal, cx, base }) {
    const R = rnd.range(74, 86);
    const cy = base - R - 14;
    const k = rnd.int(9, 12);
    const pts = [];
    for (let i = 0; i < k; i++) {
      pts.push(polar(cx, cy, R * rnd.range(0.76, 1.08), (360 / k) * i));
    }
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(R * 0.9)}" ry="13" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    s += `<polygon points="${poly(pts)}" fill="url(#gRock)"/>`;
    // грани
    for (let i = 0; i < 5; i++) {
      const a = rnd.range(0, 360);
      const [x1, y1] = polar(cx, cy, R * rnd.range(0.2, 0.4), a);
      const [x2, y2] = polar(cx, cy, R * rnd.range(0.8, 1.02), a + rnd.range(20, 70));
      const [x3, y3] = polar(cx, cy, R * rnd.range(0.5, 0.9), a + rnd.range(90, 150));
      s += `<polygon points="${poly([[x1, y1], [x2, y2], [x3, y3]])}"
        fill="${rnd.chance(0.5) ? '#8d857a' : '#100e0b'}" opacity="${n(rnd.range(0.08, 0.2))}"/>`;
    }
    // корка
    s += `<polygon points="${poly(pts)}" fill="none" stroke="#6b635a" stroke-width="2" opacity="0.4"/>`;
    // светящиеся трещины
    s += hotCrack(cx + rnd.range(-20, 20), cy + R * 0.4, R * 0.85, rnd);
    s += hotCrack(cx + rnd.range(-30, 30), cy + R * 0.2, R * 0.6, rnd);
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R * 1.5)}" fill="url(#gGlowGold)" opacity="0.35"/>`;
    s += dust(cx, cy, R * 1.5, R * 1.5, rnd, 16, base);
    s += sparkle(cx - R * 0.5, cy - R * 0.5, 9, 0.7);
    s += sparkle(cx + R * 0.6, cy + R * 0.2, 7, 0.5);
    return s;
  },

  // 94 ── Аммонит
  ammonite({ rnd, pal, cx, base }) {
    const R = 88;
    const cy = base - R - 26;
    const b = 0.3;
    const a0 = 1.15;
    const thMax = Math.PI * 4.5;
    const steps = 110;
    const at = (th) => a0 * Math.exp(b * th);
    const pt = (th) => {
      const r = at(th);
      return [cx + Math.cos(th) * r, cy - Math.sin(th) * r];
    };
    const inner = [];
    const outer = [];
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * thMax;
      const [ox, oy] = pt(th);
      outer.push([ox, oy]);
      inner.push([cx + (ox - cx) * 0.4, cy + (oy - cy) * 0.4]);
    }
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="86" ry="12" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    // подставка
    s += `<path d="M ${n(cx - 44)} ${n(base)} q 44 -30 88 0 z" fill="#3a2415"/>`;
    s += `<path d="M ${n(cx - 44)} ${n(base)} q 44 -30 88 0" fill="none" stroke="#6b4324" stroke-width="4"/>`;
    // раковина: внешняя спираль + внутренний завиток
    s += `<path d="M ${poly(outer).split(' ').join(' L ')} Z
      M ${poly(inner).split(' ').join(' L ')} Z" fill="url(#gShell)" fill-rule="evenodd"/>`;
    // рёбра
    for (let i = 4; i < steps; i += 6) {
      const [ox, oy] = outer[i];
      const [ix, iy] = inner[i];
      s += `<line x1="${n(ox)}" y1="${n(oy)}" x2="${n(ix)}" y2="${n(iy)}" stroke="#5d3f16"
        stroke-width="1.8" opacity="0.45"/>`;
    }
    // блик по спирали
    s += `<path d="M ${poly(outer.slice(2, 40)).split(' ').join(' L ')}" fill="none" stroke="#fff2c8"
      stroke-width="3" opacity="0.35" stroke-linecap="round"/>`;
    s += `<path d="M ${poly(outer).split(' ').join(' L ')}" fill="none" stroke="#3d2a0e" stroke-width="2" opacity="0.5"/>`;
    s += rim(cx, cy, 190, 190, 0.26);
    s += dust(cx, cy, 110, 110, rnd, 10);
    s += sparkle(cx - R * 0.62, cy - R * 0.34, 8, 0.55);
    return s + grime(cx, cy, R * 1.6, R * 1.6, rnd, pal, 3);
  },

  // 95 ── Матрёшка с золотом
  matryoshka({ rnd, pal, cx, base }) {
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="122" ry="13" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - 124)}" y="${n(base - 8)}" width="248" height="9" rx="4" fill="#3f2c1a"/>`;
    s += doll(cx - 74, base, 92, 152, '#8c1626', '#e8c25a', rnd);
    s += doll(cx + 74, base, 92, 152, '#1c3f7a', '#e8c25a', rnd);
    // раскрытая большая — тёмная середина
    s += `<ellipse cx="${n(cx)}" cy="${n(base - 56)}" rx="34" ry="40" fill="#1c0a08" opacity="0.9"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(base - 52)}" rx="30" ry="36" fill="url(#gVelvet)"/>`;
    // маленькая золотая
    s += `<circle cx="${n(cx)}" cy="${n(base - 52)}" r="60" fill="url(#gGlowGold)" opacity="0.5"/>`;
    s += doll(cx, base - 6, 52, 88, 'url(#gGold)', '#8c1626', rnd, '#ffeeb8');
    s += rim(cx, base - 80, 240, 170, 0.3);
    s += dust(cx, base - 90, 130, 80, rnd, 12);
    s += sparkle(cx, base - 118, 10, 0.85);
    s += sparkle(cx - 24, base - 74, 6, 0.5);
    return s;
  },

  // 96 ── Старинная картина
  painting({ rnd, pal, cx, base }) {
    const w = 206;
    const h = 246;
    const y = base - h - 4;
    const lean = rnd.range(-4, 4);
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.5)}" ry="12" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    s += `<g transform="rotate(${n(lean)} ${n(cx)} ${n(base)})">`;
    // рама
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="4" fill="url(#gFrame)"/>`;
    s += `<rect x="${n(cx - w / 2 + 5)}" y="${n(y + 5)}" width="${n(w - 10)}" height="${n(h - 10)}"
      fill="none" stroke="#5d3f0c" stroke-width="2" opacity="0.5"/>`;
    // золотая филёнка
    s += `<rect x="${n(cx - w / 2 + 12)}" y="${n(y + 12)}" width="${n(w - 24)}" height="${n(h - 24)}"
      fill="#8a6216"/>`;
    s += `<rect x="${n(cx - w / 2 + 16)}" y="${n(y + 16)}" width="${n(w - 32)}" height="${n(h - 32)}"
      fill="url(#gCanvas)"/>`;
    // картина: луна и холмы
    s += `<circle cx="${n(cx + 40)}" cy="${n(y + 58)}" r="21" fill="#e9d9a8" opacity="0.85"/>`;
    s += `<circle cx="${n(cx + 40)}" cy="${n(y + 58)}" r="30" fill="url(#gGlowGold)" opacity="0.5"/>`;
    s += `<path d="M ${n(cx - w / 2 + 16)} ${n(y + h - 74)}
      q 34 -40 66 -12 q 30 26 60 -8 q 30 -32 58 20 z" fill="#2f3a24" opacity="0.95"/>`;
    s += `<path d="M ${n(cx - w / 2 + 16)} ${n(y + h - 44)} q 40 -26 76 -6 q 34 20 68 -12
      l 4 30 h -148 z" fill="#1b2313"/>`;
    s += `<path d="M ${n(cx - 34)} ${n(y + h - 40)} l 12 -58 l 12 58 z" fill="#141a0e"/>`;
    s += `<path d="M ${n(cx - 34)} ${n(y + h - 98)} q 26 -12 44 6 q -22 8 -44 -6 z" fill="#141a0e"/>`;
    // потёртости и блик стекла
    s += `<path d="M ${n(cx - w / 2 + 16)} ${n(y + h - 32)} l ${n(w - 32)} ${n(-h + 48)}"
      stroke="#fff" stroke-width="12" opacity="0.05"/>`;
    s += crack(cx - w * 0.2, y + h * 0.4, h * 0.3, rnd, '#0d0906', 0.4);
    // уголки
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const px = cx + dx * (w / 2 - 8);
      const py = y + h / 2 + dy * (h / 2 - 8);
      s += `<path d="M ${n(px - dx * 16)} ${n(py)} q ${n(dx * 10)} ${n(-dy * 4)} ${n(dx * 16)} ${n(-dy * 16)}"
        fill="none" stroke="#ffe9a8" stroke-width="3" opacity="0.75" stroke-linecap="round"/>`;
      s += `<circle cx="${n(px - dx * 5)}" cy="${n(py - dy * 5)}" r="4" fill="#ffe9a8" opacity="0.8"/>`;
    }
    // латунная табличка
    s += `<rect x="${n(cx - 30)}" y="${n(base - 30)}" width="60" height="17" rx="3" fill="#b08a3a"/>`;
    s += `<rect x="${n(cx - 30)}" y="${n(base - 30)}" width="60" height="6" rx="3" fill="#e0bb62" opacity="0.8"/>`;
    s += `</g>`;
    s += rim(cx, base - h * 0.5, 240, h, 0.24);
    s += sparkle(cx - w * 0.3, y + 30, 7, 0.5);
    return s + grime(cx, base - h * 0.5, w, h, rnd, pal, 4);
  },

  // 97 ── Кинжал в серебряных ножнах
  dagger({ rnd, pal, cx, base }) {
    const L = 244;
    const lean = rnd.range(16, 24);
    const bx = cx + 34;
    const by = base;
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="86" ry="12" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    s += `<g transform="rotate(${n(lean)} ${n(bx)} ${n(by)})">`;
    // ножны
    s += `<path d="M ${n(bx - 15)} ${n(by - 10)} L ${n(bx - 11)} ${n(by - L * 0.86)}
      L ${n(bx + 11)} ${n(by - L * 0.86)} L ${n(bx + 15)} ${n(by - 10)} Z" fill="url(#gSilver)"/>`;
    s += `<rect x="${n(bx - 4)}" y="${n(by - L * 0.8)}" width="3" height="${n(L * 0.66)}" fill="#fff" opacity="0.3"/>`;
    s += `<path d="M ${n(bx - 15)} ${n(by - 40)} h 30" stroke="#6c7680" stroke-width="3" opacity="0.7"/>`;
    // клинок
    s += `<path d="M ${n(bx - 12)} ${n(by - 44)} L ${n(bx - 9)} ${n(by - L * 0.92)}
      L ${n(bx)} ${n(by - L)} L ${n(bx + 9)} ${n(by - L * 0.92)} L ${n(bx + 12)} ${n(by - 44)} Z"
      fill="url(#gSilver)"/>`;
    s += `<path d="M ${n(bx - 2)} ${n(by - 50)} L ${n(bx - 2)} ${n(by - L * 0.93)} L ${n(bx + 2)} ${n(by - L * 0.93)}
      L ${n(bx + 2)} ${n(by - 50)} Z" fill="#0f1518" opacity="0.28"/>`;
    s += `<path d="M ${n(bx - 10)} ${n(by - 52)} l -2 ${n(-L * 0.36)}" stroke="#fff" stroke-width="2" opacity="0.5"/>`;
    // гарда
    s += `<path d="M ${n(bx - 40)} ${n(by - 34)} q 40 12 80 0 q -6 -14 -40 -14 q -34 0 -40 14 z" fill="url(#gGold)"/>`;
    s += `<path d="M ${n(bx - 40)} ${n(by - 34)} q 40 12 80 0" fill="none" stroke="#6b4a10" stroke-width="1.6" opacity="0.6"/>`;
    // рукоять
    s += `<rect x="${n(bx - 11)}" y="${n(by - 6)}" width="22" height="30" rx="5" fill="#2c1a12"/>`;
    for (let i = 0; i < 4; i++) {
      s += `<path d="M ${n(bx - 11)} ${n(by + i * 7 - 4)} h 22" stroke="url(#gGold)" stroke-width="3"/>`;
    }
    // навершие
    s += `<circle cx="${n(bx)}" cy="${n(by - 12)}" r="13" fill="url(#gGold)"/>`;
    s += `<circle cx="${n(bx)}" cy="${n(by - 12)}" r="6" fill="url(#gGemR)"/>`;
    s += `<circle cx="${n(bx - 2)}" cy="${n(by - 14)}" r="1.8" fill="#fff" opacity="0.8"/>`;
    s += `</g>`;
    s += rim(bx - 30, base - 120, 180, 250, 0.26);
    s += dust(cx - 10, base - 130, 90, 110, rnd, 10);
    s += sparkle(bx - 26, base - 210, 9, 0.7);
    s += sparkle(bx - 12, base - 30, 6, 0.5);
    return s + grime(cx - 10, base - 120, 90, 220, rnd, pal, 3);
  },

  // 98 ── Золотые карманные часы
  goldwatch({ rnd, pal, cx, base }) {
    const R = 54;
    const cy = base - R - 34;
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="76" ry="12" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    // цепочка на полу
    s += `<path d="M ${n(cx - 20)} ${n(base - 6)} q ${n(-70)} ${n(10)} ${n(-84)} ${n(-70)}
      q ${n(-6)} ${n(-40)} ${n(40)} ${n(-44)}" fill="none" stroke="url(#gGold)" stroke-width="7"
      stroke-dasharray="3 9" stroke-linecap="round" opacity="0.95"/>`;
    s += `<path d="M ${n(cx + 20)} ${n(base - 6)} q ${n(76)} ${n(8)} ${n(88)} ${n(-64)}"
      fill="none" stroke="url(#gGold)" stroke-width="7" stroke-dasharray="3 9" stroke-linecap="round" opacity="0.9"/>`;
    // дужка и венчик
    s += `<path d="M ${n(cx - 14)} ${n(cy - R - 2)} a 15 15 0 0 1 28 0" fill="none" stroke="url(#gGold)" stroke-width="6"/>`;
    s += `<rect x="${n(cx - 9)}" y="${n(cy - R - 12)}" width="18" height="12" rx="3" fill="url(#gGold)"/>`;
    // корпус
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R)}" fill="url(#gGold)"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R - 5)}" fill="none" stroke="#8a5f14" stroke-width="2" opacity="0.6"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R - 9)}" fill="#f4ead0"/>`;
    // римские цифры
    const nums = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    for (let i = 0; i < 12; i++) {
      const a = i * 30 - 90;
      const [tx, ty] = polar(cx, cy, R - 18, a);
      s += `<text x="${n(tx)}" y="${n(ty + 3.4)}" font-family="'Times New Roman',Georgia,serif"
        font-size="8.5" font-weight="700" text-anchor="middle" fill="#2c241a" opacity="0.85">${nums[i]}</text>`;
    }
    // стрелки
    const ha = rnd.range(-120, -60);
    const ma = rnd.range(0, 360);
    const [hxp, hyp] = polar(cx, cy, R - 24, ha);
    const [mxp, myp] = polar(cx, cy, R - 13, ma);
    s += `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(hxp)}" y2="${n(hyp)}" stroke="#1c1710" stroke-width="3.4" stroke-linecap="round"/>`;
    s += `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(mxp)}" y2="${n(myp)}" stroke="#1c1710" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<line x1="${n(cx - 5)}" y1="${n(cy + 3)}" x2="${n(cx - 17)}" y2="${n(cy - 13)}" stroke="#8e1b24" stroke-width="1.4" stroke-linecap="round"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="3.4" fill="#8a5f14"/>`;
    // стекло
    s += `<path d="M ${n(cx - R + 12)} ${n(cy - 12)} a ${n(R - 12)} ${n(R - 12)} 0 0 1 ${n(R - 30)} ${n(-R + 22)}"
      fill="#fff" opacity="0.16"/>`;
    s += rim(cx, cy, 160, 160, 0.28);
    s += dust(cx, cy, 96, 96, rnd, 10);
    s += sparkle(cx - R * 0.6, cy - R * 0.5, 8, 0.6);
    return s;
  },

  // 99 ── Окаменелость динозавра
  dino({ rnd, pal, cx, base }) {
    const bone = '#e6dcc0';
    const boneD = '#a89c7c';
    const boneS = '#fdf8e6';
    // точка пола плиты
    const gY = base - 8;
    const spineY = gY - 96; // линия позвоночника
    const headX = cx - 128; // череп слева
    const tailX = cx + 122; // хвост вправо
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="140" ry="14" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    // плита породы
    const slab = `${poly([
      [cx - 142, gY + 6], [cx - 126, gY - 74], [cx - 60, gY - 132], [cx + 44, gY - 138],
      [cx + 126, gY - 92], [cx + 146, gY - 16], [cx + 120, gY + 8], [cx - 20, gY + 12],
    ])}`;
    s += `<polygon points="${slab}" fill="url(#gRock)"/>`;
    s += `<polygon points="${slab}" fill="none" stroke="#8a7f6e" stroke-width="2.4" opacity="0.45"/>`;
    s += `<polygon points="${poly([[cx - 132, gY], [cx - 118, gY - 70], [cx - 58, gY - 124], [cx + 40, gY - 130], [cx + 40, gY - 96], [cx - 60, gY - 88], [cx - 108, gY - 30]])}" fill="#fff" opacity="0.05"/>`;
    // янтарные прожилки
    for (let i = 0; i < 5; i++) {
      const [ax, ay] = polar(cx, gY - 62, rnd.range(40, 100), rnd.range(150, 330));
      s += `<path d="M ${n(ax)} ${n(ay)} q ${n(rnd.range(-30, 30))} ${n(rnd.range(-20, 20))}
        ${n(rnd.range(-50, 50))} ${n(rnd.range(-30, 30))}" fill="none" stroke="#c98a3a"
        stroke-width="3" opacity="0.3"/>`;
    }
    // хвост: сужающаяся цепочка позвонков вправо-вниз
    for (let i = 0; i < 11; i++) {
      const t = i / 10;
      const tx = cx + 36 + t * (tailX - cx - 36);
      const ty = spineY + 4 + t * 40;
      const r = lerp(11, 3.4, t);
      s += `<g transform="rotate(${n(28 + t * 30)} ${n(tx)} ${n(ty)})">
        <rect x="${n(tx - r)}" y="${n(ty - r * 0.72)}" width="${n(r * 2)}" height="${n(r * 1.44)}" rx="${n(r * 0.5)}" fill="${bone}"/>
        <path d="M ${n(tx - r * 1.5)} ${n(ty - r * 0.3)} L ${n(tx - r * 0.6)} ${n(ty - r * 0.2)} L ${n(tx - r * 0.6)} ${n(ty + r * 0.4)} L ${n(tx - r * 1.5)} ${n(ty + r * 0.5)} Z" fill="${boneD}"/>
        <circle cx="${n(tx - r * 0.9)}" cy="${n(ty)}" r="${n(r * 0.26)}" fill="#100e0b" opacity="0.5"/>
      </g>`;
    }
    // таз
    s += `<path d="M ${n(cx + 18)} ${n(spineY - 6)} C ${n(cx + 44)} ${n(spineY - 18)} ${n(cx + 60)} ${n(spineY + 2)} ${n(cx + 52)} ${n(spineY + 26)}
      C ${n(cx + 44)} ${n(spineY + 44)} ${n(cx + 16)} ${n(spineY + 40)} ${n(cx + 8)} ${n(spineY + 20)} Z" fill="${bone}"/>`;
    s += `<ellipse cx="${n(cx + 34)}" cy="${n(spineY + 12)}" rx="9" ry="12" fill="#14110d" opacity="0.6"/>`;
    // позвоночник
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const vx = lerp(cx - 26, cx + 40, t);
      const vy = spineY - 4 - Math.sin(t * Math.PI) * 8;
      s += `<g transform="rotate(${n(-14 + t * 22)} ${n(vx)} ${n(vy)})">
        <rect x="${n(vx - 10)}" y="${n(vy - 9)}" width="20" height="18" rx="6" fill="${bone}"/>
        <path d="M ${n(vx - 3)} ${n(vy - 9)} L ${n(vx - 3)} ${n(vy - 26)} l 7 5 l -7 5 Z" fill="${boneS}"/>
        <rect x="${n(vx - 13)}" y="${n(vy + 6)}" width="26" height="7" rx="3" fill="${boneD}"/>
        <circle cx="${n(vx - 5)}" cy="${n(vy - 2)}" r="4.2" fill="#100e0b" opacity="0.5"/>
      </g>`;
    }
    // рёбра — парные дуги от позвоночника вниз
    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const vx = lerp(cx - 22, cx + 26, t);
      const vy = spineY - 2 - Math.sin(t * Math.PI) * 6;
      const rl = lerp(62, 40, t);
      for (const d of [-1, 1]) {
        const ox = vx + d * 9;
        s += `<path d="M ${n(ox)} ${n(vy + 6)} C ${n(ox + d * 26)} ${n(vy + 14)} ${n(ox + d * 24)} ${n(vy + rl * 0.6)} ${n(ox + d * 4)} ${n(vy + rl)}"
          fill="none" stroke="${bone}" stroke-width="${n(7 - i * 0.5)}" stroke-linecap="round"/>`;
        s += `<circle cx="${n(ox + d * 4)}" cy="${n(vy + rl)}" r="${n(3.4 - i * 0.2)}" fill="${boneD}"/>`;
      }
    }
    // задняя нога: бедро, голень, стопа с когтями
    const legHip = [cx + 40, spineY + 12];
    const legKnee = [cx + 62, spineY + 62];
    const legAnkle = [cx + 34, spineY + 108];
    const legFoot = [cx + 62, gY - 2];
    s += `<path d="M ${n(legHip[0])} ${n(legHip[1])} L ${n(legKnee[0])} ${n(legKnee[1])}" stroke="${bone}" stroke-width="16" stroke-linecap="round"/>`;
    s += `<circle cx="${n(legKnee[0])}" cy="${n(legKnee[1])}" r="11" fill="${bone}"/>`;
    s += `<path d="M ${n(legKnee[0])} ${n(legKnee[1])} L ${n(legAnkle[0])} ${n(legAnkle[1])}" stroke="${bone}" stroke-width="12" stroke-linecap="round"/>`;
    s += `<circle cx="${n(legAnkle[0])}" cy="${n(legAnkle[1])}" r="8" fill="${bone}"/>`;
    s += `<path d="M ${n(legAnkle[0])} ${n(legAnkle[1])} L ${n(legFoot[0])} ${n(legFoot[1])}" stroke="${bone}" stroke-width="11" stroke-linecap="round"/>`;
    for (let i = 0; i < 3; i++) {
      const tx = legFoot[0] - 10 + i * 13;
      s += `<path d="M ${n(tx)} ${n(legFoot[1] - 2)} q 6 8 3 18 q -6 -8 -9 -10 Z" fill="${boneS}"/>`;
    }
    s += `<path d="M ${n(legHip[0])} ${n(legHip[1])} L ${n(legKnee[0])} ${n(legKnee[1])}" stroke="#fff" stroke-width="5" opacity="0.2" stroke-linecap="round"/>`;
    // вторая нога — дальняя, темнее и сдвинута
    s += `<g opacity="0.75">
      <path d="M ${n(cx + 30)} ${n(spineY + 20)} L ${n(cx + 44)} ${n(spineY + 66)}" stroke="${boneD}" stroke-width="14" stroke-linecap="round"/>
      <path d="M ${n(cx + 44)} ${n(spineY + 66)} L ${n(cx + 22)} ${n(spineY + 110)}" stroke="${boneD}" stroke-width="11" stroke-linecap="round"/>
      <path d="M ${n(cx + 22)} ${n(spineY + 110)} L ${n(cx + 46)} ${n(gY - 4)}" stroke="${boneD}" stroke-width="10" stroke-linecap="round"/>
    </g>`;
    // шея и череп
    s += `<path d="M ${n(cx - 20)} ${n(spineY - 4)} C ${n(cx - 46)} ${n(spineY - 12)} ${n(cx - 66)} ${n(spineY - 30)} ${n(headX + 18)} ${n(spineY - 44)}"
      fill="none" stroke="${bone}" stroke-width="17" stroke-linecap="round"/>`;
    for (let i = 0; i < 5; i++) {
      const t = i / 5;
      const vx = lerp(cx - 18, headX + 16, t);
      const vy = spineY - 4 - t * 38 - Math.sin(t * Math.PI) * 4;
      s += `<g transform="rotate(${n(-34 - t * 12)} ${n(vx)} ${n(vy)})">
        <rect x="${n(vx - 7)}" y="${n(vy - 6)}" width="14" height="12" rx="4" fill="${bone}"/>
        <circle cx="${n(vx - 3)}" cy="${n(vy)}" r="2.6" fill="#100e0b" opacity="0.5"/>
      </g>`;
    }
    // череп: длинная морда, глазница, челюсть
    const hy = spineY - 44;
    s += `<path d="M ${n(headX + 22)} ${n(hy - 12)}
      C ${n(headX + 6)} ${n(hy - 16)} ${n(headX - 22)} ${n(hy - 14)} ${n(headX - 46)} ${n(hy - 6)}
      C ${n(headX - 62)} ${n(hy - 1)} ${n(headX - 64)} ${n(hy + 9)} ${n(headX - 48)} ${n(hy + 11)}
      L ${n(headX - 4)} ${n(hy + 14)}
      C ${n(headX + 14)} ${n(hy + 16)} ${n(headX + 26)} ${n(hy + 10)} ${n(headX + 28)} ${n(hy)} Z" fill="${bone}"/>`;
    s += `<path d="M ${n(headX - 44)} ${n(hy + 13)} C ${n(headX - 30)} ${n(hy + 22)} ${n(headX + 4)} ${n(hy + 24)} ${n(headX + 26)} ${n(hy + 14)}"
      fill="none" stroke="${bone}" stroke-width="10" stroke-linecap="round"/>`;
    s += `<ellipse cx="${n(headX + 12)}" cy="${n(hy + 1)}" rx="8" ry="7" fill="#100e0b" opacity="0.8"/>`;
    s += `<ellipse cx="${n(headX - 34)}" cy="${n(hy + 4)}" rx="4.4" ry="3" fill="#100e0b" opacity="0.6"/>`;
    for (let i = 0; i < 7; i++) {
      const tx = headX - 44 + i * 10;
      s += `<path d="M ${n(tx)} ${n(hy + 12)} l 5 0 l 2.5 7 Z" fill="${boneS}"/>`;
    }
    s += `<path d="M ${n(headX + 18)} ${n(hy - 11)} l ${n(12)} ${n(-16)} l 4 14 Z" fill="${bone}"/>`;
    // маленькие передние лапы
    s += `<path d="M ${n(cx - 4)} ${n(spineY + 4)} C ${n(cx + 10)} ${n(spineY + 20)} ${n(cx + 14)} ${n(spineY + 26)} ${n(cx + 8)} ${n(spineY + 34)}"
      fill="none" stroke="${bone}" stroke-width="7" stroke-linecap="round"/>`;
    for (let i = 0; i < 2; i++) {
      s += `<path d="M ${n(cx + 8)} ${n(spineY + 32)} q ${n(4 + i * 4)} 6 ${n(2 + i * 3)} 12 q ${n(-4)} -6 ${n(-7)} -7 Z" fill="${boneS}"/>`;
    }
    s += rim(cx, gY - 70, 270, 200, 0.2);
    s += dust(cx, gY - 110, 130, 90, rnd, 10);
    return s + speckle(cx - 140, gY - 130, 280, 140, rnd, '#0d0b08', 70, 0.18);
  },

  // 100 ── Императорская шкатулка
  imperialbox({ rnd, pal, cx, base }) {
    const w = 178;
    const h = 104;
    const y = base - h - 30;
    let s = `${DEFS}<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="13" fill="#000"
      opacity="0.5" filter="url(#soft)"/>`;
    // ножки
    for (const dx of [-1, 1]) {
      s += `<path d="M ${n(cx + dx * (w * 0.4) - 8)} ${n(base - 12)} h 16 l -3 12 h -10 z" fill="url(#gGold)"/>`;
    }
    // корпус
    s += `<rect x="${n(cx - w / 2)}" y="${n(y + h * 0.42)}" width="${n(w)}" height="${n(h * 0.58)}" rx="5" fill="url(#gVelvet)"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y + h * 0.42)}" width="${n(w)}" height="8" fill="#b3922e"/>`;
    s += `<rect x="${n(cx - w / 2 + 4)}" y="${n(y + h * 0.46)}" width="${n(w * 0.16)}" height="${n(h * 0.5)}"
      fill="#fff" opacity="0.1"/>`;
    // купол крышки
    s += `<path d="M ${n(cx - w / 2)} ${n(y + h * 0.46)} q 0 ${n(-h * 0.52)} ${n(w * 0.5)} ${n(-h * 0.52)}
      q ${n(w * 0.5)} 0 ${n(w * 0.5)} ${n(h * 0.52)} Z" fill="url(#gGold)"/>`;
    // перламутровые вставки
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const px = lerp(cx - w * 0.4, cx + w * 0.4, t);
      const py = y + h * 0.46 - Math.sin(t * Math.PI) * h * 0.4;
      const r = rnd.range(6, 11);
      const fill = rnd.pick(['url(#gGemE)', 'url(#gGemB)', 'url(#gGemR)']);
      s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(r)}" fill="${fill}" opacity="0.9"/>`;
      s += `<circle cx="${n(px - r * 0.3)}" cy="${n(py - r * 0.3)}" r="${n(r * 0.28)}" fill="#fff" opacity="0.6"/>`;
    }
    // филигрань
    for (let i = 0; i < 3; i++) {
      s += `<path d="${arcPath(cx, y + h * 0.46, w * (0.16 + i * 0.11), 200, 340)}" fill="none"
        stroke="#fff0bd" stroke-width="1.8" opacity="0.55"/>`;
    }
    // самоцветы на замочке
    const gems = ['url(#gGemR)', 'url(#gGemB)', 'url(#gGemE)'];
    for (let i = 0; i < 3; i++) {
      const gx = cx - 20 + i * 20;
      const gy = y + h * 0.72;
      s += `<circle cx="${n(gx)}" cy="${n(gy)}" r="9" fill="url(#gGold)"/>`;
      s += `<circle cx="${n(gx)}" cy="${n(gy)}" r="5.4" fill="${gems[i]}"/>`;
      s += `<circle cx="${n(gx - 1.6)}" cy="${n(gy - 1.8)}" r="1.5" fill="#fff" opacity="0.8"/>`;
    }
    // замок
    s += `<rect x="${n(cx - 9)}" y="${n(y + h * 0.86)}" width="18" height="14" rx="3" fill="url(#gGold)"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.92)}" r="2.6" fill="#2a1c08"/>`;
    s += rim(cx, base - 80, 210, 170, 0.32);
    s += dust(cx, base - 96, 110, 80, rnd, 14);
    s += sparkle(cx - w * 0.28, y + h * 0.2, 8, 0.65);
    s += sparkle(cx + w * 0.3, y + h * 0.34, 6, 0.5);
    return s + grime(cx, base - 70, w, 130, rnd, pal, 2);
  },
};
