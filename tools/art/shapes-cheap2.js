// Дешёвый лут, часть 2 (лоты 31–60).

import { n, lerp, poly, polar, arcPath, shade, withAlpha, grime, crack, shards, speckle, folds } from './lib.js';

const wood = (rnd, k = 0) => shade('#6b5133', rnd.range(-0.16, 0.14) + k);
const woodDark = (rnd) => shade('#3d2d1c', rnd.range(-0.12, 0.1));
const rust = (rnd) => shade('#8a4a24', rnd.range(-0.14, 0.16));
const steel = (rnd, k = 0) => shade('#8b8b8c', rnd.range(-0.2, 0.16) + k);

export const CHEAP2 = {
  // 31 ── Ключи на кольце
  keys({ rnd, pal, cx, base }) {
    const k = rnd.int(6, 9);
    const R = rnd.range(38, 50);
    const y = base - rnd.range(120, 156);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="42" ry="9" fill="#000" opacity="0.4" filter="url(#soft)"/>`;
    // кольцо
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R)}" fill="none" stroke="${steel(rnd, -0.1)}" stroke-width="7"/>`;
    s += `<path d="${arcPath(cx, y, R, 200, 340)}" fill="none" stroke="#fff" stroke-width="2" opacity="0.25"/>`;
    for (let i = 0; i < k; i++) {
      const a = (360 / k) * i + rnd.range(-14, 14);
      const [kx, ky] = polar(cx, y, R + 12, a);
      const L = rnd.range(54, 86);
      const w = rnd.range(8, 13);
      const c = steel(rnd, rnd.range(-0.1, 0.1));
      s += `<g transform="rotate(${n(a + 90)} ${n(kx)} ${n(ky)})">
        <circle cx="${n(kx)}" cy="${n(ky)}" r="${n(w * 0.9)}" fill="none" stroke="${c}" stroke-width="4"/>
        <rect x="${n(kx - w * 0.3)}" y="${n(ky)}" width="${n(w * 0.6)}" height="${n(L)}" rx="2" fill="${c}"/>
        <rect x="${n(kx - w * 0.3)}" y="${n(ky + L * 0.62)}" width="${n(w * 1.1)}" height="6" fill="${c}"/>
        <rect x="${n(kx - w * 0.3)}" y="${n(ky + L * 0.82)}" width="${n(w * 0.9)}" height="6" fill="${c}"/>
      </g>`;
    }
    return s;
  },

  // 32 ── Папка с бумагами
  folder({ rnd, pal, cx, base }) {
    const w = rnd.range(180, 214);
    const h = rnd.range(34, 46);
    const k = rnd.int(3, 5);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    let y = base;
    for (let i = 0; i < k; i++) {
      const hh = h * rnd.range(0.8, 1.15);
      const ww = w * rnd.range(0.88, 1);
      const c = shade('#c8a24a', rnd.range(-0.12, 0.1));
      const off = rnd.range(-10, 10);
      const rot = rnd.range(-4, 4);
      s += `<g transform="rotate(${n(rot)} ${n(cx)} ${n(y)})">
        <rect x="${n(cx - ww / 2 + off)}" y="${n(y - hh)}" width="${n(ww)}" height="${n(hh)}" rx="3" fill="${c}"/>
        <rect x="${n(cx - ww / 2 + off)}" y="${n(y - hh)}" width="${n(ww * 0.3)}" height="${n(hh)}" rx="3" fill="${shade(c, 0.14)}"/>
        <rect x="${n(cx - ww / 2 + off + 14)}" y="${n(y - hh * 0.62)}" width="${n(ww * 0.6)}" height="4" fill="#000" opacity="0.28"/>
        <rect x="${n(cx - ww / 2 + off)}" y="${n(y - 4)}" width="${n(ww)}" height="4" fill="#000" opacity="0.35"/>
      </g>`;
      y -= hh;
    }
    s += `<path d="M ${n(cx + 20)} ${n(y)} l ${n(rnd.range(40, 76))} ${n(-rnd.range(30, 60))}" stroke="#e8e0cc" stroke-width="7" opacity="0.85"/>`;
    return s;
  },

  // 33 ── Статуэтка без руки
  statuetteBroken({ rnd, pal, cx, base }) {
    const h = rnd.range(190, 236);
    const c = shade('#cfc6b4', rnd.range(-0.06, 0.05));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="42" ry="10" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    // постамент
    s += `<rect x="${n(cx - 34)}" y="${n(base - 24)}" width="68" height="24" rx="3" fill="${shade(c, -0.14)}"/>`;
    s += `<rect x="${n(cx - 28)}" y="${n(base - 44)}" width="56" height="20" rx="3" fill="${shade(c, -0.04)}"/>`;
    // тело: торс с обрыва руки
    s += `<path d="M ${n(cx - 20)} ${n(base - 44)} C ${n(cx - 30)} ${n(y + h * 0.3)} ${n(cx - 16)} ${n(y + h * 0.1)} ${n(cx - 14)} ${n(y + h * 0.12)}
      L ${n(cx + 14)} ${n(y + h * 0.12)} C ${n(cx + 16)} ${n(y + h * 0.1)} ${n(cx + 30)} ${n(y + h * 0.3)} ${n(cx + 20)} ${n(base - 44)} Z" fill="${c}"/>`;
    // левая рука
    s += `<path d="M ${n(cx - 16)} ${n(y + h * 0.2)} q ${n(-22)} ${n(h * 0.1)} ${n(-20)} ${n(h * 0.26)}" stroke="${c}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
    // облом вместо правой руки
    s += `<path d="M ${n(cx + 14)} ${n(y + h * 0.2)} l ${n(14)} ${n(h * 0.08)} l ${n(-6)} ${n(12)} Z" fill="${shade(c, -0.2)}"/>`;
    s += `<ellipse cx="${n(cx + 16)}" cy="${n(y + h * 0.21)}" rx="7" ry="5" fill="#a89b86"/>`;
    // голова
    s += `<rect x="${n(cx - 4)}" y="${n(y + h * 0.06)}" width="8" height="10" fill="${c}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y)}" rx="17" ry="20" fill="${c}"/>`;
    s += `<ellipse cx="${n(cx - 6)}" cy="${n(y - 2)}" rx="6" ry="8" fill="#fff" opacity="0.16"/>`;
    s += `<path d="M ${n(cx - 9)} ${n(y + 3)} q ${n(9)} ${n(h * 0.12)} ${n(18)} 0" stroke="#a89b86" stroke-width="2.4" fill="none"/>
      <circle cx="${n(cx - 6)}" cy="${n(y - 2)}" r="2" fill="#7a6f5e"/>
      <circle cx="${n(cx + 6)}" cy="${n(y - 2)}" r="2" fill="#7a6f5e"/>`;
    s += `<path d="M ${n(cx - 12)} ${n(base - 30)} q ${n(12)} ${n(h * 0.1)} ${n(24)} 0" stroke="${shade(c, -0.16)}" stroke-width="2.4" fill="none"/>`;
    return s + grime(cx, base - h * 0.5, 60, h, rnd, pal, 3);
  },

  // 34 ── Рама без картины
  frameEmpty({ rnd, pal, cx, base }) {
    const w = rnd.range(168, 200);
    const h = rnd.range(206, 246);
    const c = rnd.pick(['#6b4a2a', '#3a4a5a', '#5a5a3a', '#4a2a3a']);
    const y = base - h;
    const th = rnd.range(15, 22);
    const lean = rnd.range(-9, 9);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="52" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<g transform="rotate(${n(lean)} ${n(cx + w * 0.4)} ${n(base)})">`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="#100d0a"/>`;
    s += `<rect x="${n(cx - w / 2 + th)}" y="${n(y + th)}" width="${n(w - th * 2)}" height="${n(h - th * 2)}" fill="#241c14"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(th)}" fill="${shade(c, 0.1)}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(base - th)}" width="${n(w)}" height="${n(th)}" fill="${shade(c, -0.08)}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(th)}" height="${n(h)}" fill="${c}"/>`;
    s += `<rect x="${n(cx + w / 2 - th)}" y="${n(y)}" width="${n(th)}" height="${n(h)}" fill="${shade(c, -0.12)}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w * 0.2)}" height="${n(th)}" fill="#fff" opacity="0.12"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(th)}" height="${n(h * 0.4)}" fill="#fff" opacity="0.12"/>`;
    // остатки холста
    s += `<path d="M ${n(cx - w * 0.2)} ${n(y + th)} l ${n(w * 0.3)} ${n(h * 0.1)} l ${n(-w * 0.1)} ${n(h * 0.2)} l ${n(-w * 0.2)} ${n(-h * 0.1)} Z" fill="#6a5f4a" opacity="0.5"/>`;
    s += `<path d="M ${n(cx - w / 2 + th)} ${n(base - th * 3)} l ${n(w * 0.3)} ${n(-6)}" stroke="#4a3f2e" stroke-width="3" opacity="0.6"/>`;
    s += `</g>`;
    return s + grime(cx, base - h * 0.5, w, h, rnd, pal, 3);
  },

  // 35 ── Чугунная сковорода
  pan({ rnd, pal, cx, base }) {
    const R = rnd.range(72, 90);
    const c = shade('#22201d', rnd.range(-0.04, 0.06));
    const y = base - R * 0.42;
    const hx = cx + R * 0.92;
    return `<ellipse cx="${n(cx + 20)}" cy="${n(base + 3)}" rx="${n(R * 0.7)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(hx)} ${n(y - 10)} L ${n(hx + 78)} ${n(y - 40)}" stroke="${c}" stroke-width="15" stroke-linecap="round"/>
      <path d="M ${n(hx + 66)} ${n(y - 36)} l 12 22" stroke="${c}" stroke-width="13" stroke-linecap="round"/>
      <ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(R)}" ry="${n(R * 0.36)}" fill="${shade(c, 0.16)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 2)}" rx="${n(R * 0.9)}" ry="${n(R * 0.32)}" fill="${shade(c, -0.3)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 2)}" rx="${n(R * 0.9)}" ry="${n(R * 0.32)}" fill="url(#backglow)" opacity="0.35"/>
      <ellipse cx="${n(cx - R * 0.2)}" cy="${n(y - 2)}" rx="${n(R * 0.3)}" ry="${n(R * 0.1)}" fill="#fff" opacity="0.1"/>
      <path d="M ${n(cx + R * 0.3)} ${n(y + 6)} q ${n(14)} ${n(10)} ${n(4)} ${n(20)}" stroke="${rust(rnd)}" stroke-width="5" fill="none" opacity="0.6"/>`;
  },

  // 36 ── Гиря
  castiron({ rnd, pal, cx, base }) {
    const R = rnd.range(58, 72);
    const c = shade('#26241f', rnd.range(-0.04, 0.06));
    const y = base - R * 0.9;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(R * 1.3)}" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - R * 0.9)} ${n(y + R * 0.5)} L ${n(cx - R * 0.62)} ${n(y - R * 0.5)}
        q ${n(R * 0.62)} ${n(-R * 0.44)} ${n(R * 1.24)} 0 L ${n(cx + R * 0.9)} ${n(y + R * 0.5)} Z" fill="${c}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + R * 0.5)}" rx="${n(R * 0.9)}" ry="${n(R * 0.22)}" fill="${shade(c, -0.3)}"/>
      <path d="M ${n(cx - R * 0.62)} ${n(y - R * 0.5)} q ${n(R * 0.2)} ${n(-R * 0.34)} ${n(R * 0.5)} ${n(-R * 0.36)}"
        stroke="${shade(c, 0.18)}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M ${n(cx + R * 0.12)} ${n(y - R * 0.86)} q ${n(R * 0.3)} ${n(R * 0.1)} ${n(R * 0.5)} ${n(R * 0.44)}"
        stroke="${shade(c, 0.18)}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M ${n(cx - R * 0.5)} ${n(y - R * 0.2)} q ${n(R * 0.5)} ${n(-R * 0.2)} ${n(R)} 0" stroke="#fff" stroke-width="4" fill="none" opacity="0.1"/>`;
  },

  // 37 ── Стопка журналов
  magazines({ rnd, pal, cx, base }) {
    const k = rnd.int(5, 8);
    const cols = ['#c23b5a', '#3b6ac2', '#c2a63b', '#3bc26a', '#a63bc2', '#c27a3b'];
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="76" ry="11" fill="#000" opacity="0.4" filter="url(#soft)"/>`;
    let y = base;
    for (let i = 0; i < k; i++) {
      const w = rnd.range(112, 142);
      const h = rnd.range(9, 15);
      const c = rnd.pick(cols);
      const off = rnd.range(-8, 8);
      const rot = rnd.range(-6, 6);
      s += `<g transform="rotate(${n(rot)} ${n(cx)} ${n(y)})">
        <rect x="${n(cx - w / 2 + off)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}" fill="#e8e0cc"/>
        <rect x="${n(cx - w / 2 + off)}" y="${n(y - h)}" width="${n(w * 0.36)}" height="${n(h)}" fill="${c}"/>
        <rect x="${n(cx - w / 2 + off + 8)}" y="${n(y - h * 0.72)}" width="${n(w * 0.44)}" height="2.4" fill="#fff" opacity="0.75"/>
        <rect x="${n(cx - w / 2 + off + 8)}" y="${n(y - h * 0.4)}" width="${n(w * 0.3)}" height="2.4" fill="#fff" opacity="0.5"/>
        <rect x="${n(cx - w / 2 + off)}" y="${n(y - 3)}" width="${n(w)}" height="3" fill="#000" opacity="0.3"/>
      </g>`;
      y -= h;
    }
    s += `<g transform="rotate(${n(rnd.range(-24, 24))} ${n(cx + 50)} ${n(y + 6)})">
      <rect x="${n(cx + 26)}" y="${n(y - 44)}" width="72" height="52" fill="#e8e0cc"/>
      <rect x="${n(cx + 26)}" y="${n(y - 44)}" width="72" height="14" fill="${rnd.pick(cols)}"/>
      <rect x="${n(cx + 32)}" y="${n(y - 24)}" width="30" height="26" fill="#6a6152" opacity="0.5"/>
    </g>`;
    return s;
  },

  // 38 ── Треснувшее зеркало
  mirror({ rnd, pal, cx, base }) {
    const w = rnd.range(120, 146);
    const h = rnd.range(210, 250);
    const y = base - h;
    const lean = rnd.range(-11, 11);
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="54" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(lean)} ${n(cx + w * 0.4)} ${n(base)})">
        <ellipse cx="${n(cx)}" cy="${n(y + h / 2)}" rx="${n(w / 2 + 9)}" ry="${n(h / 2 + 9)}" fill="${shade('#6b5133', rnd.range(-0.1, 0.1))}"/>
        <ellipse cx="${n(cx)}" cy="${n(y + h / 2)}" rx="${n(w / 2)}" ry="${n(h / 2)}" fill="#2a3038"/>
        <ellipse cx="${n(cx)}" cy="${n(y + h / 2)}" rx="${n(w / 2)}" ry="${n(h / 2)}" fill="url(#backglow)" opacity="0.5"/>
        <path d="M ${n(cx - w * 0.34)} ${n(y + h * 0.82)} q ${n(w * 0.3)} ${n(-h * 0.5)} ${n(w * 0.66)} ${n(-h * 0.62)}"
          stroke="#e4ecf2" stroke-width="10" fill="none" opacity="0.14"/>
        ${shards(cx + rnd.range(-14, 14), y + h * rnd.range(0.35, 0.6), rnd.range(20, 38), rnd, '#e8f0f6', 0.45)}
        <ellipse cx="${n(cx)}" cy="${n(y + h / 2)}" rx="${n(w / 2)}" ry="${n(h / 2)}" fill="none" stroke="#3a2c1c" stroke-width="4"/>
      </g>
      ${grime(cx, base - h * 0.5, w, h, rnd, pal, 3)}`;
  },

  // 39 ── Маслёнка
  oilcan({ rnd, pal, cx, base }) {
    const w = rnd.range(78, 96);
    const h = rnd.range(74, 90);
    const c = steel(rnd, -0.08);
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.6)}" ry="10" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y + 10)} L ${n(cx - w * 0.3)} ${n(base)} L ${n(cx + w * 0.3)} ${n(base)} L ${n(cx + w / 2)} ${n(y + 10)} Z" fill="${c}"/>
      <path d="M ${n(cx - w * 0.5)} ${n(y + 10)} L ${n(cx - w * 0.32)} ${n(base)} L ${n(cx - w * 0.16)} ${n(base)} L ${n(cx - w * 0.32)} ${n(y + 10)} Z" fill="#fff" opacity="0.14"/>
      <path d="M ${n(cx - w * 0.4)} ${n(y + 8)} q ${n(w * 0.1)} ${n(-h * 0.5)} ${n(w * 0.5)} ${n(-h * 0.62)}"
        stroke="${shade(c, -0.15)}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M ${n(cx + w * 0.1)} ${n(y - h * 0.5)} l ${n(w * 0.36)} ${n(-h * 0.1)}" stroke="${shade(c, -0.1)}" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="${n(cx + w * 0.48)}" cy="${n(y - h * 0.62)}" rx="5" ry="7" fill="${shade(c, -0.35)}"/>
      <path d="M ${n(cx - w * 0.3)} ${n(y + 10)} q ${n(w * 0.12)} ${n(-h * 0.4)} ${n(w * 0.42)} ${n(-h * 0.5)}"
        stroke="${shade(c, -0.15)}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="${n(cx - 12)}" y="${n(y - h * 0.1)}" width="24" height="10" rx="4" fill="${shade(c, 0.2)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y + 10)}" rx="${n(w * 0.5)}" ry="${n(h * 0.14)}" fill="${shade(c, 0.2)}"/>`;
  },

  // 40 ── Электрообогреватель
  heater({ rnd, pal, cx, base }) {
    const w = rnd.range(140, 168);
    const h = rnd.range(150, 176);
    const c = steel(rnd, 0.06);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.6)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="10" fill="${c}"/>`;
    s += `<rect x="${n(cx - w / 2 + 4)}" y="${n(y + 4)}" width="${n(w * 0.2)}" height="${n(h - 8)}" rx="7" fill="#fff" opacity="0.12"/>`;
    for (let i = 0; i < 8; i++) {
      s += `<rect x="${n(cx - w / 2 + 10)}" y="${n(y + 16 + i * (h * 0.09))}" width="${n(w - 20)}" height="4" rx="2" fill="#000" opacity="0.35"/>`;
    }
    s += `<rect x="${n(cx - w / 2 + 10)}" y="${n(y + 10)}" width="${n(w - 20)}" height="${n(h * 0.72)}" rx="6" fill="#2a2622"/>`;
    for (let i = 0; i < 5; i++) {
      s += `<line x1="${n(cx - w / 2 + 16)}" y1="${n(y + 18 + i * (h * 0.13))}" x2="${n(cx + w / 2 - 16)}" y2="${n(y + 18 + i * (h * 0.13))}"
        stroke="${shade(c, 0.3)}" stroke-width="4"/>`;
    }
    s += `<rect x="${n(cx - w / 2 + 10)}" y="${n(y + h * 0.76)}" width="${n(w - 20)}" height="${n(h * 0.16)}" rx="4" fill="${shade(c, -0.35)}"/>`;
    s += `<circle cx="${n(cx - w * 0.3)}" cy="${n(y + h * 0.84)}" r="7" fill="#c2b49a"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.84)}" r="7" fill="#3a342e"/>`;
    s += `<path d="M ${n(cx - 14)} ${n(y + h * 0.84)} l 8 0" stroke="#c2b49a" stroke-width="2.4"/>`;
    return s + grime(cx, y + h * 0.5, w, h, rnd, pal, 3);
  },

  // 41 ── Старый пылесос
  vacuum({ rnd, pal, cx, base }) {
    const R = rnd.range(64, 78);
    const c = rnd.pick(['#8a3b3b', '#3b5a8a', '#5a5a3b']);
    const y = base - R * 0.5;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(R * 1.2)}" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(R)}" ry="${n(R * 0.62)}" fill="${c}"/>
      <ellipse cx="${n(cx)}" cy="${n(y - R * 0.3)}" rx="${n(R * 0.6)}" ry="${n(R * 0.24)}" fill="${shade(c, 0.22)}"/>
      <ellipse cx="${n(cx)}" cy="${n(y - R * 0.36)}" rx="${n(R * 0.28)}" ry="${n(R * 0.1)}" fill="#2a2622"/>
      <ellipse cx="${n(cx - R * 0.3)}" cy="${n(y - R * 0.24)}" rx="${n(R * 0.22)}" ry="${n(R * 0.08)}" fill="#fff" opacity="0.24"/>
      <path d="M ${n(cx + R * 0.7)} ${n(y - R * 0.1)} q ${n(52)} ${n(-16)} ${n(76)} ${n(-56)}" stroke="${shade(c, -0.2)}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <rect x="${n(cx + R * 1.6)}" y="${n(y - R * 1.5)}" width="16" height="70" rx="7" transform="rotate(22 ${n(cx + R * 1.6)} ${n(y - R * 1.5)})" fill="${shade(c, -0.3)}"/>
      <circle cx="${n(cx - R * 0.2)}" cy="${n(y + R * 0.28)}" r="${n(R * 0.34)}" fill="#1c1815" opacity="0.7"/>
      <path d="M ${n(cx - R * 0.5)} ${n(y + R * 0.2)} a ${n(R * 0.5)} ${n(R * 0.5)} 0 0 1 ${n(R * 0.6)} ${n(-R * 0.1)}"
        stroke="#fff" stroke-width="3" fill="none" opacity="0.14"/>`;
  },

  // 42 ── Табурет
  stool({ rnd, pal, cx, base }) {
    const w = rnd.range(84, 100);
    const h = rnd.range(112, 132);
    const c = wood(rnd, 0.06);
    const sh = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="52" ry="10" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(sh)}" rx="${n(w / 2)}" ry="11" fill="${shade(c, 0.14)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(sh + 2)}" rx="${n(w / 2 - 6)}" ry="8" fill="${shade(c, 0.02)}"/>`;
    for (const dx of [-1, 1]) {
      s += `<path d="M ${n(cx + dx * (w / 2 - 12))} ${n(sh + 6)} L ${n(cx + dx * (w / 2 - 2))} ${n(base)}"
        stroke="${shade(c, -0.18)}" stroke-width="10" stroke-linecap="round"/>`;
    }
    s += `<path d="M ${n(cx - w / 2 + 8)} ${n(sh + h * 0.42)} l ${n(w - 16)} 0" stroke="${shade(c, -0.2)}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx - w * 0.3)} ${n(sh + 6)} L ${n(cx - w * 0.16)} ${n(base)}" stroke="${shade(c, -0.24)}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<ellipse cx="${n(cx - w * 0.2)}" cy="${n(sh - 2)}" rx="${n(w * 0.16)}" ry="4" fill="#fff" opacity="0.16"/>`;
    return s + grime(cx, base - h * 0.4, w, h, rnd, pal, 3);
  },

  // 43 ── Стремянка
  ladder({ rnd, pal, cx, base }) {
    const w = rnd.range(152, 178);
    const h = rnd.range(244, 280);
    const c = steel(rnd, -0.02);
    const y = base - h;
    const topW = w * 0.21;
    const spread = w * 0.5;
    const legX = (t) => lerp(spread, topW, t);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.74)}" ry="14" fill="#000" opacity="0.55" filter="url(#soft)"/>`;
    // дальняя раскосина — объём A-образной рамы
    s += `<path d="M ${n(cx + topW * 0.5)} ${n(y + 10)} L ${n(cx + spread * 0.86)} ${n(base)} l ${n(15)} 0 L ${n(cx + topW * 0.5 + 12)} ${n(y + 10)} Z" fill="${shade(c, -0.38)}"/>`;
    s += `<path d="M ${n(cx - topW * 0.5)} ${n(y + 10)} L ${n(cx - spread * 0.84)} ${n(base)}" stroke="${shade(c, -0.44)}" stroke-width="9" stroke-linecap="round"/>`;
    // ступени: широкие полки с рифлением и светлой верхней кромкой
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const t = 0.1 + ((i + 0.74) / steps) * 0.82;
      const yy = base - h * t;
      const hw = legX(t);
      s += `<path d="${poly([[cx - hw, yy + 15], [cx + hw, yy + 15], [cx + hw - 5, yy], [cx - hw + 5, yy]])}" fill="${shade(c, -0.28)}"/>`;
      s += `<path d="${poly([[cx - hw + 5, yy], [cx + hw - 5, yy], [cx + hw - 5, yy + 7], [cx - hw + 5, yy + 7]])}" fill="${shade(c, 0.3)}"/>`;
      for (let k = -3; k <= 3; k++) {
        s += `<rect x="${n(cx + (k * hw) / 3.6 - 1.2)}" y="${n(yy + 1.6)}" width="2.4" height="4.2" fill="${shade(c, -0.42)}" opacity="0.55"/>`;
      }
      s += `<rect x="${n(cx - hw + 6)}" y="${n(yy)}" width="${n(hw * 2 - 12)}" height="2" fill="#fff" opacity="0.4"/>`;
    }
    // верхняя площадка
    s += `<path d="${poly([[cx - topW * 1.5, y + 4], [cx + topW * 1.5, y + 4], [cx + topW * 1.2, y - 8], [cx - topW * 1.2, y - 8]])}" fill="${shade(c, 0.2)}"/>`;
    s += `<path d="${poly([[cx - topW * 1.2, y - 8], [cx + topW * 1.2, y - 8], [cx + topW * 1.2, y - 14], [cx - topW * 1.2, y - 14]])}" fill="${shade(c, 0.44)}"/>`;
    // передние стойки поверх ступеней
    for (const g of [-1, 1]) {
      s += `<path d="${poly([[cx + g * topW, y + 2], [cx + g * spread, base], [cx + g * (spread - 15), base], [cx + g * (topW - 8), y + 2]])}" fill="${g < 0 ? shade(c, 0.12) : shade(c, -0.16)}"/>`;
      s += `<path d="M ${n(cx + g * (topW - 2))} ${n(y + 6)} L ${n(cx + g * (spread - 7))} ${n(base - 6)}" stroke="#fff" stroke-width="3" opacity="0.28"/>`;
    }
    // растяжка
    s += `<rect x="${n(cx - legX(0.46) - 2)}" y="${n(base - h * 0.46)}" width="${n(legX(0.46) * 2 + 4)}" height="8" rx="3" fill="${shade(c, -0.22)}"/>`;
    s += speckle(cx - w * 0.6, y, w * 1.2, h, rnd, '#6a3a1a', 30, 0.12);
    return s + grime(cx, base - h * 0.5, w, h, rnd, pal, 3);
  },

  // 44 ── Бидон
  bidon({ rnd, pal, cx, base }) {
    const w = rnd.range(96, 116);
    const h = rnd.range(122, 148);
    const c = steel(rnd, -0.05);
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.6)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - w / 2)} ${n(y + 14)} L ${n(cx - w * 0.4)} ${n(y)} L ${n(cx + w * 0.4)} ${n(y)} L ${n(cx + w / 2)} ${n(y + 14)} Z" fill="${shade(c, 0.14)}"/>
      <rect x="${n(cx - w * 0.4)}" y="${n(y + 14)}" width="${n(w * 0.8)}" height="${n(h - 20)}" fill="${c}"/>
      <path d="M ${n(cx - w * 0.4)} ${n(y + 14)} L ${n(cx - w * 0.24)} ${n(y + 14)} L ${n(cx - w * 0.24)} ${n(base)} L ${n(cx - w * 0.4)} ${n(base)} Z" fill="#fff" opacity="0.14"/>
      <rect x="${n(cx - w * 0.4)}" y="${n(y + h * 0.34)}" width="${n(w * 0.8)}" height="4" fill="#000" opacity="0.3"/>
      <rect x="${n(cx - w * 0.4)}" y="${n(y + h * 0.68)}" width="${n(w * 0.8)}" height="4" fill="#000" opacity="0.3"/>
      <ellipse cx="${n(cx - w * 0.34)}" cy="${n(y + 7)}" rx="12" ry="5" fill="${shade(c, -0.4)}"/>
      <ellipse cx="${n(cx + w * 0.34)}" cy="${n(y + 7)}" rx="12" ry="5" fill="${shade(c, -0.4)}"/>
      <rect x="${n(cx - w * 0.22)}" y="${n(y + h * 0.44)}" width="${n(w * 0.44)}" height="${n(h * 0.16)}" fill="#c9bda0" opacity="0.5"/>
      <path d="M ${n(cx + w * 0.24)} ${n(y + 20)} q ${n(10)} ${n(h * 0.4)} ${n(3)} ${n(h * 0.6)}" stroke="${rust(rnd)}" stroke-width="5" fill="none" opacity="0.6"/>`;
  },

  // 45 ── Детская коляска
  stroller({ rnd, pal, cx, base }) {
    const c = rnd.pick(['#3b4a6a', '#6a3b3b', '#3b6a4a']);
    const R = 34;
    const y1 = base - R;
    const y2 = base - R * 0.8;
    const x1 = cx - 66;
    const x2 = cx + 70;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="86" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <circle cx="${n(x1)}" cy="${n(y1)}" r="${n(R)}" fill="none" stroke="#1e1b18" stroke-width="8"/>
      <circle cx="${n(x2)}" cy="${n(y2)}" r="${n(R * 0.7)}" fill="none" stroke="#1e1b18" stroke-width="7"/>
      <circle cx="${n(x1)}" cy="${n(y1)}" r="6" fill="#4a443c"/>`;
    s += `<path d="M ${n(x1)} ${n(y1)} L ${n(cx - 4)} ${n(y1 - 96)} L ${n(cx + 54)} ${n(y1 - 82)} L ${n(x2)} ${n(y2)}"
      fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="M ${n(cx - 10)} ${n(y1 - 96)} q ${n(40)} ${n(-52)} ${n(80)} ${n(-46)}" fill="none" stroke="${shade(c, -0.2)}" stroke-width="8" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx - 20)} ${n(y1 - 84)} q ${n(44)} ${n(-6)} ${n(84)} ${n(10)} l ${n(-6)} ${n(-34)} q ${n(-42)} ${n(-14)} ${n(-78)} ${n(-8)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(cx - 12)} ${n(y1 - 90)} q ${n(38)} ${n(-8)} ${n(72)} ${n(4)}" stroke="#fff" stroke-width="3" fill="none" opacity="0.16"/>`;
    s += `<path d="M ${n(cx + 6)} ${n(y1 - 74)} l ${n(30)} ${n(-8)}" stroke="${shade(c, -0.3)}" stroke-width="4" opacity="0.5"/>`;
    s += `<path d="M ${n(x2 + R * 0.4)} ${n(y2 - 6)} q ${n(24)} ${n(-14)} ${n(30)} ${n(-40)}" stroke="#4a443c" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="${n(x2 + R * 0.4 + 24)}" y="${n(y2 - 58)}" width="34" height="12" rx="6" fill="#2a2622"/>`;
    return s;
  },

  // 46 ── Лыжи
  skis({ rnd, pal, cx, base }) {
    const L = rnd.range(252, 290);
    const c = rnd.pick(['#c23b3b', '#3b6ac2', '#e0d0a0', '#3b9a5a']);
    const wSk = 15;
    const tipY = base - L;
    // одна лыжа: длинное полотно с загнутым вверх носком, крепления, канты
    const ski = (x0, lean, col) => {
      let g = `<g transform="rotate(${n(lean)} ${n(x0)} ${n(base)})">`;
      g += `<path d="M ${n(x0 - wSk)} ${n(base + 2)}
        L ${n(x0 - wSk + 2)} ${n(tipY + 46)}
        C ${n(x0 - wSk + 2)} ${n(tipY + 20)} ${n(x0 - 6)} ${n(tipY + 2)} ${n(x0 + 10)} ${n(tipY + 4)}
        C ${n(x0 + 22)} ${n(tipY + 6)} ${n(x0 + 22)} ${n(tipY + 20)} ${n(x0 + 9)} ${n(tipY + 22)}
        C ${n(x0 + 2)} ${n(tipY + 24)} ${n(x0 + wSk - 2)} ${n(tipY + 46)} ${n(x0 + wSk)} ${n(base + 2)} Z" fill="${col}"/>`;
      // тёмная нижняя кромка
      g += `<path d="M ${n(x0 + 2)} ${n(base + 2)} L ${n(x0 + 3)} ${n(tipY + 44)} l ${n(wSk - 2)} 0 L ${n(x0 + wSk)} ${n(base + 2)} Z" fill="#000" opacity="0.22"/>`;
      // блик по кромке
      g += `<path d="M ${n(x0 - wSk + 5)} ${n(base - 10)} L ${n(x0 - wSk + 6)} ${n(tipY + 40)}" stroke="#fff" stroke-width="3.4" opacity="0.4" stroke-linecap="round"/>`;
      // рисунок по скользящей поверхности
      g += `<path d="${poly([[x0 - 8, base - 26], [x0 + 8, base - 92], [x0 + 8, base - 118], [x0 - 8, base - 52]])}" fill="#fff" opacity="0.14"/>`;
      // крепления
      for (const t of [0.36, 0.62]) {
        const by = base - L * t;
        g += `<rect x="${n(x0 - wSk - 6)}" y="${n(by - 5)}" width="${n((wSk + 6) * 2)}" height="10" rx="3" fill="#1d1b19"/>`;
        g += `<rect x="${n(x0 - wSk - 6)}" y="${n(by - 5)}" width="${n((wSk + 6) * 2)}" height="3" rx="1.5" fill="#6a645e" opacity="0.85"/>`;
      }
      g += `</g>`;
      return g;
    };
    // лыжная палка: тонкий стержень, корзинка, ручка
    const pole = (x0, lean) => `<g transform="rotate(${n(lean)} ${n(x0)} ${n(base)})">
      <line x1="${n(x0)}" y1="${n(base)}" x2="${n(x0)}" y2="${n(base - L * 0.97)}" stroke="#9aa0a6" stroke-width="6" stroke-linecap="round"/>
      <line x1="${n(x0 - 1.6)}" y1="${n(base - 8)}" x2="${n(x0 - 1.6)}" y2="${n(base - L * 0.9)}" stroke="#fff" stroke-width="1.8" opacity="0.45"/>
      <ellipse cx="${n(x0)}" cy="${n(base - L * 0.26)}" rx="14" ry="4" fill="#767c82"/>
      <ellipse cx="${n(x0)}" cy="${n(base - L * 0.26)}" rx="14" ry="4" fill="none" stroke="#3f4448" stroke-width="1.4"/>
      <path d="M ${n(x0 - 7)} ${n(base - L * 0.9)} l 14 0 l 0 18 l -14 0 Z" fill="#2b2825"/>
      <path d="M ${n(x0 - 10)} ${n(base - L * 0.9)} q 10 -16 20 0" fill="none" stroke="#2b2825" stroke-width="4.4"/>
    </g>`;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="112" ry="14" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    s += pole(cx - 92, rnd.range(4, 10));
    s += pole(cx + 88, rnd.range(-10, -4));
    s += ski(cx + 30, 13, shade(c, -0.24));
    s += ski(cx - 26, -12, c);
    return s + grime(cx, base - L * 0.4, 104, L * 0.6, rnd, pal, 3);
  },

  // 47 ── Санки
  sled({ rnd, pal, cx, base }) {
    const L = rnd.range(152, 180);
    const H = rnd.range(120, 146);
    const c = rnd.pick(['#8a3b3b', '#3b5a8a', '#6b4a24', '#4a6b3b']);
    const xL = cx - L * 0.54;
    const xR = cx + L * 0.46;
    const seatY = base - H * 0.46;
    const backY = base - H;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(L * 0.62)}" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    // полоз: длинная дуга с загнутым передком
    const runner = `M ${n(xR - 4)} ${n(base - 5)} L ${n(xL + 24)} ${n(base - 5)}
      C ${n(xL + 2)} ${n(base - 8)} ${n(xL - 6)} ${n(base - 18)} ${n(xL - 2)} ${n(base - 36)}
      C ${n(xL + 1)} ${n(base - 52)} ${n(xL + 15)} ${n(base - 56)} ${n(xL + 22)} ${n(base - 43)}`;
    s += `<path d="${runner}" fill="none" stroke="${shade(c, -0.36)}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${runner}" fill="none" stroke="#d3d8dd" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`;
    // стойки
    for (const px of [xL + 34, cx - 4, xR - 16]) {
      s += `<line x1="${n(px)}" y1="${n(base - 7)}" x2="${n(px)}" y2="${n(seatY + 4)}" stroke="${shade(c, -0.3)}" stroke-width="9" stroke-linecap="round"/>`;
    }
    // сиденье
    s += `<rect x="${n(xL + 18)}" y="${n(seatY)}" width="${n(xR - xL - 24)}" height="12" rx="4" fill="${c}"/>`;
    s += `<rect x="${n(xL + 18)}" y="${n(seatY)}" width="${n(xR - xL - 24)}" height="4" rx="2" fill="#fff" opacity="0.22"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<rect x="${n(xL + 40 + i * 34)}" y="${n(seatY + 3)}" width="3" height="9" fill="#000" opacity="0.3"/>`;
    }
    // передний борт
    s += `<path d="${poly([[xL + 16, seatY - 2], [xL + 13, seatY - 36], [xL + 43, seatY - 38], [xL + 45, seatY - 2]])}" fill="${shade(c, 0.1)}"/>`;
    s += `<rect x="${n(xL + 14)}" y="${n(seatY - 38)}" width="30" height="5" rx="2.5" fill="#fff" opacity="0.24"/>`;
    // спинка
    s += `<path d="${poly([[xR - 42, seatY - 2], [xR - 36, backY], [xR - 8, backY + 3], [xR - 12, seatY - 2]])}" fill="${shade(c, -0.08)}"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<line x1="${n(xR - 37 + i * 11)}" y1="${n(seatY - 4)}" x2="${n(xR - 33 + i * 11)}" y2="${n(backY + 4)}" stroke="#000" stroke-width="3" opacity="0.28"/>`;
    }
    s += `<rect x="${n(xR - 43)}" y="${n(backY - 2)}" width="38" height="11" rx="5" fill="${shade(c, 0.2)}"/>`;
    s += `<rect x="${n(xR - 43)}" y="${n(backY - 2)}" width="38" height="3" rx="1.5" fill="#fff" opacity="0.26"/>`;
    // верёвочная ручка спереди
    s += `<path d="M ${n(xL + 18)} ${n(seatY - 32)} q ${n(-36)} ${n(-14)} ${n(-16)} ${n(-54)} q ${n(12)} ${n(-24)} ${n(38)} ${n(-10)}"
      fill="none" stroke="#a08a5e" stroke-width="5" stroke-linecap="round"/>`;
    s += speckle(xL, seatY, xR - xL, base - seatY, rnd, '#3a2a18', 26, 0.14);
    return s + grime(cx, base - H * 0.5, L, H, rnd, pal, 3);
  },

  // 48 ── Плетёная корзина
  basket({ rnd, pal, cx, base }) {
    const w = rnd.range(140, 168);
    const h = rnd.range(94, 116);
    const c = shade('#a8834a', rnd.range(-0.1, 0.1));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <path d="M ${n(cx - w * 0.42)} ${n(y + 10)} L ${n(cx - w / 2)} ${n(base)} L ${n(cx + w / 2)} ${n(base)} L ${n(cx + w * 0.42)} ${n(y + 10)} Z" fill="${c}"/>`;
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const yy = lerp(y + 14, base - 4, t);
      const ww = lerp(w * 0.86, w, t);
      s += `<line x1="${n(cx - ww / 2)}" y1="${n(yy)}" x2="${n(cx + ww / 2)}" y2="${n(yy)}" stroke="${shade(c, -0.24)}" stroke-width="3.4" opacity="0.8"/>`;
    }
    for (let i = -4; i <= 4; i++) {
      const t = i / 4;
      s += `<line x1="${n(lerp(cx - w * 0.42, cx - w / 2, 0.5))}" y1="${n(y + 10)}" x2="${n(cx + w * 0.5)}" y2="${n(base)}"
        stroke="${shade(c, -0.16)}" stroke-width="2.6" opacity="0.5" transform="rotate(${n(t * 5)} ${n(cx)} ${n(base)})"/>`;
    }
    s += `<ellipse cx="${n(cx)}" cy="${n(y + 10)}" rx="${n(w * 0.42)}" ry="${n(h * 0.14)}" fill="${shade(c, 0.16)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y + 11)}" rx="${n(w * 0.36)}" ry="${n(h * 0.1)}" fill="#2a1f12" opacity="0.6"/>`;
    s += `<path d="M ${n(cx - w * 0.44)} ${n(y + 14)} q ${n(-14)} ${n(-h * 0.6)} ${n(10)} ${n(-h * 0.86)}"
      fill="none" stroke="${shade(c, -0.1)}" stroke-width="8"/>`;
    s += `<path d="M ${n(cx + w * 0.44)} ${n(y + 14)} q ${n(14)} ${n(-h * 0.6)} ${n(-10)} ${n(-h * 0.86)}"
      fill="none" stroke="${shade(c, -0.1)}" stroke-width="8"/>`;
    s += `<path d="M ${n(cx - w * 0.3)} ${n(y + h * 0.3)} l ${n(20)} ${n(h * 0.3)}" stroke="#fff" stroke-width="3" opacity="0.12"/>`;
    return s + grime(cx, y + h * 0.5, w, h, rnd, pal, 4);
  },

  // 49 ── Самовар
  samovar({ rnd, pal, cx, base }) {
    const w = rnd.range(104, 124);
    const h = rnd.range(150, 178);
    const c = shade('#a8905a', rnd.range(-0.1, 0.1));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.66)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w * 0.44)}" y="${n(base - 18)}" width="${n(w * 0.88)}" height="18" rx="4" fill="${shade(c, -0.3)}"/>
      <path d="M ${n(cx - w / 2)} ${n(base - 18)} q ${n(-2)} ${n(-h * 0.32)} ${n(w * 0.28)} ${n(-h * 0.34)}
        l ${n(w * 0.44)} 0 q ${n(w * 0.26)} ${n(2)} ${n(w * 0.28)} ${n(h * 0.34)} Z" fill="${c}"/>
      <path d="M ${n(cx - w * 0.5)} ${n(base - 18)} q ${n(-2)} ${n(-h * 0.3)} ${n(w * 0.26)} ${n(-h * 0.32)}
        l ${n(w * 0.12)} 0 l 0 ${n(h * 0.32)} Z" fill="#fff" opacity="0.16"/>
      <ellipse cx="${n(cx)}" cy="${n(base - h * 0.56)}" rx="${n(w * 0.2)}" ry="7" fill="${shade(c, -0.2)}"/>
      <rect x="${n(cx - w * 0.2)}" y="${n(base - h * 0.68)}" width="${n(w * 0.4)}" height="${n(h * 0.14)}" fill="${shade(c, 0.08)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - h * 0.68)}" rx="${n(w * 0.2)}" ry="6" fill="${shade(c, 0.2)}"/>
      <rect x="${n(cx - 5)}" y="${n(base - h - 18)}" width="10" height="22" rx="4" fill="${shade(c, -0.15)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - h - 20)}" rx="9" ry="7" fill="${shade(c, 0.25)}"/>`;
    s += `<path d="M ${n(cx - w * 0.5)} ${n(base - h * 0.44)} q ${n(-44)} ${n(-10)} ${n(-46)} ${n(34)}" stroke="${shade(c, -0.2)}" stroke-width="9" fill="none"/>`;
    s += `<path d="M ${n(cx + w * 0.5)} ${n(base - h * 0.44)} q ${n(20)} ${n(-6)} ${n(22)} ${n(-40)}" stroke="${shade(c, -0.2)}" stroke-width="7" fill="none"/>`;
    s += `<circle cx="${n(cx + w * 0.52)}" cy="${n(base - h * 0.5)}" r="9" fill="${shade(c, -0.2)}"/>`;
    s += `<circle cx="${n(cx + w * 0.52)}" cy="${n(base - h * 0.5)}" r="3.4" fill="#3a2c14"/>`;
    s += `<rect x="${n(cx - 16)}" y="${n(base - h * 0.32)}" width="32" height="12" rx="5" fill="${shade(c, -0.34)}"/>`;
    s += `<path d="M ${n(cx - w * 0.34)} ${n(base - h * 0.2)} q ${n(24)} ${n(h * 0.08)} ${n(w * 0.5)} 0" stroke="#fff" stroke-width="4" fill="none" opacity="0.14"/>`;
    return s + grime(cx, base - h * 0.5, w, h, rnd, pal, 4);
  },

  // 50 ── Катушка ниток
  spool({ rnd, pal, cx, base }) {
    const cols = ['#c23b5a', '#3b6ac2', '#c2a63b', '#3bc26a', '#a63bc2'];
    const R = rnd.range(46, 58);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="88" ry="12" fill="#000" opacity="0.4" filter="url(#soft)"/>`;
    // нижняя лежит
    const y1 = base - R * 0.6;
    s += `<ellipse cx="${n(cx - 30)}" cy="${n(y1)}" rx="${n(R)}" ry="${n(R * 0.5)}" fill="${rnd.pick(cols)}"/>`;
    s += `<ellipse cx="${n(cx - 30)}" cy="${n(y1)}" rx="${n(R * 0.36)}" ry="${n(R * 0.18)}" fill="#c9b28a"/>`;
    s += `<ellipse cx="${n(cx - 30)}" cy="${n(y1)}" rx="${n(R * 0.16)}" ry="${n(R * 0.08)}" fill="#3a2e1e"/>`;
    for (let i = 0; i < 5; i++) {
      s += `<path d="${arcPath(cx - 30, y1, R * (0.5 + i * 0.1), 200, 340)}" stroke="#000" stroke-width="1.6" fill="none" opacity="0.18"/>`;
    }
    // верхняя стоит
    const y2 = base - R * 1.8;
    s += `<rect x="${n(cx + 16 - R * 0.86)}" y="${n(y2)}" width="${n(R * 1.72)}" height="${n(R * 1.1)}" rx="4" fill="${rnd.pick(cols)}"/>`;
    s += `<ellipse cx="${n(cx + 16)}" cy="${n(y2)}" rx="${n(R * 0.86)}" ry="${n(R * 0.34)}" fill="#c9b28a"/>`;
    s += `<ellipse cx="${n(cx + 16)}" cy="${n(y2 - 1)}" rx="${n(R * 0.3)}" ry="${n(R * 0.12)}" fill="#3a2e1e"/>`;
    s += `<rect x="${n(cx + 16 - R * 0.86)}" y="${n(y2 + R * 0.5)}" width="${n(R * 0.4)}" height="${n(R * 1.1)}" fill="#fff" opacity="0.14"/>`;
    for (let i = 0; i < 8; i++) {
      s += `<line x1="${n(cx + 16 - R * 0.86)}" y1="${n(y2 + 4 + i * (R * 0.13))}" x2="${n(cx + 16 + R * 0.86)}" y2="${n(y2 + 4 + i * (R * 0.13))}"
        stroke="#000" stroke-width="1.4" opacity="0.16"/>`;
    }
    // нитка
    s += `<path d="M ${n(cx + 16 + R * 0.4)} ${n(y2 + R * 0.2)} q ${n(40)} ${n(20)} ${n(20)} ${n(R * 0.9)}"
      stroke="${rnd.pick(cols)}" stroke-width="2.4" fill="none"/>`;
    return s;
  },

  // 51 ── Чайник со свистом
  kettle({ rnd, pal, cx, base }) {
    const R = rnd.range(62, 76);
    const y = base - R * 1.05;
    const c = steel(rnd, 0.08);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(R * 0.8)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <path d="M ${n(cx - R * 0.9)} ${n(y + R * 0.5)} q ${n(-2)} ${n(-R * 0.9)} ${n(R * 0.9)} ${n(-R * 0.9)}
        q ${n(R * 0.92)} 0 ${n(R * 0.9)} ${n(R * 0.9)} Z" fill="${c}"/>
      <path d="M ${n(cx - R * 0.9)} ${n(y + R * 0.5)} q ${n(-2)} ${n(-R * 0.86)} ${n(R * 0.7)} ${n(-R * 0.9)}
        l ${n(R * 0.2)} 0 l 0 ${n(R * 0.9)} Z" fill="#fff" opacity="0.16"/>
      <ellipse cx="${n(cx)}" cy="${n(y + R * 0.5)}" rx="${n(R * 0.9)}" ry="${n(R * 0.16)}" fill="${shade(c, -0.34)}"/>
      <ellipse cx="${n(cx - R * 0.3)}" cy="${n(y - R * 0.1)}" rx="${n(R * 0.26)}" ry="${n(R * 0.3)}" fill="#fff" opacity="0.2"/>`;
    s += `<path d="M ${n(cx - R * 0.88)} ${n(y + R * 0.16)} q ${n(-52)} ${n(-4)} ${n(-40)} ${n(-40)}" stroke="${shade(c, -0.16)}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx + R * 0.86)} ${n(y + R * 0.2)} l ${n(52)} ${n(-24)} l ${n(-6)} ${n(-26)} l ${n(-48)} ${n(24)} Z" fill="${shade(c, -0.06)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y - R * 0.42)}" rx="${n(R * 0.3)}" ry="${n(R * 0.1)}" fill="${shade(c, 0.22)}"/>`;
    s += `<rect x="${n(cx - 5)}" y="${n(y - R * 0.62)}" width="10" height="14" rx="4" fill="${shade(c, 0.1)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y - R * 0.64)}" rx="7" ry="6" fill="#2a2622"/>`;
    s += `<path d="M ${n(cx + R * 0.5)} ${n(y - R * 0.9)} q ${n(10)} ${n(-14)} ${n(-2)} ${n(-22)}"
      stroke="#d8e0e6" stroke-width="4" fill="none" opacity="0.4" stroke-linecap="round"/>`;
    return s;
  },

  // 52 ── Стиральная машина
  washer({ rnd, pal, cx, base }) {
    const w = rnd.range(150, 174);
    const h = rnd.range(168, 190);
    const c = steel(rnd, 0.12);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.56)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="8" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 4)}" width="${n(w * 0.18)}" height="${n(h - 8)}" rx="6" fill="#fff" opacity="0.12"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(y + 6)}" width="${n(w - 12)}" height="${n(h * 0.2)}" rx="5" fill="${shade(c, -0.16)}"/>
      <circle cx="${n(cx - w * 0.3)}" cy="${n(y + h * 0.16)}" r="9" fill="#3a3630"/>
      <circle cx="${n(cx - w * 0.06)}" cy="${n(y + h * 0.16)}" r="7" fill="#2a2622"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<circle cx="${n(cx + w * 0.14 + i * (w * 0.12))}" cy="${n(y + h * 0.16)}" r="5" fill="#4a443c"/>`;
    }
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.58)}" r="${n(w * 0.32)}" fill="#3a3630"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.58)}" r="${n(w * 0.26)}" fill="#141210"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.58)}" r="${n(w * 0.26)}" fill="url(#backglow)" opacity="0.4"/>`;
    s += `<path d="M ${n(cx - w * 0.16)} ${n(y + h * 0.48)} a ${n(w * 0.2)} ${n(w * 0.2)} 0 0 1 ${n(w * 0.26)} ${n(-h * 0.02)}"
      stroke="#fff" stroke-width="5" fill="none" opacity="0.16"/>`;
    s += `<rect x="${n(cx - w / 2 + 6)}" y="${n(base - 14)}" width="${n(w - 12)}" height="10" fill="#000" opacity="0.35"/>`;
    return s + grime(cx, y + h * 0.6, w, h, rnd, pal, 4);
  },

  // 53 ── Вентилятор
  fan({ rnd, pal, cx, base }) {
    const R = rnd.range(56, 70);
    const c = steel(rnd, 0.04);
    const y = base - R * 1.9;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="52" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 8)}" rx="38" ry="10" fill="${shade(c, -0.1)}"/>
      <rect x="${n(cx - 7)}" y="${n(y + R * 0.6)}" width="14" height="${n(R * 1.3)}" fill="${shade(c, -0.2)}"/>
      <circle cx="${n(cx)}" cy="${n(y)}" r="${n(R * 0.34)}" fill="${shade(c, 0.1)}"/>`;
    for (let i = 0; i < 4; i++) {
      const a = (360 / 4) * i + 18;
      const [x1, y1] = polar(cx, y, R * 0.28, a);
      const [x2, y2] = polar(cx, y, R * 0.94, a);
      const [x3, y3] = polar(cx, y, R * 0.94, a + 44);
      const [x4, y4] = polar(cx, y, R * 0.28, a + 44);
      s += `<path d="M ${n(x1)} ${n(y1)} L ${n(x2)} ${n(y2)} A ${n(R * 0.94)} ${n(R * 0.94)} 0 0 1 ${n(x3)} ${n(y3)} L ${n(x4)} ${n(y4)} A ${n(R * 0.28)} ${n(R * 0.28)} 0 0 0 ${n(x1)} ${n(y1)} Z"
        fill="#8e9296" opacity="0.5"/>`;
    }
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R * 0.94)}" fill="none" stroke="${c}" stroke-width="7"/>`;
    for (let i = 0; i < 9; i++) {
      const a = i * 40;
      const [x1, y1] = polar(cx, y, R * 0.34, a);
      const [x2, y2] = polar(cx, y, R * 0.94, a);
      s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${c}" stroke-width="2.4" opacity="0.7"/>`;
    }
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="10" fill="${shade(c, 0.2)}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="4" fill="#2a2622"/>`;
    s += `<rect x="${n(cx + R * 0.9)}" y="${n(y - 8)}" width="12" height="16" rx="4" fill="${shade(c, -0.2)}"/>`;
    return s;
  },

  // 54 ── Швейная машинка
  sewingmachine({ rnd, pal, cx, base }) {
    const w = rnd.range(150, 172);
    const tw = rnd.range(24, 30);
    const th = rnd.range(150, 170);
    const ty = base - th;
    const c = '#2b2723';
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.58)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(ty + th * 0.68)}" width="${n(w)}" height="${n(tw)}" fill="${shade('#6b5133', rnd.range(-0.1, 0.1))}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(ty + th * 0.68)}" width="${n(w * 0.2)}" height="${n(tw)}" fill="#fff" opacity="0.1"/>`;
    s += `<rect x="${n(cx - w / 2 + 6)}" y="${n(base - 4)}" width="12" height="10" fill="#3a2c1c"/>`;
    s += `<rect x="${n(cx + w / 2 - 18)}" y="${n(base - 4)}" width="12" height="10" fill="#3a2c1c"/>`;
    s += `<path d="M ${n(cx - w * 0.4)} ${n(ty + th * 0.68)} L ${n(cx - w * 0.4)} ${n(ty + th * 0.36)}
      q 0 ${n(-th * 0.3)} ${n(w * 0.34)} ${n(-th * 0.3)} q ${n(w * 0.34)} 0 ${n(w * 0.34)} ${n(th * 0.26)}
      l ${n(w * 0.22)} 0 l 0 ${n(th * 0.3)} l ${n(-w * 0.42)} 0 l 0 ${n(-th * 0.2)} Z" fill="${c}"/>`;
    s += `<rect x="${n(cx - w * 0.36)}" y="${n(ty + th * 0.12)}" width="${n(w * 0.3)}" height="5" fill="#fff" opacity="0.14"/>`;
    s += `<circle cx="${n(cx + w * 0.18)}" cy="${n(ty + th * 0.44)}" r="15" fill="${shade(c, 0.16)}"/>`;
    s += `<circle cx="${n(cx + w * 0.18)}" cy="${n(ty + th * 0.44)}" r="6" fill="#c9bda0"/>`;
    s += `<rect x="${n(cx - w * 0.36)}" y="${n(ty + th * 0.56)}" width="${n(w * 0.66)}" height="10" fill="${shade(c, -0.3)}"/>`;
    s += `<rect x="${n(cx + w * 0.16)}" y="${n(ty + th * 0.56)}" width="6" height="30" fill="#9a938a"/>`;
    s += `<rect x="${n(cx + w * 0.1)}" y="${n(ty + th * 0.56 + 26)}" width="18" height="7" rx="2" fill="#6a6157"/>`;
    s += `<path d="M ${n(cx + w * 0.14)} ${n(ty + th * 0.56 + 32)} q -8 20 6 30" stroke="#d8cdb2" stroke-width="2" fill="none" opacity="0.7"/>`;
    return s;
  },

  // 55 ── Бухта кабеля
  cable({ rnd, pal, cx, base }) {
    const R = rnd.range(72, 90);
    const c = shade('#2a2724', rnd.range(-0.04, 0.08));
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 2)}" rx="${n(R)}" ry="${n(R * 0.24)}" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <ellipse cx="${n(cx)}" cy="${n(base - R * 0.16)}" rx="${n(R)}" ry="${n(R * 0.3)}" fill="${c}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - R * 0.16)}" rx="${n(R * 0.6)}" ry="${n(R * 0.18)}" fill="#100e0c"/>
      <ellipse cx="${n(cx)}" cy="${n(base - R * 0.4)}" rx="${n(R * 0.8)}" ry="${n(R * 0.24)}" fill="${shade(c, 0.1)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - R * 0.4)}" rx="${n(R * 0.44)}" ry="${n(R * 0.13)}" fill="#100e0c"/>
      <ellipse cx="${n(cx)}" cy="${n(base - R * 0.6)}" rx="${n(R * 0.55)}" ry="${n(R * 0.17)}" fill="${shade(c, 0.16)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - R * 0.6)}" rx="${n(R * 0.26)}" ry="${n(R * 0.08)}" fill="#100e0c"/>`;
    for (let i = 0; i < 7; i++) {
      s += `<path d="${arcPath(cx, base - R * 0.2, R * (0.7 + i * 0.05), 200, 350)}" stroke="${shade(c, 0.28)}" stroke-width="2" fill="none" opacity="0.2"/>`;
    }
    s += `<path d="M ${n(cx + R * 0.7)} ${n(base - R * 0.3)} q ${n(40)} ${n(-20)} ${n(52)} ${n(-52)}" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="${n(cx + R * 0.86)}" y="${n(base - R * 0.98)}" width="16" height="24" rx="4" fill="#b0a89a"/>`;
    s += `<rect x="${n(cx + R * 0.9)}" y="${n(base - R * 0.96)}" width="6" height="12" fill="#4a443c"/>`;
    return s;
  },

  // 56 ── Набор ключей
  wrenches({ rnd, pal, cx, base }) {
    const k = rnd.int(4, 6);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="86" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    for (let i = 0; i < k; i++) {
      const L = rnd.range(96, 148);
      const w = rnd.range(11, 17);
      const c = steel(rnd, rnd.range(-0.12, 0.1));
      const x = cx + (i - (k - 1) / 2) * rnd.range(24, 32);
      const rot = rnd.range(-16, 16);
      s += `<g transform="rotate(${n(rot)} ${n(x)} ${n(base)})">
        <rect x="${n(x - w * 0.36)}" y="${n(base - L * 0.82)}" width="${n(w * 0.72)}" height="${n(L * 0.82)}" rx="3" fill="${c}"/>
        <path d="M ${n(x - w * 0.62)} ${n(base - L * 0.98)} l ${n(w * 0.5)} 0 l 0 ${n(L * 0.16)} l ${n(w * 0.24)} 0 l 0 ${n(-L * 0.06)} l ${n(-w * 0.74)} 0 l 0 ${n(L * 0.06)} l ${n(w * 0.24)} 0 Z" fill="${c}"/>
        <path d="M ${n(x - w * 0.6)} ${n(base - L * 0.94)} l ${n(w * 0.44)} 0 l 0 ${n(L * 0.1)} l ${n(-w * 0.44)} 0 Z" fill="#0d0b09"/>
        <rect x="${n(x - w * 0.36)}" y="${n(base - L * 0.82)}" width="${n(w * 0.22)}" height="${n(L * 0.82)}" fill="#fff" opacity="0.16"/>
      </g>`;
    }
    return s + grime(cx, base - 50, 150, 100, rnd, pal, 4);
  },

  // 57 ── Мягкое кресло
  armchair({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 224);
    const h = rnd.range(184, 216);
    const c = shade('#6a3a3a', rnd.range(-0.1, 0.1));
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    s += `<rect x="${n(cx - w * 0.44)}" y="${n(y)}" width="${n(w * 0.88)}" height="${n(h * 0.68)}" rx="${n(w * 0.16)}" fill="${c}"/>`;
    s += `<rect x="${n(cx - w * 0.36)}" y="${n(y + 10)}" width="${n(w * 0.32)}" height="${n(h * 0.42)}" rx="14" fill="${shade(c, 0.12)}"/>`;
    s += `<rect x="${n(cx + w * 0.04)}" y="${n(y + 10)}" width="${n(w * 0.32)}" height="${n(h * 0.42)}" rx="14" fill="${shade(c, 0.12)}"/>`;
    s += `<path d="M ${n(cx)} ${n(y + 12)} v ${n(h * 0.4)}" stroke="${shade(c, -0.26)}" stroke-width="3"/>`;
    s += `<rect x="${n(cx - w * 0.48)}" y="${n(y + h * 0.3)}" width="${n(w * 0.2)}" height="${n(h * 0.56)}" rx="20" fill="${shade(c, -0.06)}"/>`;
    s += `<rect x="${n(cx + w * 0.28)}" y="${n(y + h * 0.3)}" width="${n(w * 0.2)}" height="${n(h * 0.56)}" rx="20" fill="${shade(c, -0.06)}"/>`;
    s += `<rect x="${n(cx - w * 0.4)}" y="${n(y + h * 0.56)}" width="${n(w * 0.8)}" height="${n(h * 0.28)}" rx="16" fill="${shade(c, 0.18)}"/>`;
    s += `<rect x="${n(cx - w * 0.4)}" y="${n(y + h * 0.56)}" width="${n(w * 0.8)}" height="${n(h * 0.28)}" rx="16" fill="url(#backglow)" opacity="0.35"/>`;
    s += `<rect x="${n(cx - w * 0.34)}" y="${n(y + h * 0.56)}" width="${n(w * 0.12)}" height="${n(h * 0.26)}" rx="10" fill="#fff" opacity="0.12"/>`;
    s += `<rect x="${n(cx - w * 0.38)}" y="${n(base - 16)}" width="18" height="16" rx="4" fill="#3a2c1e"/>`;
    s += `<rect x="${n(cx + w * 0.22)}" y="${n(base - 16)}" width="18" height="16" rx="4" fill="#3a2c1e"/>`;
    return s + folds(cx, y + h * 0.5, w, h, rnd, shade(c, -0.3), 0.24, 4) + grime(cx, y + h * 0.5, w, h, rnd, pal, 4);
  },

  // 58 ── Шкаф
  cabinet({ rnd, pal, cx, base }) {
    const w = rnd.range(136, 160);
    const h = rnd.range(224, 258);
    const c = shade('#5a4a36', rnd.range(-0.1, 0.1));
    const y = base - h;
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.58)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + 14)}" width="${n(w)}" height="18" rx="3" fill="${shade(c, 0.16)}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 32)}" width="${n(w * 0.46)}" height="${n(h - 48)}" fill="${c}"/>
      <rect x="${n(cx + w * 0.04)}" y="${n(y + 32)}" width="${n(w * 0.46)}" height="${n(h - 48)}" fill="${shade(c, -0.12)}"/>
      <rect x="${n(cx - w / 2 + 12)}" y="${n(y + 42)}" width="${n(w * 0.3)}" height="${n(h * 0.6)}" rx="3" fill="none" stroke="#000" stroke-width="2.4" opacity="0.3"/>
      <rect x="${n(cx + w * 0.1)}" y="${n(y + 42)}" width="${n(w * 0.3)}" height="${n(h * 0.6)}" rx="3" fill="none" stroke="#000" stroke-width="2.4" opacity="0.3"/>
      <rect x="${n(cx - 10)}" y="${n(y + h * 0.34)}" width="6" height="22" rx="3" fill="#a8905a"/>
      <rect x="${n(cx + 4)}" y="${n(y + h * 0.34)}" width="6" height="22" rx="3" fill="#a8905a"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(y + 32)}" width="${n(w * 0.12)}" height="${n(h - 48)}" fill="#fff" opacity="0.08"/>`;
  },

  // 59 ── Ржавая сетка
  mesh({ rnd, pal, cx, base }) {
    const w = rnd.range(220, 260);
    const h = rnd.range(190, 224);
    const c = rust(rnd);
    const lean = rnd.range(-13, 13);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.48)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(lean)} ${n(cx + w * 0.45)} ${n(base)})">
        <rect x="${n(cx - w / 2)}" y="${n(base - h)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${c}" stroke-width="6"/>`;
    const step = 22;
    for (let i = 0; i <= w / step; i++) {
      s += `<line x1="${n(cx - w / 2 + i * step)}" y1="${n(base - h)}" x2="${n(cx - w / 2 + i * step)}" y2="${n(base)}"
        stroke="${shade(c, rnd.range(-0.12, 0.12))}" stroke-width="3.4" opacity="0.9"/>`;
    }
    for (let i = 0; i <= h / step; i++) {
      s += `<line x1="${n(cx - w / 2)}" y1="${n(base - h + i * step)}" x2="${n(cx + w / 2)}" y2="${n(base - h + i * step)}"
        stroke="${shade(c, rnd.range(-0.12, 0.12))}" stroke-width="3.4" opacity="0.9"/>`;
    }
    s += `<path d="M ${n(cx - w * 0.4)} ${n(base - h * 0.2)} q ${n(w * 0.2)} ${n(-h * 0.2)} ${n(w * 0.1)} ${n(-h * 0.5)}"
      stroke="${shade(c, -0.2)}" stroke-width="4" fill="none"/>`;
    s += `</g>`;
    return s + speckle(cx - w / 2, base - h, w, h, rnd, '#c07a3a', 44, 0.2);
  },

  // 60 ── Пустой аквариум
  aquarium({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 224);
    const h = rnd.range(130, 152);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="#0e1a1c" opacity="0.8"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="url(#backglow)" opacity="0.45"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="#2a3a3c" stroke-width="11"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 4)}" width="${n(w * 0.16)}" height="${n(h - 8)}" fill="#fff" opacity="0.12"/>
      <path d="M ${n(cx - w * 0.34)} ${n(y + h * 0.1)} l ${n(w * 0.2)} ${n(h * 0.4)} l ${n(-w * 0.06)} ${n(-h * 0.2)}" stroke="#cfe4e8" stroke-width="3" fill="none" opacity="0.22"/>
      <path d="M ${n(cx + w * 0.1)} ${n(y + h * 0.16)} l ${n(w * 0.16)} ${n(h * 0.5)}" stroke="#cfe4e8" stroke-width="2.4" fill="none" opacity="0.16"/>
      <rect x="${n(cx - w / 2 - 8)}" y="${n(y - 12)}" width="${n(w + 16)}" height="14" rx="3" fill="#232c2e"/>
      <rect x="${n(cx - w / 2 - 8)}" y="${n(base - 6)}" width="${n(w + 16)}" height="14" rx="3" fill="#232c2e"/>
      <rect x="${n(cx - 16)}" y="${n(y + h * 0.3)}" width="32" height="12" rx="3" fill="#2f3a3c"/>`;
    s += `<rect x="${n(cx - w * 0.3)}" y="${n(y + h * 0.72)}" width="${n(w * 0.34)}" height="${n(h * 0.1)}" rx="4" fill="#2a2622" opacity="0.7"/>`;
    s += `<path d="M ${n(cx + w * 0.1)} ${n(y + h * 0.8)} q ${n(-20)} ${n(-h * 0.2)} ${n(6)} ${n(-h * 0.3)}" stroke="#3a4a3a" stroke-width="5" fill="none" opacity="0.7"/>`;
    s += speckle(cx - w / 2, y, w, h, rnd, '#9ab0b4', 30, 0.1);
    return s;
  },
};
