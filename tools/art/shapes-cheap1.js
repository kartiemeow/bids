// Дешёвый лут, часть 1 (лоты 1–30). Каждая функция рисует предмет,
// стоящий на полу кладовки, и возвращает готовый SVG.

import { n, lerp, poly, polar, arcPath, shade, withAlpha, grime, crack, folds, speckle } from './lib.js';

// Локальные палитры материалов
const wood = (rnd, k = 0) => shade('#6b5133', rnd.range(-0.16, 0.14) + k);
const woodDark = (rnd) => shade('#3d2d1c', rnd.range(-0.12, 0.1));
const rust = (rnd) => shade('#8a4a24', rnd.range(-0.14, 0.16));
const plastic = (rnd, base) => shade(base, rnd.range(-0.12, 0.14));
const steel = (rnd, k = 0) => shade('#8b8b8c', rnd.range(-0.2, 0.16) + k);
const card = (rnd) => shade('#9a7c4e', rnd.range(-0.14, 0.12));

export const CHEAP1 = {
  // 1 ── Ваза с трещиной
  vase({ rnd, pal, cx, base }) {
    const h = rnd.range(160, 215);
    const t = base - h;
    const wb = rnd.range(34, 46);
    const wbody = rnd.range(74, 96);
    const wnk = rnd.range(22, 30);
    const c = shade('#a5623a', rnd.range(-0.08, 0.1));
    const path = `M ${n(cx - wb / 2)} ${n(base)}
      C ${n(cx - wbody / 2)} ${n(base - h * 0.34)} ${n(cx - wnk / 2)} ${n(t + h * 0.3)} ${n(cx - wnk / 2 - 2)} ${n(t)}
      L ${n(cx + wnk / 2 + 2)} ${n(t)}
      C ${n(cx + wnk / 2)} ${n(t + h * 0.3)} ${n(cx + wbody / 2)} ${n(base - h * 0.34)} ${n(cx + wb / 2)} ${n(base)}
      Z`;
    return `<path d="${path}" fill="${c}"/>
      <path d="M ${n(cx + wbody * 0.12)} ${n(t + 4)} C ${n(cx + wbody * 0.3)} ${n(base - h * 0.3)} ${n(cx + wbody * 0.26)} ${n(base - 8)} ${n(cx + wb * 0.42)} ${n(base)} L ${n(cx + wb / 2)} ${n(base)} Z"
        fill="#000" opacity="0.16"/>
      <ellipse cx="${n(cx)}" cy="${n(t)}" rx="${n(wnk / 2 + 3)}" ry="5" fill="${shade(c, -0.45)}"/>
      <ellipse cx="${n(cx)}" cy="${n(t + 1)}" rx="${n(wnk / 2 - 1)}" ry="3.2" fill="#0d0a07"/>
      <ellipse cx="${n(cx - wbody * 0.22)}" cy="${n(base - h * 0.4)}" rx="${n(wbody * 0.1)}" ry="${n(h * 0.2)}" fill="#fff" opacity="0.1"/>
      ${crack(cx + rnd.range(-8, 8), t + h * 0.42, h * 0.45, rnd, '#3a2113', 0.6)}
      ${grime(cx, base - h * 0.45, wbody, h, rnd, pal, 4)}`;
  },

  // 2 ── Стул с отбитой спинкой
  chair({ rnd, pal, cx, base }) {
    const sh = 118; // высота сиденья
    const bw = 74;
    const c = wood(rnd);
    const cd = woodDark(rnd);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 5)}" rx="62" ry="10" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    // задние ноги
    s += `<rect x="${n(cx - bw / 2 + 5)}" y="${n(base - sh)}" width="9" height="${n(sh)}" fill="${cd}"/>`;
    s += `<rect x="${n(cx + bw / 2 - 14)}" y="${n(base - sh)}" width="9" height="${n(sh)}" fill="${cd}"/>`;
    // спинка
    s += `<rect x="${n(cx - bw / 2 + 2)}" y="${n(base - sh - 92)}" width="9" height="98" fill="${cd}"/>`;
    s += `<rect x="${n(cx + bw / 2 - 11)}" y="${n(base - sh - 74)}" width="9" height="80" fill="${cd}"/>`;
    const broken = rnd.chance(0.6);
    s += `<rect x="${n(cx - bw / 2 + 2)}" y="${n(base - sh - 78)}" width="${n(bw - 4)}" height="16" rx="2" fill="${c}"/>`;
    if (broken) {
      s += `<path d="${poly([[cx - 8, base - sh - 62], [cx + 4, base - sh - 40], [cx - 2, base - sh - 36], [cx - 14, base - sh - 58]])}" fill="${c}"/>`;
    } else {
      s += `<rect x="${n(cx - bw / 2 + 2)}" y="${n(base - sh - 48)}" width="${n(bw - 4)}" height="14" rx="2" fill="${c}"/>`;
    }
    // сиденье
    s += `<rect x="${n(cx - bw / 2 - 6)}" y="${n(base - sh - 8)}" width="${n(bw + 12)}" height="14" rx="3" fill="${shade(c, 0.1)}"/>`;
    s += `<rect x="${n(cx - bw / 2 - 6)}" y="${n(base - sh - 8)}" width="${n(bw + 12)}" height="4" rx="2" fill="#fff" opacity="0.12"/>`;
    // передние ноги
    s += `<rect x="${n(cx - bw / 2 - 2)}" y="${n(base - sh + 2)}" width="10" height="${n(sh - 2)}" fill="${c}"/>`;
    s += `<rect x="${n(cx + bw / 2 - 8)}" y="${n(base - sh + 2)}" width="10" height="${n(sh - 2)}" fill="${c}"/>`;
    return s + grime(cx, base - sh * 0.8, bw, sh * 2, rnd, pal, 3);
  },

  // 3 ── Стопка покрышек
  tires({ rnd, pal, cx, base }) {
    const R = rnd.range(58, 76);
    const k = rnd.int(3, 4);
    const th = rnd.range(19, 25);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 4)}" rx="${n(R + 6)}" ry="${n(R * 0.2)}" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    for (let i = 0; i < k; i++) {
      const y = base - 8 - i * th;
      const c = shade('#26241f', rnd.range(-0.05, 0.07));
      s += `<rect x="${n(cx - R)}" y="${n(y - th)}" width="${n(R * 2)}" height="${n(th)}" fill="${c}"/>`;
      s += `<ellipse cx="${n(cx)}" cy="${n(y - th)}" rx="${n(R)}" ry="${n(R * 0.3)}" fill="${shade(c, 0.14)}"/>`;
      s += `<ellipse cx="${n(cx)}" cy="${n(y - th)}" rx="${n(R * 0.55)}" ry="${n(R * 0.17)}" fill="${shade(c, -0.5)}"/>`;
      // Протектор. Бортик покрышки — эллипс высотой 0.3R, поэтому спицы строим
      // на нём же: по окружности радиуса R они уходили бы ниже низа шины.
      const ry = R * 0.3;
      const tread = (r, a) => {
        const rad = (a * Math.PI) / 180;
        return [cx + Math.cos(rad) * R * r, (y - th) + Math.sin(rad) * ry * r];
      };
      for (let j = 0; j < 9; j++) {
        const a = j * 40 + rnd.range(-6, 6);
        const [x1, y1] = tread(1, a);
        const [x2, y2] = tread(0.62, a);
        s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="#0b0a08" stroke-width="5" opacity="0.55"/>`;
      }
      s += `<rect x="${n(cx - R)}" y="${n(y - th + 3)}" width="${n(R * 2)}" height="2" fill="#fff" opacity="0.06"/>`;
    }
    return s + speckle(cx - R, base - k * th - 30, R * 2, k * th + 20, rnd, '#7d7264', 30, 0.1);
  },

  // 4 ── Картонные коробки
  boxes({ rnd, pal, cx, base }) {
    const c1 = card(rnd);
    const c2 = shade(c1, -0.12);
    const c3 = shade(c1, 0.1);
    const w1 = rnd.range(140, 168);
    const h1 = rnd.range(64, 82);
    const w2 = w1 * rnd.range(0.7, 0.88);
    const h2 = rnd.range(58, 74);
    const w3 = w2 * rnd.range(0.68, 0.85);
    const h3 = rnd.range(48, 62);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w1 * 0.55)}" ry="14" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    // нижний
    s += `<rect x="${n(cx - w1 / 2)}" y="${n(base - h1)}" width="${n(w1)}" height="${n(h1)}" fill="${c1}"/>`;
    s += `<rect x="${n(cx - w1 / 2)}" y="${n(base - h1)}" width="${n(w1)}" height="6" fill="#000" opacity="0.2"/>`;
    s += `<rect x="${n(cx - w1 / 2)}" y="${n(base - h1 / 2 - 4)}" width="${n(w1)}" height="9" fill="#d8cdb6" opacity="0.55"/>`;
    s += `<rect x="${n(cx - w1 / 2 + 8)}" y="${n(base - h1 / 2 - 4)}" width="${n(w1 - 16)}" height="9" fill="#000" opacity="0.06"/>`;
    s += `<rect x="${n(cx - w1 / 2 + 22)}" y="${n(base - h1 + 14)}" width="${n(w1 * 0.3)}" height="${n(h1 * 0.34)}" fill="#efe6d2" opacity="0.5"/>`;
    // средний, сдвинут
    const o2 = rnd.range(-16, 16);
    s += `<rect x="${n(cx + o2 - w2 / 2)}" y="${n(base - h1 - h2)}" width="${n(w2)}" height="${n(h2 + 4)}" fill="${c2}"/>`;
    s += `<rect x="${n(cx + o2 - w2 / 2)}" y="${n(base - h1 - h2)}" width="${n(w2)}" height="6" fill="#000" opacity="0.24"/>`;
    s += `<rect x="${n(cx + o2 - w2 / 2)}" y="${n(base - h1 - h2 / 2)}" width="${n(w2)}" height="8" fill="#d8cdb6" opacity="0.45"/>`;
    // верхний, чуть повёрнут
    const o3 = rnd.range(-22, 22);
    s += `<g transform="rotate(${n(rnd.range(-5, 5))} ${n(cx)} ${n(base - h1 - h2)})">
      <rect x="${n(cx + o3 - w3 / 2)}" y="${n(base - h1 - h2 - h3)}" width="${n(w3)}" height="${n(h3)}" fill="${c3}"/>
      <rect x="${n(cx + o3 - w3 / 2)}" y="${n(base - h1 - h2 - h3)}" width="${n(w3)}" height="5" fill="#000" opacity="0.2"/>
      <rect x="${n(cx + o3 - w3 / 2)}" y="${n(base - h1 - h2 - h3 / 2)}" width="${n(w3)}" height="7" fill="#d8cdb6" opacity="0.4"/>
    </g>`;
    return s + grime(cx, base - h1, w1, h1 * 2, rnd, pal, 5);
  },

  // 5 ── Мешки с мусором
  trashbags({ rnd, pal, cx, base }) {
    const k = rnd.int(2, 3);
    const c = '#1c1a18';
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 4)}" rx="110" ry="16" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    for (let i = 0; i < k; i++) {
      const bw = rnd.range(88, 116);
      const bh = rnd.range(120, 168);
      const x = cx + (i - (k - 1) / 2) * rnd.range(72, 92);
      const y = base - bh * 0.5 - 4;
      const cc = shade(c, rnd.range(-0.04, 0.1));
      s += `<path d="M ${n(x - bw / 2)} ${n(base)}
        C ${n(x - bw / 2 - 4)} ${n(y + bh * 0.2)} ${n(x - bw * 0.3)} ${n(y - bh * 0.2)} ${n(x - bw * 0.12)} ${n(y - bh * 0.34)}
        L ${n(x + bw * 0.12)} ${n(y - bh * 0.34)}
        C ${n(x + bw * 0.3)} ${n(y - bh * 0.2)} ${n(x + bw / 2 + 4)} ${n(y + bh * 0.2)} ${n(x + bw / 2)} ${n(base)} Z"
        fill="${cc}"/>`;
      // завязка
      s += `<rect x="${n(x - bw * 0.14)}" y="${n(y - bh * 0.38)}" width="${n(bw * 0.28)}" height="11" rx="4" fill="#3b3630"/>`;
      s += `<path d="M ${n(x - 6)} ${n(y - bh * 0.4)} l -4 -12" stroke="#3b3630" stroke-width="4" fill="none"/>`;
      s += `<path d="M ${n(x + 6)} ${n(y - bh * 0.4)} l 5 -13" stroke="#3b3630" stroke-width="4" fill="none"/>`;
      // блик
      s += `<ellipse cx="${n(x - bw * 0.2)}" cy="${n(y + bh * 0.08)}" rx="${n(bw * 0.1)}" ry="${n(bh * 0.22)}" fill="#fff" opacity="0.07"/>`;
    }
    return s;
  },

  // 6 ── Пустая жестянка
  can({ rnd, pal, cx, base }) {
    const w = rnd.range(52, 68);
    const h = rnd.range(74, 98);
    const c = steel(rnd, 0.05);
    const label = rnd.pick(['#8a2f2a', '#2f5a7a', '#7a6a2a', '#4a6a3a']);
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.6)}" ry="9" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${c}"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + h * 0.26)}" width="${n(w)}" height="${n(h * 0.44)}" fill="${label}" opacity="0.85"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + h * 0.4)}" width="${n(w * 0.5)}" height="6" rx="3" fill="#efe6d2" opacity="0.6"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + h * 0.56)}" width="${n(w * 0.66)}" height="4" rx="2" fill="#efe6d2" opacity="0.4"/>
      <ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(w / 2)}" ry="${n(w * 0.13)}" fill="${shade(c, 0.2)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 1)}" rx="${n(w / 2 - 5)}" ry="${n(w * 0.09)}" fill="${shade(c, -0.35)}"/>
      <rect x="${n(cx - w * 0.3)}" y="${n(y - 7)}" width="${n(w * 0.24)}" height="8" rx="3" fill="${shade(c, 0.1)}"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w * 0.16)}" height="${n(h)}" fill="#fff" opacity="0.14"/>
      <path d="M ${n(cx + w * 0.2)} ${n(y + 4)} q 8 ${n(h * 0.3)} 2 ${n(h * 0.6)}" stroke="#5a3a20" stroke-width="3" fill="none" opacity="0.5"/>`;
  },

  // 7 ── Погнутая миска
  bowl({ rnd, pal, cx, base }) {
    const w = rnd.range(140, 172);
    const h = rnd.range(60, 76);
    const c = steel(rnd, 0.1);
    const y = base - h;
    const dent = rnd.range(-16, 16);
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.5)}" ry="10" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y)} C ${n(cx - w * 0.44)} ${n(base - 4)} ${n(cx + w * 0.44)} ${n(base - 4)} ${n(cx + w / 2)} ${n(y)} Z" fill="${c}"/>
      <path d="M ${n(cx - w * 0.2)} ${n(y + h * 0.18)} C ${n(cx - w * 0.16)} ${n(base - 10)} ${n(cx + w * 0.1)} ${n(base - 10)} ${n(cx + w * 0.16)} ${n(y + h * 0.16)}"
        fill="#fff" opacity="0.1"/>
      <ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(w / 2)}" ry="${n(h * 0.19)}" fill="${shade(c, 0.25)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 2)}" rx="${n(w / 2 - 6)}" ry="${n(h * 0.15)}" fill="${shade(c, -0.42)}"/>
      <ellipse cx="${n(cx + dent)}" cy="${n(y + h * 0.3)}" rx="${n(w * 0.1)}" ry="${n(h * 0.2)}" fill="#000" opacity="0.3"/>
      <path d="M ${n(cx - w * 0.36)} ${n(y + 6)} q ${n(w * 0.08)} ${n(h * 0.4)} ${n(-w * 0.02)} ${n(h * 0.62)}" stroke="${rust(rnd)}" stroke-width="3" fill="none" opacity="0.55"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + h * 0.62)}" width="${n(w)}" height="2" fill="#fff" opacity="0.12"/>`;
  },

  // 8 ── Сломанная лампа
  lampBroken({ rnd, pal, cx, base }) {
    const sh = rnd.range(96, 118);
    const tilt = rnd.range(-22, 22);
    const c = steel(rnd, 0);
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="46" ry="10" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 8)}" rx="42" ry="11" fill="${shade(c, -0.1)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 10)}" rx="42" ry="10" fill="${shade(c, 0.14)}"/>
      <rect x="${n(cx - 5)}" y="${n(base - sh - 4)}" width="10" height="${n(sh - 6)}" fill="${shade(c, -0.2)}"/>
      <g transform="rotate(${n(tilt)} ${n(cx)} ${n(base - sh - 4)})">
        <path d="${poly([[cx - 54, base - sh - 4], [cx - 30, base - sh - 54], [cx + 30, base - sh - 54], [cx + 54, base - sh - 4]])}"
          fill="${shade('#c9b394', rnd.range(-0.1, 0.08))}"/>
        <path d="${poly([[cx - 48, base - sh - 10], [cx - 28, base - sh - 50], [cx - 12, base - sh - 50], [cx - 32, base - sh - 10]])}" fill="#fff" opacity="0.16"/>
        <ellipse cx="${n(cx)}" cy="${n(base - sh - 4)}" rx="54" ry="8" fill="#000" opacity="0.25"/>
      </g>
      <path d="M ${n(cx - 20)} ${n(base - sh - 2)} q ${n(rnd.range(10, 26))} ${n(-30)} ${n(rnd.range(34, 60))} ${n(-16)}"
        stroke="#241d17" stroke-width="3" fill="none"/>`;
  },

  // 9 ── Старые ботинки
  boots({ rnd, pal, cx, base }) {
    const c = shade('#4a3526', rnd.range(-0.1, 0.1));
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="86" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    for (let i = 0; i < 2; i++) {
      const x = cx + (i === 0 ? -40 : 34);
      const h = rnd.range(72, 90);
      const back = i === 0 ? -1 : 1;
      s += `<g transform="translate(${n(x)} 0) scale(${back} 1)">
        <path d="M ${n(-18)} ${n(base)} L ${n(-20)} ${n(base - h)} L ${n(16)} ${n(base - h)} L ${n(20)} ${n(base - 12)}
          L ${n(58)} ${n(base - 10)} L ${n(62)} ${n(base)} Z" fill="${c}"/>
        <rect x="${n(-24)}" y="${n(base - 8)}" width="90" height="10" rx="3" fill="#1a1512"/>
        <rect x="${n(-22)}" y="${n(base - h - 6)}" width="40" height="9" rx="3" fill="${shade(c, 0.2)}"/>
        <path d="M ${n(-14)} ${n(base - h * 0.62)} l 34 0" stroke="${shade(c, 0.35)}" stroke-width="3"/>
        <path d="M ${n(-16)} ${n(base - h * 0.46)} l 36 0" stroke="${shade(c, 0.35)}" stroke-width="3"/>
        <rect x="${n(-24)}" y="${n(base - h * 0.3)}" width="44" height="4" fill="#000" opacity="0.3"/>
      </g>`;
    }
    return s + grime(cx, base - 40, 150, 80, rnd, pal, 4);
  },

  // 10 ── Стопка книг
  books({ rnd, pal, cx, base }) {
    const k = rnd.int(4, 6);
    const colors = ['#6a2b2b', '#2b4a6a', '#4a3a1e', '#2b5a3a', '#4a2b5a', '#5a4a2b'];
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="88" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    let y = base;
    for (let i = 0; i < k; i++) {
      const w = rnd.range(110, 148);
      const h = rnd.range(20, 30);
      const c = rnd.pick(colors);
      const off = rnd.range(-9, 9);
      s += `<rect x="${n(cx - w / 2 + off)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}" rx="2" fill="${c}"/>`;
      s += `<rect x="${n(cx - w / 2 + off + 4)}" y="${n(y - h + 4)}" width="${n(w - 8)}" height="${n(h - 8)}" fill="#d8cfb4" opacity="0.75"/>`;
      s += `<rect x="${n(cx - w / 2 + off)}" y="${n(y - h)}" width="${n(w)}" height="3" fill="#fff" opacity="0.12"/>`;
      s += `<rect x="${n(cx - w / 2 + off)}" y="${n(y - 4)}" width="${n(w)}" height="4" fill="#000" opacity="0.35"/>`;
      y -= h;
    }
    // корешок сверху
    s += `<g transform="rotate(${n(rnd.range(-14, 14))} ${n(cx)} ${n(y)})">
      <rect x="${n(cx - 20)}" y="${n(y - 96)}" width="30" height="98" rx="3" fill="${rnd.pick(colors)}"/>
      <rect x="${n(cx - 14)}" y="${n(y - 86)}" width="18" height="4" fill="#e8dfc4" opacity="0.7"/>
      <rect x="${n(cx - 14)}" y="${n(y - 74)}" width="18" height="4" fill="#e8dfc4" opacity="0.7"/>
    </g>`;
    return s;
  },

  // 11 ── Пустые бутылки
  bottle({ rnd, pal, cx, base }) {
    const c = ['#2f4a2a', '#4a3a1e', '#2a3a4a'][rnd.int(0, 2)];
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="94" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    const specs = [
      { dx: -46, h: 150, w: 40 },
      { dx: 16, h: 122, w: 34 },
      { dx: 64, h: 96, w: 28 },
    ];
    for (const sp of specs) {
      const x = cx + sp.dx;
      const t = base - sp.h;
      const cc = shade(c, rnd.range(-0.08, 0.12));
      const body = `M ${n(x - sp.w / 2)} ${n(base)}
        C ${n(x - sp.w / 2 - 2)} ${n(t + sp.h * 0.3)} ${n(x - sp.w * 0.16)} ${n(t + sp.h * 0.2)} ${n(x - sp.w * 0.14)} ${n(t + sp.h * 0.16)}
        L ${n(x + sp.w * 0.14)} ${n(t + sp.h * 0.16)}
        C ${n(x + sp.w * 0.16)} ${n(t + sp.h * 0.2)} ${n(x + sp.w / 2 + 2)} ${n(t + sp.h * 0.3)} ${n(x + sp.w / 2)} ${n(base)} Z`;
      s += `<path d="${body}" fill="${cc}"/>`;
      s += `<rect x="${n(x - sp.w * 0.14)}" y="${n(t + 2)}" width="${n(sp.w * 0.28)}" height="${n(sp.h * 0.16)}" fill="${shade(cc, 0.2)}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(t + sp.h * 0.16)}" rx="${n(sp.w * 0.14)}" ry="3" fill="${shade(cc, -0.4)}"/>`;
      s += `<rect x="${n(x - sp.w / 2 + 4)}" y="${n(t + sp.h * 0.35)}" width="${n(sp.w * 0.12)}" height="${n(sp.h * 0.5)}" fill="#fff" opacity="0.14"/>`;
      s += `<rect x="${n(x - sp.w / 2)}" y="${n(base - sp.h * 0.3)}" width="${n(sp.w)}" height="${n(sp.h * 0.3)}" fill="#e6ddc4" opacity="0.5"/>`;
    }
    return s;
  },

  // 12 ── Моток проволоки
  wire({ rnd, pal, cx, base }) {
    const R = rnd.range(62, 80);
    const c = rust(rnd);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 2)}" rx="${n(R)}" ry="${n(R * 0.22)}" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    for (let i = 0; i < 6; i++) {
      const rx = R - i * rnd.range(3, 6);
      const y = base - 6 - i * rnd.range(3, 5);
      s += `<ellipse cx="${n(cx + rnd.range(-5, 5))}" cy="${n(y)}" rx="${n(rx)}" ry="${n(rx * rnd.range(0.2, 0.27))}"
        fill="none" stroke="${shade(c, rnd.range(-0.14, 0.14))}" stroke-width="${n(rnd.range(4, 7))}"/>`;
      s += `<path d="M ${n(cx - rx + 4)} ${n(y - rx * 0.12)} a ${n(rx)} ${n(rx * 0.24)} 0 0 1 ${n(rx * 0.4)} ${n(-rx * 0.04)}"
        fill="none" stroke="#fff" stroke-width="1.6" opacity="0.16"/>`;
    }
    return s + speckle(cx - R, base - 50, R * 2, 56, rnd, '#c8a878', 40, 0.14);
  },

  // 13 ── Тазик с дырой
  bucket({ rnd, pal, cx, base }) {
    const w = rnd.range(112, 136);
    const h = rnd.range(112, 138);
    const c = plastic(rnd, '#3f5a6a');
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y)} L ${n(cx - w * 0.38)} ${n(base)} L ${n(cx + w * 0.38)} ${n(base)} L ${n(cx + w / 2)} ${n(y)} Z" fill="${c}"/>
      <path d="M ${n(cx - w / 2)} ${n(y)} L ${n(cx - w * 0.38)} ${n(base)} L ${n(cx - w * 0.2)} ${n(base)} L ${n(cx - w * 0.32)} ${n(y)} Z" fill="#fff" opacity="0.1"/>
      <ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(w / 2)}" ry="${n(w * 0.13)}" fill="${shade(c, 0.22)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 2)}" rx="${n(w / 2 - 7)}" ry="${n(w * 0.1)}" fill="#0c0a08"/>
      <path d="M ${n(cx - w / 2 + 4)} ${n(y + 4)} q ${n(-w * 0.4)} ${n(-h * 0.5)} ${n(-w * 0.06)} ${n(-h * 0.92)}"
        fill="none" stroke="${shade(c, -0.3)}" stroke-width="6"/>
      <path d="M ${n(cx + w / 2 - 4)} ${n(y + 4)} q ${n(w * 0.4)} ${n(-h * 0.5)} ${n(w * 0.06)} ${n(-h * 0.92)}"
        fill="none" stroke="${shade(c, -0.3)}" stroke-width="6"/>
      <path d="M ${n(cx - w * 0.36)} ${n(y + 4)} q ${n(w * 0.3)} ${n(-h * 0.5)} ${n(w * 0.36)} ${n(-h * 0.5)}"
        fill="none" stroke="${shade(c, -0.3)}" stroke-width="5"/>
      <ellipse cx="${n(cx + w * 0.14)}" cy="${n(base - h * 0.42)}" rx="9" ry="12" fill="#000" opacity="0.85"/>
      <ellipse cx="${n(cx + w * 0.14)}" cy="${n(base - h * 0.42)}" rx="14" ry="17" fill="#000" opacity="0.3"/>
      ${grime(cx, base - h * 0.5, w, h, rnd, pal, 4)}`;
  },

  // 14 ── Часы без стрелок
  clockBroken({ rnd, pal, cx, base }) {
    const R = rnd.range(64, 82);
    const y = base - R * 0.92;
    const c = wood(rnd, 0.05);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="58" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<path d="${poly([[cx - 26, base], [cx - 18, y + R * 0.7], [cx + 18, y + R * 0.7], [cx + 26, base]])}" fill="${shade(c, -0.2)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(base - 4)}" rx="40" ry="9" fill="${shade(c, -0.1)}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R)}" fill="${c}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R * 0.82)}" fill="#e8e0cc"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R * 0.82)}" fill="url(#backglow)" opacity="0.7"/>`;
    for (let i = 1; i < 12; i++) {
      const a = (360 / 12) * i;
      const [x1, y1] = polar(cx, y, R * 0.74, a);
      const [x2, y2] = polar(cx, y, R * (i % 3 === 0 ? 0.62 : 0.68), a);
      s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="#2a231a" stroke-width="${i % 3 === 0 ? 3.4 : 2}"/>`;
    }
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="5" fill="#2a231a"/>`;
    s += `<path d="M ${n(cx + R * 0.5)} ${n(y - R * 0.1)} l ${n(-R * 0.7)} ${n(R * 0.55)}" stroke="#a89a80" stroke-width="2" opacity="0.7"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R)}" fill="none" stroke="${shade(c, -0.35)}" stroke-width="5"/>`;
    return s;
  },

  // 15 ── Чугунная кастрюля
  pot({ rnd, pal, cx, base }) {
    const w = rnd.range(140, 164);
    const h = rnd.range(74, 90);
    const c = shade('#2b2926', rnd.range(-0.05, 0.08));
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="11" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y + 8)} C ${n(cx - w * 0.52)} ${n(base - 6)} ${n(cx + w * 0.52)} ${n(base - 6)} ${n(cx + w / 2)} ${n(y + 8)} Z" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(y + 8)}" width="${n(w * 0.16)}" height="${n(h * 0.6)}" fill="#fff" opacity="0.08"/>
      <ellipse cx="${n(cx - w * 0.2)}" cy="${n(base - h * 0.3)}" rx="${n(w * 0.12)}" ry="${n(h * 0.24)}" fill="#fff" opacity="0.06"/>
      <path d="M ${n(cx - w / 2)} ${n(y + 20)} q ${n(-w * 0.16)} ${n(2)} ${n(-w * 0.14)} ${n(16)}" stroke="${c}" stroke-width="9" fill="none"/>
      <path d="M ${n(cx + w / 2)} ${n(y + 20)} q ${n(w * 0.16)} ${n(2)} ${n(w * 0.14)} ${n(16)}" stroke="${c}" stroke-width="9" fill="none"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 8)}" rx="${n(w * 0.4)}" ry="${n(h * 0.24)}" fill="${shade(c, 0.2)}"/>
      <path d="M ${n(cx - w * 0.3)} ${n(y)} q ${n(w * 0.3)} ${n(-h * 0.3)} ${n(w * 0.6)} 0 Z" fill="${shade(c, 0.08)}"/>
      <circle cx="${n(cx)}" cy="${n(y - h * 0.12)}" r="7" fill="${shade(c, 0.3)}"/>
      <path d="M ${n(cx + w * 0.2)} ${n(y + 14)} q ${n(10)} ${n(h * 0.3)} ${n(3)} ${n(h * 0.6)}" stroke="${rust(rnd)}" stroke-width="4" fill="none" opacity="0.6"/>`;
  },

  // 16 ── Гирлянда без лампочек
  garland({ rnd, pal, cx, base }) {
    const sag = rnd.range(60, 96);
    const y0 = base - rnd.range(230, 268);
    const k = rnd.int(7, 10);
    const c = '#2b2723';
    let s = `<path d="M ${n(cx - 150)} ${n(y0)} Q ${n(cx)} ${n(y0 + sag * 2)} ${n(cx + 150)} ${n(y0)}"
      fill="none" stroke="${c}" stroke-width="4"/>`;
    for (let i = 0; i <= k; i++) {
      const t = i / k;
      const x = lerp(cx - 150, cx + 150, t);
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t * t * y0;
      const dy = rnd.range(8, 18);
      s += `<rect x="${n(x - 5)}" y="${n(y)}" width="10" height="${n(dy)}" rx="2" fill="#4a423a"/>`;
      s += `<path d="M ${n(x - 9)} ${n(y + dy + 4)} a 9 9 0 0 1 18 0 Z" fill="${shade('#c8bda8', rnd.range(-0.15, 0.1))}"/>`;
      s += `<rect x="${n(x - 9)}" y="${n(y + dy + 3)}" width="18" height="3" fill="#8a8275"/>`;
    }
    return s;
  },

  // 17 ── Ржавый велосипед
  bicycle({ rnd, pal, cx, base }) {
    const R = rnd.range(50, 62);
    const c = rust(rnd);
    const cd = shade(c, -0.2);
    const lean = rnd.range(-7, 7);
    const y1 = base - R;
    const y2 = base - R;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(R * 2.1)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<g transform="rotate(${n(lean)} ${n(cx)} ${n(base - R)})">`;
    for (const [wx, wy] of [[cx - 92, y1], [cx + 92, y2]]) {
      s += `<circle cx="${n(wx)}" cy="${n(wy)}" r="${n(R)}" fill="none" stroke="#1a1815" stroke-width="7"/>`;
      s += `<circle cx="${n(wx)}" cy="${n(wy)}" r="${n(R)}" fill="none" stroke="${cd}" stroke-width="2"/>`;
      for (let j = 0; j < 12; j++) {
        const [x2, y2] = polar(wx, wy, R - 5, j * 30);
        s += `<line x1="${n(wx)}" y1="${n(wy)}" x2="${n(x2)}" y2="${n(y2)}" stroke="#9a9184" stroke-width="1.4" opacity="0.7"/>`;
      }
      s += `<circle cx="${n(wx)}" cy="${n(wy)}" r="7" fill="${cd}"/>`;
    }
    // рама
    s += `<path d="M ${n(cx - 92)} ${n(y1)} L ${n(cx - 16)} ${n(y1 - 34)} L ${n(cx + 26)} ${n(y1 - 4)} L ${n(cx - 16)} ${n(y1 - 34)}
      M ${n(cx - 16)} ${n(y1 - 34)} L ${n(cx - 4)} ${n(y1 - 62)} L ${n(cx + 92)} ${n(y2)} M ${n(cx + 26)} ${n(y1 - 4)} L ${n(cx + 30)} ${n(y1 - 60)} L ${n(cx - 4)} ${n(y1 - 62)}"
      fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += `<rect x="${n(cx - 26)}" y="${n(y1 - 68)}" width="56" height="11" rx="5" fill="#231d18"/>`;
    s += `<path d="M ${n(cx + 24)} ${n(y1 - 62)} L ${n(cx + 44)} ${n(y1 - 78)}" stroke="${cd}" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx + 36)} ${n(y1 - 78)} L ${n(cx + 58)} ${n(y1 - 78)}" stroke="${cd}" stroke-width="6" stroke-linecap="round"/>`;
    s += `</g>`;
    return s + speckle(cx - 110, base - R * 2, 220, R * 2, rnd, '#7a3a1a', 46, 0.18);
  },

  // 18 ── Старое радио
  radio({ rnd, pal, cx, base }) {
    const w = rnd.range(130, 156);
    const h = rnd.range(84, 100);
    const c = wood(rnd, 0.08);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="7" fill="${c}"/>`;
    s += `<rect x="${n(cx - w / 2 + 3)}" y="${n(y + 3)}" width="${n(w - 6)}" height="${n(h - 6)}" rx="5" fill="#000" opacity="0.18"/>`;
    // решётка динамика
    s += `<rect x="${n(cx - w / 2 + 12)}" y="${n(y + 14)}" width="${n(w * 0.44)}" height="${n(h * 0.56)}" rx="3" fill="#1c1813"/>`;
    for (let i = 0; i < 11; i++) {
      s += `<line x1="${n(cx - w / 2 + 14)}" y1="${n(y + 18 + i * (h * 0.05))}" x2="${n(cx - w * 0.06 + 10)}" y2="${n(y + 18 + i * (h * 0.05))}"
        stroke="#6a5f50" stroke-width="2.4" opacity="0.7"/>`;
    }
    // шкала
    s += `<rect x="${n(cx + w * 0.1)}" y="${n(y + 14)}" width="${n(w * 0.32)}" height="${n(h * 0.2)}" rx="2" fill="#d9c99e" opacity="0.8"/>`;
    for (let i = 0; i < 7; i++) {
      s += `<line x1="${n(cx + w * 0.12 + i * (w * 0.045))}" y1="${n(y + 18)}" x2="${n(cx + w * 0.12 + i * (w * 0.045))}" y2="${n(y + 24)}" stroke="#3a3222" stroke-width="1.4"/>`;
    }
    // ручки
    s += `<circle cx="${n(cx + w * 0.18)}" cy="${n(y + h * 0.68)}" r="11" fill="${shade(c, -0.28)}"/>`;
    s += `<circle cx="${n(cx + w * 0.36)}" cy="${n(y + h * 0.68)}" r="11" fill="${shade(c, -0.28)}"/>`;
    s += `<circle cx="${n(cx + w * 0.18)}" cy="${n(y + h * 0.68)}" r="4" fill="#c9bda6" opacity="0.6"/>`;
    s += `<rect x="${n(cx - w * 0.2)}" y="${n(y - 16)}" width="3" height="18" fill="#8a8275"/>`;
    s += `<path d="M ${n(cx - w * 0.2)} ${n(y - 16)} q ${n(-16)} ${n(-18)} ${n(-34)} ${n(-12)}" stroke="#8a8275" stroke-width="2.4" fill="none"/>`;
    return s + grime(cx, y + h / 2, w, h, rnd, pal, 4);
  },

  // 19 ── Сломанный зонт
  umbrella({ rnd, pal, cx, base }) {
    const L = rnd.range(210, 250);
    const c = rnd.pick(['#2f4a6a', '#4a2b3a', '#2b4a3a']);
    const a = rnd.range(-72, -38);
    // Вращаем вокруг конца ручки, а не вокруг середины: опорная точка должна
    // стоять на полу, иначе при наклоне конец уезжает под сцену.
    const px = cx + L * 0.54;
    const py = base;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="96" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <g transform="rotate(${n(90 + a)} ${n(px)} ${n(py)})">
        <path d="M ${n(cx - L * 0.5)} ${n(base - 12)} L ${n(cx - L * 0.44)} ${n(base - 58)}
          L ${n(cx + L * 0.44)} ${n(base - 58)} L ${n(cx + L * 0.5)} ${n(base - 12)} Z" fill="${c}"/>
        <path d="M ${n(cx)} ${n(base - 58)} L ${n(cx)} ${n(base - 12)}" stroke="#000" stroke-width="3" opacity="0.4"/>
        <path d="M ${n(cx - L * 0.22)} ${n(base - 58)} L ${n(cx - L * 0.24)} ${n(base - 12)}" stroke="#000" stroke-width="3" opacity="0.4"/>
        <path d="M ${n(cx + L * 0.22)} ${n(base - 58)} L ${n(cx + L * 0.24)} ${n(base - 12)}" stroke="#000" stroke-width="3" opacity="0.4"/>
        <path d="M ${n(cx - L * 0.46)} ${n(base - 58)} L ${n(cx - L * 0.6)} ${n(base - 34)}" stroke="#6a6157" stroke-width="4"/>
        <path d="M ${n(cx - L * 0.6)} ${n(base - 34)} l -8 -10" stroke="#6a6157" stroke-width="4" stroke-linecap="round"/>
        <rect x="${n(cx + L * 0.44)}" y="${n(base - 12)}" width="${n(L * 0.1)}" height="12" rx="4" fill="#3a342e"/>
      </g>
      <ellipse cx="${n(px)}" cy="${n(py)}" rx="4" ry="4" fill="#3a342e"/>`;
  },

  // 20 ── Детская игрушка
  toy({ rnd, pal, cx, base }) {
    const c1 = rnd.pick(['#c23b3b', '#3b6ac2', '#3bc27a', '#c2a63b']);
    const h = rnd.range(120, 148);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="50" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - 34)}" y="${n(base - 30)}" width="26" height="30" rx="4" fill="${shade(c1, -0.28)}"/>`;
    s += `<rect x="${n(cx + 8)}" y="${n(base - 30)}" width="26" height="30" rx="4" fill="${shade(c1, -0.28)}"/>`;
    s += `<rect x="${n(cx - 38)}" y="${n(y + 34)}" width="76" height="${n(h - 64)}" rx="6" fill="${c1}"/>`;
    s += `<rect x="${n(cx - 30)}" y="${n(y + 42)}" width="24" height="${n(h * 0.3)}" rx="3" fill="#fff" opacity="0.14"/>`;
    s += `<rect x="${n(cx - 54)}" y="${n(y + 40)}" width="20" height="58" rx="6" fill="${shade(c1, -0.16)}"/>`;
    s += `<rect x="${n(cx + 34)}" y="${n(y + 40)}" width="20" height="58" rx="6" fill="${shade(c1, -0.16)}"/>`;
    s += `<circle cx="${n(cx - 44)}" cy="${n(y + 100)}" r="7" fill="#2a2620"/>`;
    s += `<rect x="${n(cx - 24)}" y="${n(y - 4)}" width="48" height="42" rx="8" fill="${shade(c1, 0.14)}"/>`;
    s += `<circle cx="${n(cx - 11)}" cy="${n(y + 15)}" r="5.5" fill="#12100d"/>`;
    s += `<circle cx="${n(cx + 11)}" cy="${n(y + 15)}" r="5.5" fill="#12100d"/>`;
    s += `<circle cx="${n(cx - 12)}" cy="${n(y + 14)}" r="1.8" fill="#fff" opacity="0.8"/>`;
    s += `<rect x="${n(cx - 16)}" y="${n(y + 26)}" width="32" height="6" rx="3" fill="#12100d"/>`;
    s += `<rect x="${n(cx - 3)}" y="${n(y - 12)}" width="6" height="10" fill="#8a8275"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y - 15)}" r="6" fill="#e0b23b"/>`;
    return s + grime(cx, y + h * 0.5, 80, h, rnd, pal, 3);
  },

  // 21 ── Газовая плита
  stove({ rnd, pal, cx, base }) {
    const w = rnd.range(150, 176);
    const h = rnd.range(112, 128);
    const c = steel(rnd, -0.12);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="5" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 4)}" width="${n(w * 0.2)}" height="${n(h - 8)}" fill="#fff" opacity="0.1"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(y + 6)}" width="${n(w - 12)}" height="16" rx="3" fill="${shade(c, -0.35)}"/>
      <ellipse cx="${n(cx - w * 0.22)}" cy="${n(y + 14)}" rx="10" ry="4" fill="#e8c96a" opacity="0.7"/>
      <ellipse cx="${n(cx + w * 0.24)}" cy="${n(y + 14)}" rx="10" ry="4" fill="#e8c96a" opacity="0.7"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(y + 30)}" width="${n(w - 12)}" height="${n(h * 0.5)}" rx="4" fill="${shade(c, -0.28)}"/>
      <rect x="${n(cx - w * 0.3)}" y="${n(y + 36)}" width="${n(w * 0.56)}" height="${n(h * 0.36)}" rx="3" fill="#0f0d0b" opacity="0.8"/>
      <rect x="${n(cx - w * 0.26)}" y="${n(y + 40)}" width="${n(w * 0.4)}" height="${n(h * 0.2)}" fill="#7a6a4a" opacity="0.35"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(base - 26)}" width="${n(w - 12)}" height="20" rx="3" fill="${shade(c, -0.4)}"/>`;
    for (let i = 0; i < 4; i++) {
      const kx = cx - w * 0.33 + i * (w * 0.22);
      const ky = base - 16;
      s += `<circle cx="${n(kx)}" cy="${n(ky)}" r="9" fill="${shade(c, -0.35)}"/>`;
      s += `<circle cx="${n(kx)}" cy="${n(ky)}" r="4.5" fill="#1a1713"/>`;
      s += `<circle cx="${n(kx - 2)}" cy="${n(ky - 2)}" r="2" fill="#fff" opacity="0.18"/>`;
    }
    return s + grime(cx, y + h * 0.6, w, h, rnd, pal, 5);
  },

  // 22 ── Старый матрас
  mattress({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 226);
    const h = rnd.range(112, 136);
    const c = shade('#b8ad94', rnd.range(-0.1, 0.08));
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="13" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(h * 0.3)}" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 5)}" y="${n(y + 5)}" width="${n(w * 0.22)}" height="${n(h - 10)}" rx="${n(h * 0.28)}" fill="#fff" opacity="0.14"/>
      <path d="M ${n(cx - w * 0.1)} ${n(y + 6)} q ${n(14)} ${n(h * 0.44)} ${n(2)} ${n(h * 0.88)}" stroke="${shade(c, -0.25)}" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M ${n(cx + w * 0.22)} ${n(y + 8)} q ${n(-12)} ${n(h * 0.4)} ${n(2)} ${n(h * 0.84)}" stroke="${shade(c, -0.25)}" stroke-width="3" fill="none" opacity="0.6"/>
      <rect x="${n(cx - w / 2 + w * 0.3)}" y="${n(y + h * 0.2)}" width="${n(w * 0.24)}" height="${n(h * 0.3)}" rx="4" fill="${rust(rnd)}" opacity="0.5"/>
      <path d="M ${n(cx - w / 2)} ${n(y + h * 0.7)} q ${n(w * 0.3)} ${n(h * 0.1)} ${n(w * 0.52)} ${n(-4)}" stroke="#6a5f4a" stroke-width="4" fill="none" opacity="0.5"/>
      ${grime(cx, y + h * 0.5, w, h, rnd, pal, 5)}`;
  },

  // 23 ── Смятая подушка
  pillow({ rnd, pal, cx, base }) {
    const w = rnd.range(160, 196);
    const h = rnd.range(96, 122);
    const c = shade('#c0b49a', rnd.range(-0.1, 0.1));
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.5)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y + h * 0.2)}
        C ${n(cx - w * 0.5)} ${n(y)} ${n(cx - w * 0.2)} ${n(y + 4)} ${n(cx)} ${n(y + 8)}
        C ${n(cx + w * 0.2)} ${n(y + 4)} ${n(cx + w * 0.5)} ${n(y)} ${n(cx + w / 2)} ${n(y + h * 0.2)}
        C ${n(cx + w * 0.52)} ${n(base - 6)} ${n(cx + w * 0.3)} ${n(base)} ${n(cx)} ${n(base)}
        C ${n(cx - w * 0.3)} ${n(base)} ${n(cx - w * 0.52)} ${n(base - 6)} ${n(cx - w / 2)} ${n(y + h * 0.2)} Z" fill="${c}"/>
      <path d="M ${n(cx - w * 0.3)} ${n(y + h * 0.2)} q ${n(30)} ${n(h * 0.2)} ${n(w * 0.6)} ${n(-4)}" stroke="${shade(c, -0.22)}" stroke-width="4" fill="none" opacity="0.7"/>
      <path d="M ${n(cx - w * 0.36)} ${n(y + h * 0.46)} q ${n(40)} ${n(h * 0.16)} ${n(w * 0.72)} ${n(-2)}" stroke="${shade(c, -0.22)}" stroke-width="3" fill="none" opacity="0.5"/>
      <ellipse cx="${n(cx - w * 0.22)}" cy="${n(y + h * 0.4)}" rx="${n(w * 0.16)}" ry="${n(h * 0.22)}" fill="#fff" opacity="0.13"/>
      <ellipse cx="${n(cx + w * 0.24)}" cy="${n(base - h * 0.24)}" rx="${n(w * 0.12)}" ry="${n(h * 0.1)}" fill="${rust(rnd)}" opacity="0.4"/>
      ${grime(cx, y + h * 0.5, w, h, rnd, pal, 4)}`;
  },

  // 24 ── Чугунная ванна
  bath({ rnd, pal, cx, base }) {
    const w = rnd.range(250, 292);
    const h = rnd.range(110, 132);
    const c = shade('#e6e0d2', rnd.range(-0.06, 0.05));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="14" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y)} C ${n(cx - w * 0.5)} ${n(base)} ${n(cx + w * 0.5)} ${n(base)} ${n(cx + w / 2)} ${n(y)} Z" fill="${c}"/>
      <path d="M ${n(cx - w / 2)} ${n(y)} C ${n(cx - w * 0.44)} ${n(y + h * 0.4)} ${n(cx - w * 0.36)} ${n(y + h * 0.5)} ${n(cx - w * 0.36)} ${n(y)} Z" fill="#fff" opacity="0.2"/>
      <ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(w / 2)}" ry="${n(h * 0.24)}" fill="${shade(c, -0.28)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 3)}" rx="${n(w / 2 - 9)}" ry="${n(h * 0.2)}" fill="#15120e"/>
      <rect x="${n(cx - w / 2 + 12)}" y="${n(y - 22)}" width="9" height="30" rx="4" fill="${shade(c, -0.1)}"/>`;
    s += `<path d="M ${n(cx - w * 0.2)} ${n(y - 2)} q 4 -14 16 -16" stroke="${shade(c, -0.15)}" stroke-width="9" fill="none"/>`;
    s += `<path d="M ${n(cx - w * 0.3)} ${n(y + h * 0.5)} l 0 ${n(h * 0.42)}" stroke="${shade(c, -0.1)}" stroke-width="11"/>`;
    s += `<path d="M ${n(cx + w * 0.3)} ${n(y + h * 0.5)} l 0 ${n(h * 0.42)}" stroke="${shade(c, -0.1)}" stroke-width="11"/>`;
    s += `<path d="M ${n(cx + w * 0.24)} ${n(y + h * 0.34)} q ${n(-w * 0.1)} ${n(h * 0.3)} ${n(-w * 0.02)} ${n(h * 0.6)}" stroke="#5a4632" stroke-width="7" fill="none" opacity="0.55"/>`;
    s += `<rect x="${n(cx - w * 0.34)}" y="${n(y + h * 0.2)}" width="${n(w * 0.2)}" height="${n(h * 0.3)}" fill="${rust(rnd)}" opacity="0.32"/>`;
    return s + grime(cx, y + h * 0.5, w, h, rnd, pal, 5);
  },

  // 25 ── Куча труб
  pipes({ rnd, pal, cx, base }) {
    const c = shade('#5a5a58', rnd.range(-0.1, 0.1));
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="112" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    const rows = [
      { dy: 0, n: 5, r: 17 },
      { dy: -30, n: 4, r: 16 },
      { dy: -58, n: 3, r: 15 },
      { dy: -84, n: 2, r: 14 },
    ];
    for (const row of rows) {
      for (let i = 0; i < row.n; i++) {
        const x = cx + (i - (row.n - 1) / 2) * (row.r * 2.15) + rnd.range(-3, 3);
        const y = base + row.dy;
        const cc = shade(c, rnd.range(-0.12, 0.12));
        s += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(row.r)}" fill="${shade(cc, -0.4)}"/>`;
        s += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(row.r * 0.78)}" fill="#100e0c"/>`;
        s += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(row.r)}" fill="none" stroke="${cc}" stroke-width="3"/>`;
        s += `<path d="M ${n(x - row.r * 0.7)} ${n(y - row.r * 0.6)} a ${n(row.r)} ${n(row.r)} 0 0 1 ${n(row.r * 0.8)} ${n(-row.r * 0.5)}"
          stroke="#fff" stroke-width="2" fill="none" opacity="0.18"/>`;
      }
    }
    return s + speckle(cx - 110, base - 110, 220, 120, rnd, '#7a3a1a', 44, 0.16);
  },

  // 26 ── Старый диван
  sofa({ rnd, pal, cx, base }) {
    const w = rnd.range(250, 300);
    const h = rnd.range(126, 152);
    const c = shade('#5a4a3a', rnd.range(-0.1, 0.1));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="14" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w * 0.46)}" y="${n(y + 20)}" width="${n(w * 0.92)}" height="${n(h * 0.52)}" rx="14" fill="${shade(c, -0.12)}"/>
      <rect x="${n(cx - w * 0.4)}" y="${n(y)}" width="${n(w * 0.8)}" height="${n(h * 0.56)}" rx="16" fill="${c}"/>
      <rect x="${n(cx - w * 0.36)}" y="${n(y + 6)}" width="${n(w * 0.32)}" height="${n(h * 0.42)}" rx="10" fill="${shade(c, 0.1)}"/>
      <rect x="${n(cx + w * 0.04)}" y="${n(y + 6)}" width="${n(w * 0.32)}" height="${n(h * 0.42)}" rx="10" fill="${shade(c, 0.1)}"/>
      <path d="M ${n(cx)} ${n(y + 8)} v ${n(h * 0.38)}" stroke="${shade(c, -0.28)}" stroke-width="3"/>`;
    s += `<rect x="${n(cx - w * 0.5)}" y="${n(y + h * 0.24)}" width="${n(w * 0.16)}" height="${n(h * 0.6)}" rx="12" fill="${shade(c, -0.06)}"/>`;
    s += `<rect x="${n(cx + w * 0.34)}" y="${n(y + h * 0.24)}" width="${n(w * 0.16)}" height="${n(h * 0.6)}" rx="12" fill="${shade(c, -0.06)}"/>`;
    s += `<rect x="${n(cx - w * 0.44)}" y="${n(base - 16)}" width="${n(w * 0.88)}" height="18" rx="6" fill="${shade(c, 0.16)}"/>`;
    s += `<rect x="${n(cx - w * 0.4)}" y="${n(base - 16)}" width="12" height="18" fill="#fff" opacity="0.1"/>`;
    s += `<rect x="${n(cx - w * 0.42)}" y="${n(base)}" width="16" height="12" rx="3" fill="#3a2c1e"/>`;
    s += `<rect x="${n(cx + w * 0.26)}" y="${n(base)}" width="16" height="12" rx="3" fill="#3a2c1e"/>`;
    s += `<ellipse cx="${n(cx + w * 0.18)}" cy="${n(y + h * 0.2)}" rx="${n(w * 0.1)}" ry="${n(h * 0.16)}" fill="${rust(rnd)}" opacity="0.4"/>`;
    return s + grime(cx, y + h * 0.5, w, h, rnd, pal, 5);
  },

  // 27 ── Пустой стеллаж
  shelf({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 220);
    const h = rnd.range(230, 268);
    const c = steel(rnd, -0.1);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${c}" stroke-width="11"/>`;
    for (let i = 1; i <= 3; i++) {
      const sy = y + (h / 4) * i;
      s += `<rect x="${n(cx - w / 2)}" y="${n(sy)}" width="${n(w)}" height="9" fill="${c}"/>`;
      s += `<rect x="${n(cx - w / 2)}" y="${n(sy)}" width="${n(w)}" height="2.5" fill="#fff" opacity="0.16"/>`;
      s += `<rect x="${n(cx - w / 2 + 4)}" y="${n(sy + 9)}" width="${n(w - 8)}" height="10" fill="#000" opacity="0.3"/>`;
    }
    s += `<rect x="${n(cx - w / 2 + 3)}" y="${n(y + 2)}" width="4" height="${n(h - 4)}" fill="#fff" opacity="0.1"/>`;
    return s + speckle(cx - w / 2, y, w, h, rnd, '#6a3a1a', 40, 0.18);
  },

  // 28 ── Битый чемодан
  suitcase({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 226);
    const h = rnd.range(122, 146);
    const c = shade('#4a3a2a', rnd.range(-0.1, 0.1));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="13" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="10" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 3)}" y="${n(y + 3)}" width="${n(w * 0.18)}" height="${n(h - 6)}" rx="8" fill="#fff" opacity="0.1"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + h * 0.5 - 5)}" width="${n(w)}" height="10" fill="#000" opacity="0.4"/>`;
    s += `<path d="M ${n(cx - w * 0.22)} ${n(y)} q ${n(w * 0.22)} ${n(-h * 0.24)} ${n(w * 0.44)} 0" fill="none" stroke="${shade(c, -0.25)}" stroke-width="9"/>`;
    for (const dx of [-0.3, 0.06]) {
      s += `<rect x="${n(cx + w * dx)}" y="${n(y - 4)}" width="20" height="18" rx="3" fill="${shade(c, 0.2)}"/>`;
    }
    s += `<rect x="${n(cx - 6)}" y="${n(y + h * 0.5 - 12)}" width="26" height="20" rx="3" fill="#a89a80"/>`;
    s += `<circle cx="${n(cx + 7)}" cy="${n(y + h * 0.5 - 2)}" r="3.4" fill="#2a231a"/>`;
    s += `<path d="M ${n(cx + w * 0.2)} ${n(y + h * 0.16)} l ${n(w * 0.16)} ${n(h * 0.24)}" stroke="#2a1c12" stroke-width="4" opacity="0.6"/>`;
    s += `<rect x="${n(cx - w * 0.44)}" y="${n(y + h * 0.14)}" width="${n(w * 0.22)}" height="${n(h * 0.2)}" rx="2" fill="#d8cdb2" opacity="0.4"/>`;
    return s + grime(cx, y + h * 0.5, w, h, rnd, pal, 5);
  },

  // 29 ── Тумбочка
  nightstand({ rnd, pal, cx, base }) {
    const w = rnd.range(124, 148);
    const h = rnd.range(122, 146);
    const c = wood(rnd, 0.05);
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + 12)}" width="${n(w)}" height="16" rx="3" fill="${shade(c, 0.14)}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 28)}" width="${n(w - 8)}" height="${n(h - 46)}" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 12)}" y="${n(y + 36)}" width="${n(w - 24)}" height="${n(h * 0.32)}" rx="3" fill="${shade(c, -0.14)}"/>
      <rect x="${n(cx - w / 2 + 12)}" y="${n(y + 36)}" width="${n(w - 24)}" height="${n(h * 0.32)}" rx="3" fill="none" stroke="#000" stroke-width="2" opacity="0.3"/>
      <rect x="${n(cx - 16)}" y="${n(y + 36 + h * 0.16 - 4)}" width="32" height="8" rx="4" fill="#a8905a"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(base - 18)}" width="${n(w - 8)}" height="18" rx="3" fill="${shade(c, -0.1)}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(base - 18)}" width="${n(w - 8)}" height="4" fill="#fff" opacity="0.1"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 12)}" width="${n(w * 0.16)}" height="${n(h - 30)}" fill="#fff" opacity="0.1"/>`;
  },

  // 30 ── Канистра
  jerrycan({ rnd, pal, cx, base }) {
    const w = rnd.range(96, 118);
    const h = rnd.range(140, 166);
    const c = shade('#3f5a3a', rnd.range(-0.1, 0.1));
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.58)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="5" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 5)}" y="${n(y + 5)}" width="${n(w * 0.22)}" height="${n(h - 10)}" fill="#fff" opacity="0.13"/>
      <rect x="${n(cx - 5)}" y="${n(y - 18)}" width="24" height="22" rx="3" fill="${shade(c, -0.15)}"/>
      <ellipse cx="${n(cx + 7)}" cy="${n(y - 16)}" rx="14" ry="5" fill="${shade(c, 0.2)}"/>
      <path d="M ${n(cx + 18)} ${n(y - 18)} q 12 -10 6 -20" stroke="${shade(c, -0.2)}" stroke-width="5" fill="none"/>
      <rect x="${n(cx - w / 2 + 8)}" y="${n(y + h * 0.3)}" width="${n(w - 16)}" height="3" fill="#000" opacity="0.3"/>
      <rect x="${n(cx - w / 2 + 8)}" y="${n(y + h * 0.62)}" width="${n(w - 16)}" height="3" fill="#000" opacity="0.3"/>
      <rect x="${n(cx - w * 0.3)}" y="${n(y + h * 0.4)}" width="${n(w * 0.6)}" height="${n(h * 0.18)}" fill="#d8cdb2" opacity="0.45"/>
      <path d="M ${n(cx + w * 0.22)} ${n(y + 10)} q 10 ${n(h * 0.4)} 3 ${n(h * 0.7)}" stroke="${rust(rnd)}" stroke-width="4" fill="none" opacity="0.55"/>`;
  },
};

function s_circle(x, y, c) {
  return `<circle cx="${n(x)}" cy="${n(y)}" r="8" fill="${shade(c, -0.45)}"/>`;
}
