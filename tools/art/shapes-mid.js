// Средний лот (лоты 61–90). Предметы сохраннее, цвета богаче, деталей больше.

import { n, lerp, poly, polar, arcPath, shade, grime, speckle, folds } from './lib.js';

const wood = (rnd, k = 0) => shade('#8a4a28', rnd.range(-0.14, 0.14) + k);
const brass = (rnd, k = 0) => shade('#b8873a', rnd.range(-0.12, 0.14) + k);
const steel = (rnd, k = 0) => shade('#a8adb2', rnd.range(-0.14, 0.14) + k);
const silver = (rnd) => shade('#c6ccd2', rnd.range(-0.1, 0.08));

/** Мягкий контровой свет */
const rim = (cx, y, w, h, op = 0.3) =>
  `<ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(w * 0.6)}" ry="${n(h * 0.62)}" fill="url(#halolight)" opacity="${n(op)}"/>`;

/** Искра-блик */
const sparkle = (x, y, s, op = 0.85) =>
  `<path d="${poly([[x, y - s], [x + s * 0.22, y - s * 0.22], [x + s, y], [x + s * 0.22, y + s * 0.22], [x, y + s], [x - s * 0.22, y + s * 0.22], [x - s, y], [x - s * 0.22, y - s * 0.22]])}"
    fill="#fff8e0" opacity="${n(op)}"/>`;

export const MID = {
  // 61 ── Удочка
  fishingrod({ rnd, pal, cx, base }) {
    const L = rnd.range(250, 300);
    const a = rnd.range(-118, -96);
    const bx = cx + 60;
    const c = wood(rnd, -0.12);
    const [tx, ty] = polar(bx, base, L, a);
    const [hx, hy] = polar(bx, base, 88, a);
    let s = `<ellipse cx="${n(bx)}" cy="${n(base + 3)}" rx="66" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    // рукоять
    s += `<g transform="rotate(${n(90 + a)} ${n(bx)} ${n(base)})">
      <rect x="${n(bx - 15)}" y="${n(base - 88)}" width="15" height="90" rx="7" fill="${shade(c, 0.2)}"/>
      <rect x="${n(bx - 15)}" y="${n(base - 88)}" width="5" height="90" fill="#fff" opacity="0.14"/>
      <rect x="${n(bx - 18)}" y="${n(base - 12)}" width="21" height="9" rx="4" fill="${brass(rnd)}"/>
      <rect x="${n(bx - 18)}" y="${n(base - 88)}" width="21" height="9" rx="4" fill="${brass(rnd)}"/>
    </g>`;
    // бланк
    s += `<line x1="${n(hx)}" y1="${n(hy)}" x2="${n(tx)}" y2="${n(ty)}" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`;
    s += `<line x1="${n(hx)}" y1="${n(hy)}" x2="${n(tx)}" y2="${n(ty)}" stroke="#fff" stroke-width="2" opacity="0.18"/>`;
    // катушка
    const [rx, ry] = polar(bx, base, 118, a);
    s += `<circle cx="${n(rx)}" cy="${n(ry)}" r="21" fill="${shade(brass(rnd), -0.15)}"/>`;
    s += `<circle cx="${n(rx)}" cy="${n(ry)}" r="15" fill="#1e1a12"/>`;
    s += `<circle cx="${n(rx)}" cy="${n(ry)}" r="5" fill="${brass(rnd)}"/>`;
    s += `<path d="${arcPath(rx, ry, 18, 160, 340)}" fill="none" stroke="#fff" stroke-width="2.4" opacity="0.4"/>`;
    s += `<path d="M ${n(rx + 16)} ${n(ry + 6)} l 18 8" stroke="${shade(c, -0.1)}" stroke-width="5" stroke-linecap="round"/>`;
    // леска и крючок
    s += `<path d="M ${n(tx)} ${n(ty)} q ${n(rnd.range(10, 26))} ${n(rnd.range(40, 70))} ${n(rnd.range(-4, 12))} ${n(rnd.range(80, 120))}"
      stroke="#e8e0c8" stroke-width="1.3" fill="none" opacity="0.6"/>`;
    return s;
  },

  // 62 ── Гитара
  guitar({ rnd, pal, cx, base }) {
    const L = rnd.range(300, 336);
    const c = rnd.pick(['#8a4a22', '#2f2530', '#5a2a22', '#b8863a']);
    const dark = shade(c, -0.5);
    // корпус: два «талии» — верхняя и нижняя доля
    const bw = L * 0.3;
    const bodyTop = base - L * 0.56;
    const bodyBot = base;
    const upB = bodyTop + (bodyBot - bodyTop) * 0.2;   // центр верхней доли
    const loB = bodyTop + (bodyBot - bodyTop) * 0.72;  // центр нижней доли
    const waist = bodyTop + (bodyBot - bodyTop) * 0.47;
    const lean = rnd.range(-9, 9);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(bw * 0.72)}" ry="14" fill="#000" opacity="0.55" filter="url(#soft)"/>`;
    s += `<g transform="rotate(${n(lean)} ${n(cx)} ${n(bodyBot)})">`;
    // гриф с накладкой и ладами
    const neckTop = base - L;
    s += `<path d="${poly([[cx - 11, bodyTop + 4], [cx + 11, bodyTop + 4], [cx + 8, neckTop], [cx - 8, neckTop]])}" fill="${dark}"/>`;
    s += `<path d="${poly([[cx - 7, bodyTop + 4], [cx - 1, bodyTop + 4], [cx - 1, neckTop], [cx - 5, neckTop]])}" fill="#fff" opacity="0.16"/>`;
    for (let i = 1; i <= 9; i++) {
      const t = i / 10;
      const fy = lerp(bodyTop + 6, neckTop + 6, t);
      const fw = lerp(9, 6, t);
      s += `<rect x="${n(cx - fw)}" y="${n(fy)}" width="${n(fw * 2)}" height="1.8" fill="#d8cdb4" opacity="0.55"/>`;
    }
    s += `<circle cx="${n(cx)}" cy="${n(lerp(bodyTop + 20, neckTop + 20, 0.6))}" r="3.4" fill="#d8cdb4" opacity="0.7"/>`;
    // головка с колками
    s += `<path d="${poly([[cx - 12, neckTop + 4], [cx + 12, neckTop + 4], [cx + 15, neckTop - 30], [cx - 15, neckTop - 30]])}" fill="${dark}"/>`;
    s += `<rect x="${n(cx - 15)}" y="${n(neckTop - 34)}" width="30" height="8" rx="3" fill="${shade(c, -0.34)}"/>`;
    for (let i = 0; i < 3; i++) {
      for (const sgn of [-1, 1]) {
        const py = neckTop - 26 + i * 12;
        s += `<line x1="${n(cx + sgn * 11)}" y1="${n(py)}" x2="${n(cx + sgn * 20)}" y2="${n(py)}" stroke="${brass(rnd, -0.1)}" stroke-width="3.4"/>`;
        s += `<circle cx="${n(cx + sgn * 22)}" cy="${n(py)}" r="4.6" fill="${brass(rnd, 0.16)}"/>`;
      }
    }
    // корпус: верхняя доля, талия, нижняя доля
    s += `<path d="M ${n(cx)} ${n(bodyTop)}
      C ${n(cx - bw * 0.46)} ${n(bodyTop)} ${n(cx - bw * 0.5)} ${n(upB)} ${n(cx - bw * 0.36)} ${n(upB)}
      C ${n(cx - bw * 0.26)} ${n(upB)} ${n(cx - bw * 0.24)} ${n(waist)} ${n(cx - bw * 0.3)} ${n(waist)}
      C ${n(cx - bw * 0.36)} ${n(waist)} ${n(cx - bw * 0.5)} ${n(loB)} ${n(cx - bw * 0.5)} ${n(loB)}
      C ${n(cx - bw * 0.5)} ${n(loB + 30)} ${n(cx - bw * 0.26)} ${n(bodyBot)} ${n(cx)} ${n(bodyBot)}
      C ${n(cx + bw * 0.26)} ${n(bodyBot)} ${n(cx + bw * 0.5)} ${n(loB + 30)} ${n(cx + bw * 0.5)} ${n(loB)}
      C ${n(cx + bw * 0.5)} ${n(loB)} ${n(cx + bw * 0.36)} ${n(waist)} ${n(cx + bw * 0.3)} ${n(waist)}
      C ${n(cx + bw * 0.24)} ${n(waist)} ${n(cx + bw * 0.26)} ${n(upB)} ${n(cx + bw * 0.36)} ${n(upB)}
      C ${n(cx + bw * 0.5)} ${n(upB)} ${n(cx + bw * 0.46)} ${n(bodyTop)} ${n(cx)} ${n(bodyTop)} Z" fill="${c}"/>`;
    // обечайка корпуса
    s += `<path d="M ${n(cx)} ${n(bodyTop)} C ${n(cx + bw * 0.46)} ${n(bodyTop)} ${n(cx + bw * 0.5)} ${n(upB)} ${n(cx + bw * 0.36)} ${n(upB)}
      M ${n(cx)} ${n(bodyTop)} C ${n(cx - bw * 0.46)} ${n(bodyTop)} ${n(cx - bw * 0.5)} ${n(upB)} ${n(cx - bw * 0.36)} ${n(upB)}"
      fill="none" stroke="#fff" stroke-width="3" opacity="0.18"/>`;
    // звуковое отверстие с розеткой
    s += `<circle cx="${n(cx)}" cy="${n(upB + 8)}" r="${n(bw * 0.2)}" fill="${shade(c, -0.2)}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(upB + 8)}" r="${n(bw * 0.24)}" fill="none" stroke="#e8dcc0" stroke-width="2" opacity="0.4"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(upB + 8)}" r="${n(bw * 0.13)}" fill="#0b0806"/>`;
    s += `<path d="M ${n(cx - bw * 0.34)} ${n(upB + 30)} a ${n(bw * 0.22)} ${n(bw * 0.22)} 0 0 0 ${n(bw * 0.44)} 0 l ${n(-bw * 0.44)} 0 Z" fill="#1a120b" opacity="0.55"/>`;
    // бридж
    s += `<path d="${poly([[cx - bw * 0.14, loB - 6], [cx + bw * 0.14, loB - 6], [cx + bw * 0.11, loB + 6], [cx - bw * 0.11, loB + 6]])}" fill="#2a1d10"/>`;
    // струны
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const gx = lerp(cx - 7, cx + 7, t);
      s += `<line x1="${n(gx)}" y1="${n(neckTop - 26)}" x2="${n(gx)}" y2="${n(loB + 5)}" stroke="#efe6cc" stroke-width="1.3" opacity="0.9"/>`;
    }
    s += `<path d="M ${n(cx - bw * 0.4)} ${n(loB + 4)} C ${n(cx - bw * 0.2)} ${n(loB + 26)} ${n(cx - bw * 0.14)} ${n(bodyBot - 6)} ${n(cx - bw * 0.1)} ${n(bodyBot - 2)}" stroke="#3a2a18" stroke-width="4" opacity="0.7" fill="none"/>`;
    s += sparkle(cx + bw * 0.34, upB - 6, 6, 0.4);
    s += `</g>`;
    return s + grime(cx, base - L * 0.3, bw * 1.2, L * 0.5, rnd, pal, 3);
  },

  // 63 ── Бинокль
  binoculars({ rnd, pal, cx, base }) {
    const R = rnd.range(34, 44);
    const h = R * 2.4;
    const y = base - h;
    const c = rnd.pick(['#2a2a2e', '#3f4a3a', '#4a3a2a']);
    const lean = rnd.range(-12, 12);
    return `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="56" ry="11" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(lean)} ${n(cx)} ${n(base)})">
      <rect x="${n(cx - R * 0.9)}" y="${n(y - 16)}" width="${n(R * 1.8)}" height="${n(R * 0.7)}" rx="6" fill="${brass(rnd, -0.1)}"/>
      <rect x="${n(cx - R * 1.5)}" y="${n(y)}" width="${n(R * 1.3)}" height="${n(h)}" rx="${n(R * 0.5)}" fill="${c}"/>
      <rect x="${n(cx + R * 0.2)}" y="${n(y)}" width="${n(R * 1.3)}" height="${n(h)}" rx="${n(R * 0.5)}" fill="${shade(c, -0.12)}"/>
      <rect x="${n(cx - R * 1.42)}" y="${n(y + 6)}" width="${n(R * 0.5)}" height="${n(h - 12)}" rx="10" fill="#fff" opacity="0.12"/>
      <ellipse cx="${n(cx - R * 0.85)}" cy="${n(y + h)}" rx="${n(R * 0.6)}" ry="${n(R * 0.2)}" fill="${shade(c, -0.3)}"/>
      <ellipse cx="${n(cx + R * 0.85)}" cy="${n(y + h)}" rx="${n(R * 0.6)}" ry="${n(R * 0.2)}" fill="${shade(c, -0.3)}"/>
      <ellipse cx="${n(cx - R * 0.85)}" cy="${n(y + h)}" rx="${n(R * 0.4)}" ry="${n(R * 0.13)}" fill="#0f1a1e"/>
      <ellipse cx="${n(cx + R * 0.85)}" cy="${n(y + h)}" rx="${n(R * 0.4)}" ry="${n(R * 0.13)}" fill="#0f1a1e"/>
      <circle cx="${n(cx - R * 0.4)}" cy="${n(y + h * 0.4)}" r="${n(R * 0.2)}" fill="${shade(c, 0.2)}"/>
      <circle cx="${n(cx + R * 0.4)}" cy="${n(y + h * 0.4)}" r="${n(R * 0.2)}" fill="${shade(c, 0.2)}"/>
      ${sparkle(cx - R * 1.2, y + h * 0.2, 7, 0.4)}
      </g>`;
  },

  // 64 ── Фотоаппарат
  camera({ rnd, pal, cx, base }) {
    const w = rnd.range(150, 176);
    const h = rnd.range(104, 120);
    const y = base - h;
    const c = '#241f1a';
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.56)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + 16)}" width="${n(w)}" height="${n(h - 16)}" rx="8" fill="${c}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 20)}" width="${n(w * 0.2)}" height="${n(h - 24)}" rx="6" fill="#fff" opacity="0.08"/>
      <rect x="${n(cx - w / 2 + 6)}" y="${n(y + 4)}" width="${n(w * 0.3)}" height="20" rx="4" fill="${shade(c, 0.14)}"/>
      <rect x="${n(cx + w * 0.1)}" y="${n(y + 6)}" width="${n(w * 0.2)}" height="18" rx="4" fill="${shade(c, 0.14)}"/>
      <circle cx="${n(cx)}" cy="${n(y + h * 0.56)}" r="${n(h * 0.36)}" fill="${shade(c, 0.2)}"/>
      <circle cx="${n(cx)}" cy="${n(y + h * 0.56)}" r="${n(h * 0.28)}" fill="#0d1420"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.56)}" r="${n(h * 0.28 - i * 5)}" fill="none" stroke="#2a4058" stroke-width="2" opacity="0.6"/>`;
    }
    s += `<ellipse cx="${n(cx - h * 0.1)}" cy="${n(y + h * 0.48)}" rx="${n(h * 0.09)}" ry="${n(h * 0.06)}" fill="#cfe4f0" opacity="0.6"/>`;
    s += `<rect x="${n(cx + w * 0.22)}" y="${n(y + h * 0.3)}" width="${n(w * 0.18)}" height="10" rx="3" fill="${brass(rnd)}"/>`;
    s += `<circle cx="${n(cx - w * 0.32)}" cy="${n(y + h * 0.28)}" r="7" fill="#c23b3b"/>`;
    s += sparkle(cx + h * 0.2, y + h * 0.44, 6, 0.45);
    return s;
  },

  // 65 ── Телескоп
  telescope({ rnd, pal, cx, base }) {
    const a = rnd.range(-42, -24); // наклон трубы влево-вверх
    const c = brass(rnd, -0.06);
    const dark = shade(c, -0.34);
    // точка шарнира
    const jx = cx + 30;
    const jy = base - 96;
    const L = rnd.range(206, 240); // длина трубы
    const R = 22; // радиус трубы
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="86" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    // тренога
    for (const d of [-1, 1]) {
      s += `<path d="M ${n(jx + d * 6)} ${n(jy + 6)} L ${n(cx + d * 72 + (d < 0 ? 8 : -8))} ${n(base - 2)}" stroke="${dark}" stroke-width="9" stroke-linecap="round"/>`;
      s += `<path d="M ${n(jx + d * 4)} ${n(jy + 24)} L ${n(cx + d * 46)} ${n(base - 46)}" stroke="${shade(dark, -0.16)}" stroke-width="5" stroke-linecap="round"/>`;
      s += `<rect x="${n(cx + d * 72 + (d < 0 ? 8 : -8) - 9)}" y="${n(base - 8)}" width="18" height="9" rx="3" fill="#241f1a"/>`;
    }
    s += `<path d="M ${n(cx - 52)} ${n(base - 56)} L ${n(cx + 50)} ${n(base - 56)}" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`;
    // площадка крепления
    s += `<path d="${poly([[jx - 26, jy + 12], [jx + 26, jy + 12], [jx + 18, jy - 6], [jx - 18, jy - 6]])}" fill="${shade(c, -0.24)}"/>`;
    s += `<rect x="${n(jx - 20)}" y="${n(jy - 12)}" width="40" height="12" rx="4" fill="${shade(c, 0.1)}"/>`;
    // труба
    s += `<g transform="rotate(${n(a)} ${n(jx)} ${n(jy - 4)})">`;
    // объектив (левый, дальний конец)
    s += `<rect x="${n(jx - L * 0.06)}" y="${n(jy - 4 - L)}" width="${n(R * 1.5)}" height="${n(L)}" rx="${n(R * 0.4)}" fill="${c}"/>`;
    s += `<rect x="${n(jx - L * 0.06 + 5)}" y="${n(jy - 4 - L + 6)}" width="8" height="${n(L - 12)}" fill="#fff" opacity="0.2"/>`;
    // обойма объектива
    s += `<rect x="${n(jx - L * 0.06 - 6)}" y="${n(jy - 4 - L - 6)}" width="${n(R * 1.5 + 12)}" height="20" rx="5" fill="${shade(c, 0.2)}"/>`;
    s += `<ellipse cx="${n(jx - L * 0.06 + R * 0.75)}" cy="${n(jy - 4 - L + 4)}" rx="6" ry="9" fill="#0e1a2a"/>`;
    s += `<ellipse cx="${n(jx - L * 0.06 + R * 0.75)}" cy="${n(jy - 4 - L + 4)}" rx="3" ry="5" fill="#5fa8d8" opacity="0.7"/>`;
    // кольца-крепления трубы
    for (const t of [0.32, 0.72]) {
      s += `<rect x="${n(jx - L * 0.06 - 3)}" y="${n(jy - 4 - L * t)}" width="${n(R * 1.5 + 6)}" height="11" rx="3" fill="${dark}"/>`;
    }
    // окуляр
    s += `<path d="M ${n(jx + R * 1.3)} ${n(jy - 20)} L ${n(jx + R * 1.3)} ${n(jy + 12)} l ${n(26)} ${n(10)} l 0 -22 Z" fill="${dark}"/>`;
    s += `<rect x="${n(jx + R * 1.3 + 24)}" y="${n(jy - 14)}" width="14" height="20" rx="4" fill="#1a1a1e"/>`;
    s += `</g>`;
    s += sparkle(jx - 40, jy - L * 0.8, 6, 0.4);
    s += sparkle(jx + 34, jy - 30, 5, 0.3);
    return s;
  },

  // 66 ── Коллекционная фигурка
  figure({ rnd, pal, cx, base }) {
    const h = rnd.range(170, 206);
    const c = rnd.pick(['#2f6a8a', '#8a2f4a', '#3f7a4a', '#6a4a8a']);
    const y = base - h;
    return `${rim(cx, base - h * 0.5, 180, h, 0.22)}
      <ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="44" ry="11" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 12)}" rx="38" ry="11" fill="#1c1812"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 16)}" rx="38" ry="10" fill="${c}"/>
      <path d="M ${n(cx - 22)} ${n(base - 16)} L ${n(cx - 18)} ${n(y + h * 0.34)} L ${n(cx + 18)} ${n(y + h * 0.34)} L ${n(cx + 22)} ${n(base - 16)} Z" fill="${c}"/>
      <rect x="${n(cx - 24)}" y="${n(y + h * 0.32)}" width="48" height="10" rx="3" fill="${shade(c, -0.3)}"/>
      <circle cx="${n(cx)}" cy="${n(y + h * 0.2)}" r="21" fill="${shade(c, 0.14)}"/>
      <ellipse cx="${n(cx - 7)}" cy="${n(y + h * 0.16)}" rx="7" ry="9" fill="#fff" opacity="0.18"/>
      <circle cx="${n(cx - 7)}" cy="${n(y + h * 0.2)}" r="2.6" fill="#12100d"/>
      <circle cx="${n(cx + 7)}" cy="${n(y + h * 0.2)}" r="2.6" fill="#12100d"/>
      <path d="M ${n(cx - 6)} ${n(y + h * 0.28)} q 6 4 12 0" stroke="#12100d" stroke-width="2" fill="none"/>
      <path d="M ${n(cx - 30)} ${n(y + h * 0.36)} q ${n(-16)} ${n(h * 0.1)} ${n(-8)} ${n(h * 0.3)}" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M ${n(cx + 30)} ${n(y + h * 0.36)} q ${n(14)} ${n(h * 0.1)} ${n(6)} ${n(h * 0.28)}" stroke="${shade(c, 0.12)}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  },

  // 67 ── Серебряный сервиз
  silverware({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 224);
    const c = silver(rnd);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(base - 10)}" rx="${n(w * 0.5)}" ry="15" fill="${shade(c, -0.24)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(base - 14)}" rx="${n(w * 0.5)}" ry="15" fill="${c}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(base - 16)}" rx="${n(w * 0.42)}" ry="10" fill="#2c3038" opacity="0.35"/>`;
    // чайник
    s += `<path d="M ${n(cx - w * 0.3)} ${n(base - 18)} q ${n(-4)} ${n(-46)} ${n(38)} ${n(-46)} q ${n(42)} 0 ${n(38)} ${n(46)} Z" fill="${shade(c, 0.08)}"/>`;
    s += `<path d="M ${n(cx - w * 0.26)} ${n(base - 20)} q ${n(-4)} ${n(-42)} ${n(30)} ${n(-44)} l ${n(-8)} 0 q ${n(-24)} ${n(6)} ${n(-16)} ${n(44)} Z" fill="#fff" opacity="0.2"/>`;
    s += `<path d="M ${n(cx - w * 0.3)} ${n(base - 34)} q ${n(-26)} ${n(-4)} ${n(-22)} ${n(20)}" stroke="${shade(c, -0.14)}" stroke-width="7" fill="none"/>`;
    s += `<path d="M ${n(cx - w * 0.3 + 38)} ${n(base - 32)} q ${n(30)} ${n(2)} ${n(26)} ${n(-22)} l ${n(10)} 0 q ${n(2)} ${n(30)} ${n(-34)} ${n(28)} Z" fill="${shade(c, -0.08)}"/>`;
    s += `<ellipse cx="${n(cx - w * 0.24)}" cy="${n(base - 66)}" rx="9" ry="6" fill="${shade(c, 0.2)}"/>`;
    s += `<ellipse cx="${n(cx - w * 0.2)}" cy="${n(base - 46)}" rx="7" ry="9" fill="#fff" opacity="0.3"/>`;
    // чашки
    for (const dx of [0.02, 0.24]) {
      const x = cx + w * dx;
      s += `<path d="M ${n(x - 20)} ${n(base - 30)} q 0 24 20 24 q 20 0 20 -24 Z" fill="${shade(c, 0.04)}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 30)}" rx="20" ry="6" fill="${shade(c, 0.22)}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 30)}" rx="15" ry="4" fill="#3a2a18"/>`;
      s += `<path d="M ${n(x + 19)} ${n(base - 26)} q 12 2 10 -10" stroke="${shade(c, -0.1)}" stroke-width="4" fill="none"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 6)}" rx="16" ry="4" fill="${shade(c, -0.1)}"/>`;
    }
    return s + sparkle(cx - w * 0.26, base - 50, 7, 0.5);
  },

  // 68 ── Старинная монета
  coin({ rnd, pal, cx, base }) {
    const R = rnd.range(60, 76);
    const c = brass(rnd, 0.05);
    let s = `${rim(cx, base - R, 200, R * 2, 0.3)}
      <ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="56" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - 40)} ${n(base)} L ${n(cx - 30)} ${n(base - 26)} L ${n(cx + 30)} ${n(base - 26)} L ${n(cx + 40)} ${n(base)} Z" fill="#1c1610"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(base - R * 0.7)}" r="${n(R * 0.5)}" fill="#2a2018"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(base - R * 0.7)}" r="${n(R * 0.5)}" fill="none" stroke="${brass(rnd, -0.2)}" stroke-width="3"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(base - R * 1.05)}" r="${n(R * 0.72)}" fill="${c}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(base - R * 1.05)}" r="${n(R * 0.62)}" fill="none" stroke="${shade(c, -0.28)}" stroke-width="3" opacity="0.7"/>`;
    for (let i = 0; i < 40; i++) {
      const a = i * 9;
      const [x1, y1] = polar(cx, base - R * 1.05, R * 0.7, a);
      const [x2, y2] = polar(cx, base - R * 1.05, R * 0.76, a);
      s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${shade(c, -0.3)}" stroke-width="1.4" opacity="0.6"/>`;
    }
    // портрет императора
    s += `<path d="M ${n(cx - 20)} ${n(base - R * 0.68)} q ${n(4)} ${n(-20)} ${n(20)} ${n(-22)} q ${n(16)} 2 ${n(20)} ${n(22)} Z" fill="${shade(c, -0.22)}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(base - R * 1.28)}" rx="13" ry="16" fill="${shade(c, -0.18)}"/>`;
    s += `<path d="M ${n(cx - 13)} ${n(base - R * 1.34)} q 13 -12 26 0 l 0 -4 q -13 -10 -26 0 Z" fill="${shade(c, -0.35)}"/>`;
    s += `<ellipse cx="${n(cx - R * 0.3)}" cy="${n(base - R * 1.2)}" rx="${n(R * 0.24)}" ry="${n(R * 0.16)}" fill="#fff" opacity="0.22"/>`;
    s += sparkle(cx + R * 0.34, base - R * 1.3, 9, 0.6);
    return s;
  },

  // 69 ── Ламповый радиоприёмник
  radioreceiver({ rnd, pal, cx, base }) {
    const w = rnd.range(200, 236);
    const h = rnd.range(130, 152);
    const y = base - h;
    const c = wood(rnd, 0.02);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="12" fill="${c}"/>`;
    s += `<rect x="${n(cx - w / 2 + 4)}" y="${n(y + 4)}" width="${n(w * 0.18)}" height="${n(h - 8)}" rx="9" fill="#fff" opacity="0.1"/>`;
    s += `<rect x="${n(cx - w * 0.36)}" y="${n(y + 14)}" width="${n(w * 0.36)}" height="${n(h * 0.62)}" rx="6" fill="#2a1a10"/>`;
    s += `<rect x="${n(cx - w * 0.36 + 6)}" y="${n(y + 20)}" width="${n(w * 0.36 - 12)}" height="${n(h * 0.5)}" rx="4" fill="#6a3a1a" opacity="0.55"/>`;
    for (let i = 0; i < 4; i++) {
      s += `<line x1="${n(cx - w * 0.34)}" y1="${n(y + 26 + i * (h * 0.11))}" x2="${n(cx - w * 0.02)}" y2="${n(y + 26 + i * (h * 0.11))}"
        stroke="#d9c99e" stroke-width="2" opacity="0.5"/>`;
    }
    // шкала
    s += `<rect x="${n(cx + w * 0.06)}" y="${n(y + 14)}" width="${n(w * 0.36)}" height="${n(h * 0.22)}" rx="4" fill="#e8dcae"/>`;
    for (let i = 0; i < 10; i++) {
      s += `<line x1="${n(cx + w * 0.08 + i * (w * 0.032))}" y1="${n(y + 18)}" x2="${n(cx + w * 0.08 + i * (w * 0.032))}" y2="${n(y + 26)}" stroke="#4a3a20" stroke-width="1.4"/>`;
    }
    s += `<line x1="${n(cx + w * 0.2)}" y1="${n(y + 16)}" x2="${n(cx + w * 0.24)}" y2="${n(y + 34)}" stroke="#c23b2a" stroke-width="2"/>`;
    // ручки
    s += `<circle cx="${n(cx + w * 0.12)}" cy="${n(y + h * 0.62)}" r="15" fill="${shade(c, -0.3)}"/>`;
    s += `<circle cx="${n(cx + w * 0.12)}" cy="${n(y + h * 0.62)}" r="6" fill="#c9bda6"/>`;
    s += `<circle cx="${n(cx + w * 0.3)}" cy="${n(y + h * 0.62)}" r="15" fill="${shade(c, -0.3)}"/>`;
    s += `<circle cx="${n(cx + w * 0.3)}" cy="${n(y + h * 0.62)}" r="6" fill="#c9bda6"/>`;
    s += `<rect x="${n(cx - w * 0.3)}" y="${n(y + h * 0.8)}" width="${n(w * 0.6)}" height="4" fill="#000" opacity="0.3"/>`;
    s += `${folds(cx, y + h * 0.5, w * 0.5, h, rnd, shade(c, -0.3), 0.18, 3)}`;
    return s;
  },

  // 70 ── Печатная машинка
  typewriter({ rnd, pal, cx, base }) {
    const w = rnd.range(170, 194);
    const h = rnd.range(96, 112);
    const y = base - h;
    const c = '#22201e';
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.56)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + h * 0.6)}" width="${n(w)}" height="${n(h * 0.42)}" rx="5" fill="${shade(c, 0.16)}"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + h * 0.6)}" width="${n(w * 0.2)}" height="${n(h * 0.4)}" fill="#fff" opacity="0.1"/>`;
    s += `<rect x="${n(cx - w * 0.4)}" y="${n(y + h * 0.3)}" width="${n(w * 0.8)}" height="${n(h * 0.34)}" rx="4" fill="${shade(c, 0.08)}"/>`;
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 9; i++) {
        s += `<circle cx="${n(cx - w * 0.34 + i * (w * 0.084))}" cy="${n(y + h * 0.36 + r * (h * 0.09))}" r="${n(6 - r * 0.6)}" fill="#e8e0cc"/>`;
        s += `<circle cx="${n(cx - w * 0.34 + i * (w * 0.084))}" cy="${n(y + h * 0.36 + r * (h * 0.09))}" r="${n(6 - r * 0.6)}" fill="none" stroke="#000" stroke-width="1" opacity="0.5"/>`;
      }
    }
    s += `<rect x="${n(cx - w * 0.34)}" y="${n(y + 6)}" width="${n(w * 0.68)}" height="7" fill="#3a3630"/>`;
    s += `<rect x="${n(cx - w * 0.42)}" y="${n(y + 2)}" width="${n(w * 0.84)}" height="10" rx="4" fill="${shade(c, -0.1)}"/>`;
    s += `<path d="M ${n(cx + w * 0.24)} ${n(y + 2)} l ${n(14)} ${n(-30)} l 14 0 l ${n(-14)} ${n(30)} Z" fill="${shade(c, 0.06)}"/>`;
    s += `<rect x="${n(cx - w * 0.3)}" y="${n(y + h * 0.72)}" width="${n(w * 0.6)}" height="9" rx="2" fill="#e8e0cc"/>`;
    s += `<rect x="${n(cx - w * 0.3)}" y="${n(y + h * 0.88)}" width="${n(w * 0.6)}" height="5" fill="#3a3630"/>`;
    s += sparkle(cx - w * 0.3, y + h * 0.7, 6, 0.3);
    return s;
  },

  // 71 ── Микроскоп
  microscope({ rnd, pal, cx, base }) {
    const c = brass(rnd, -0.1);
    const h = rnd.range(230, 262);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="56" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - 46)} ${n(base)} q ${n(10)} ${n(-h * 0.42)} ${n(52)} ${n(-h * 0.5)} l ${n(4)} ${n(14)}
        q ${n(-36)} ${n(8)} ${n(-44)} ${n(h * 0.5)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(cx + 16)} ${n(y + h * 0.1)} q ${n(10)} ${n(-h * 0.1)} ${n(-4)} ${n(-h * 0.12)}" fill="none" stroke="${c}" stroke-width="17" stroke-linecap="round"/>`;
    s += `<rect x="${n(cx - 30)}" y="${n(y + h * 0.1)}" width="26" height="46" rx="4" fill="${shade(c, -0.1)}"/>`;
    s += `<rect x="${n(cx - 26)}" y="${n(y + h * 0.14)}" width="18" height="12" fill="${shade(c, 0.25)}"/>`;
    s += `<rect x="${n(cx - 46)}" y="${n(y + h * 0.08)}" width="58" height="9" rx="3" fill="${shade(c, 0.16)}"/>`;
    s += `<circle cx="${n(cx + 12)}" cy="${n(y + h * 0.1)}" r="11" fill="${shade(c, 0.2)}"/>`;
    s += `<circle cx="${n(cx + 12)}" cy="${n(y + h * 0.1)}" r="4" fill="#2a1c0c"/>`;
    s += `<path d="M ${n(cx - 30)} ${n(y + h * 0.2)} l ${n(-26)} ${n(4)}" stroke="${shade(c, -0.15)}" stroke-width="6"/>`;
    s += `<rect x="${n(cx - 40)}" y="${n(base - 12)}" width="80" height="12" rx="3" fill="${shade(c, -0.2)}"/>`;
    s += `<ellipse cx="${n(cx - 10)}" cy="${n(base - 16)}" rx="20" ry="6" fill="#0d1520" opacity="0.8"/>`;
    s += sparkle(cx + 12, y + h * 0.1, 6, 0.45);
    return s;
  },

  // 72 ── Аккордеон
  accordion({ rnd, pal, cx, base }) {
    const w = rnd.range(210, 246);
    const h = rnd.range(146, 172);
    const y = base - h;
    const c = rnd.pick(['#7a2a2a', '#2a4a7a', '#3a3a3a']);
    const lean = rnd.range(-6, 6);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.54)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(lean)} ${n(cx)} ${n(base)})">
      <rect x="${n(cx - w / 2)}" y="${n(y + 10)}" width="${n(w * 0.3)}" height="${n(h - 20)}" rx="7" fill="${shade(c, 0.14)}"/>`;
    for (let i = 0; i < 9; i++) {
      const bx = cx - w * 0.2 + i * (w * 0.083);
      s += `<rect x="${n(bx)}" y="${n(y + 12)}" width="${n(w * 0.062)}" height="${n(h - 24)}" fill="#e8e0cc"/>`;
      s += `<rect x="${n(bx)}" y="${n(y + 12)}" width="${n(w * 0.062)}" height="${n(h - 24)}" fill="#000" opacity="0.12"/>`;
    }
    s += `<rect x="${n(cx + w * 0.2)}" y="${n(y + 10)}" width="${n(w * 0.3)}" height="${n(h - 20)}" rx="7" fill="${c}"/>`;
    s += `<rect x="${n(cx - w * 0.48)}" y="${n(y + 10)}" width="${n(w * 0.2)}" height="${n(h - 20)}" rx="7" fill="#fff" opacity="0.1"/>`;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        s += `<circle cx="${n(cx + w * 0.24 + i * (w * 0.07))}" cy="${n(y + 26 + j * (h * 0.16))}" r="6" fill="#e8e0cc"/>`;
        s += `<circle cx="${n(cx + w * 0.24 + i * (w * 0.07))}" cy="${n(y + 26 + j * (h * 0.16))}" r="6" fill="none" stroke="#000" stroke-width="1" opacity="0.5"/>`;
      }
    }
    s += `<rect x="${n(cx - w * 0.54)}" y="${n(y + 6)}" width="${n(w * 0.12)}" height="${n(h - 12)}" rx="6" fill="${shade(c, -0.2)}"/>`;
    s += `<rect x="${n(cx + w * 0.42)}" y="${n(y + 6)}" width="${n(w * 0.12)}" height="${n(h - 12)}" rx="6" fill="${shade(c, -0.2)}"/>`;
    s += `<path d="M ${n(cx - w * 0.5)} ${n(y)} q ${n(w * 0.5)} ${n(-h * 0.2)} ${n(w)} 0" fill="none" stroke="#3a3228" stroke-width="8"/>`;
    s += `</g>`;
    return s + sparkle(cx, y - h * 0.1, 7, 0.3);
  },

  // 73 ── Скрипка
  violin({ rnd, pal, cx, base }) {
    const c = rnd.pick(['#8a3a1a', '#5a2a1a', '#a0522a', '#6a3018']);
    const L = rnd.range(232, 258);
    const bw = L * 0.27; // половина ширины корпуса
    const bodyTop = base - L * 0.46;
    const bodyBot = base - 4;
    const upB = bodyTop + (bodyBot - bodyTop) * 0.24; // плечи
    const waist = bodyTop + (bodyBot - bodyTop) * 0.5; // талия
    const loB = bodyTop + (bodyBot - bodyTop) * 0.76; // нижняя доля
    const lean = rnd.range(-14, -6);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(bw * 1.5)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    s += `<g transform="rotate(${n(lean)} ${n(cx)} ${n(bodyBot)})">`;
    // гриф, накладка, шейка
    const neckTop = base - L;
    s += `<path d="${poly([[cx - 8, bodyTop + 6], [cx + 8, bodyTop + 6], [cx + 6, neckTop + 12], [cx - 6, neckTop + 12]])}" fill="${shade(c, -0.36)}"/>`;
    s += `<path d="${poly([[cx - 7, bodyTop + 6], [cx - 2, bodyTop + 6], [cx - 2, neckTop + 12], [cx - 5, neckTop + 12]])}" fill="#fff" opacity="0.18"/>`;
    // гриф (тёмная накладка поверх)
    s += `<path d="${poly([[cx - 9, upB + 6], [cx + 9, upB + 6], [cx + 6, neckTop + 14], [cx - 6, neckTop + 14]])}" fill="#1c110a"/>`;
    for (let i = 1; i <= 6; i++) {
      const fy = lerp(upB + 10, neckTop + 16, i / 7);
      s += `<rect x="${n(cx - 7)}" y="${n(fy)}" width="14" height="1.6" fill="#cbbb96" opacity="0.5"/>`;
    }
    // головка со scroll-улиткой и колками
    s += `<rect x="${n(cx - 9)}" y="${n(neckTop + 2)}" width="18" height="16" rx="3" fill="${shade(c, -0.4)}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(neckTop - 4)}" r="9" fill="${shade(c, -0.14)}"/>`;
    s += `<path d="M ${n(cx - 6)} ${n(neckTop - 4)} a 6 6 0 1 1 6 6" fill="none" stroke="#f0e2c4" stroke-width="2.4" opacity="0.55" stroke-linecap="round"/>`;
    for (let i = 0; i < 2; i++) {
      for (const g of [-1, 1]) {
        const py = neckTop + 4 + i * 8;
        s += `<line x1="${n(cx + g * 8)}" y1="${n(py)}" x2="${n(cx + g * 17)}" y2="${n(py)}" stroke="#4a3a2a" stroke-width="2.6"/>`;
        s += `<ellipse cx="${n(cx + g * 19)}" cy="${n(py)}" rx="4.2" ry="3.4" fill="#2c2118"/>`;
      }
    }
    // корпус: плечи, талия, нижняя доля
    s += `<path d="M ${n(cx)} ${n(bodyTop)}
      C ${n(cx + bw * 0.5)} ${n(bodyTop)} ${n(cx + bw * 0.62)} ${n(upB - 10)} ${n(cx + bw * 0.4)} ${n(upB)}
      C ${n(cx + bw * 0.2)} ${n(upB + 8)} ${n(cx + bw * 0.2)} ${n(waist - 8)} ${n(cx + bw * 0.28)} ${n(waist)}
      C ${n(cx + bw * 0.34)} ${n(waist + 8)} ${n(cx + bw * 0.62)} ${n(loB - 8)} ${n(cx + bw * 0.62)} ${n(loB)}
      C ${n(cx + bw * 0.62)} ${n(bodyBot - 12)} ${n(cx + bw * 0.3)} ${n(bodyBot)} ${n(cx)} ${n(bodyBot)}
      C ${n(cx - bw * 0.3)} ${n(bodyBot)} ${n(cx - bw * 0.62)} ${n(bodyBot - 12)} ${n(cx - bw * 0.62)} ${n(loB)}
      C ${n(cx - bw * 0.62)} ${n(loB - 8)} ${n(cx - bw * 0.34)} ${n(waist + 8)} ${n(cx - bw * 0.28)} ${n(waist)}
      C ${n(cx - bw * 0.2)} ${n(waist - 8)} ${n(cx - bw * 0.2)} ${n(upB + 8)} ${n(cx - bw * 0.4)} ${n(upB)}
      C ${n(cx - bw * 0.62)} ${n(upB - 10)} ${n(cx - bw * 0.5)} ${n(bodyTop)} ${n(cx)} ${n(bodyTop)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(cx - bw * 0.56)} ${n(loB + 6)} C ${n(cx - bw * 0.3)} ${n(bodyBot - 4)} ${n(cx - bw * 0.16)} ${n(bodyBot)} ${n(cx - bw * 0.1)} ${n(bodyBot)} l 0 -4 C ${n(cx - bw * 0.34)} ${n(loB + 4)} ${n(cx - bw * 0.44)} ${n(loB + 2)} ${n(cx - bw * 0.56)} ${n(loB + 6)} Z" fill="#fff" opacity="0.16"/>`;
    // f-образные отверстия
    for (const g of [-1, 1]) {
      const fx = cx + g * bw * 0.34;
      const fy = waist + 6;
      s += `<path d="M ${n(fx + g * 2)} ${n(fy - 22)} C ${n(fx - g * 5)} ${n(fy - 10)} ${n(fx + g * 6)} ${n(fy - 2)} ${n(fx - g * 3)} ${n(fy + 8)}
        C ${n(fx - g * 7)} ${n(fy + 14)} ${n(fx + g * 2)} ${n(fy + 20)} ${n(fx - g * 1)} ${n(fy + 26)}"
        fill="none" stroke="#1a0e06" stroke-width="3.4" stroke-linecap="round"/>`;
      s += `<circle cx="${n(fx + g * 2)}" cy="${n(fy - 25)}" r="2.6" fill="#1a0e06"/>`;
      s += `<circle cx="${n(fx - g * 1)}" cy="${n(fy + 29)}" r="2.6" fill="#1a0e06"/>`;
    }
    // подставка, пуговица, струны
    s += `<path d="${poly([[cx - 13, loB - 12], [cx + 13, loB - 12], [cx + 10, loB - 2], [cx - 10, loB - 2]])}" fill="#e2cfa2"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(bodyBot - 8)}" r="5" fill="#c9b184"/>`;
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      s += `<line x1="${n(lerp(cx - 5, cx + 5, t))}" y1="${n(neckTop + 4)}" x2="${n(lerp(cx - 4, cx + 4, t))}" y2="${n(bodyBot - 10)}" stroke="#f2ead2" stroke-width="1.2" opacity="0.85"/>`;
    }
    // подбородок
    s += `<ellipse cx="${n(cx - bw * 0.56)}" cy="${n(loB - 2)}" rx="13" ry="8" transform="rotate(-14 ${n(cx - bw * 0.56)} ${n(loB - 2)})" fill="#22150d"/>`;
    s += sparkle(cx + bw * 0.5, upB - 8, 6, 0.35);
    s += `</g>`;
    return s + grime(cx, base - L * 0.28, bw * 2, L * 0.5, rnd, pal, 3);
  },

  // 74 ── Антикварные часы
  antiqueclock({ rnd, pal, cx, base }) {
    const w = rnd.range(126, 152);
    const h = rnd.range(196, 230);
    const y = base - h;
    const c = wood(rnd, 0.05);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="58" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - w * 0.36)} ${n(base)} L ${n(cx - w * 0.28)} ${n(base - 26)} L ${n(cx + w * 0.28)} ${n(base - 26)} L ${n(cx + w * 0.36)} ${n(base)} Z" fill="${shade(c, -0.2)}"/>
      <rect x="${n(cx - w * 0.44)}" y="${n(y + h * 0.4)}" width="${n(w * 0.88)}" height="${n(h * 0.56)}" fill="${c}"/>
      <path d="M ${n(cx - w * 0.44)} ${n(y + h * 0.4)} L ${n(cx + w * 0.44)} ${n(y + h * 0.4)} L ${n(cx)} ${n(y)} Z" fill="${shade(c, 0.1)}"/>
      <path d="M ${n(cx - w * 0.44)} ${n(y + h * 0.4)} L ${n(cx + w * 0.44)} ${n(y + h * 0.4)} L ${n(cx)} ${n(y)} Z" fill="#000" opacity="0.2"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.24)}" r="${n(w * 0.26)}" fill="#e8e0cc"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.24)}" r="${n(w * 0.26)}" fill="url(#backglow)" opacity="0.6"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.24)}" r="${n(w * 0.28)}" fill="none" stroke="${brass(rnd)}" stroke-width="6"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (360 / 12) * i;
      const [x1, y1] = polar(cx, y + h * 0.24, w * 0.2, a);
      const [x2, y2] = polar(cx, y + h * 0.24, w * (i % 3 === 0 ? 0.14 : 0.17), a);
      s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="#2a231a" stroke-width="${i % 3 === 0 ? 3 : 2}"/>`;
    }
    s += `<line x1="${n(cx)}" y1="${n(y + h * 0.24)}" x2="${n(cx + w * 0.1)}" y2="${n(y + h * 0.2)}" stroke="#1a1610" stroke-width="3.4" stroke-linecap="round"/>`;
    s += `<line x1="${n(cx)}" y1="${n(y + h * 0.24)}" x2="${n(cx - w * 0.04)}" y2="${n(y + h * 0.08)}" stroke="#1a1610" stroke-width="3" stroke-linecap="round"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.24)}" r="4" fill="#1a1610"/>`;
    s += `<ellipse cx="${n(cx - w * 0.08)}" cy="${n(y + h * 0.18)}" rx="${n(w * 0.08)}" ry="${n(w * 0.05)}" fill="#fff" opacity="0.2"/>`;
    s += `<rect x="${n(cx - w * 0.2)}" y="${n(y + h * 0.56)}" width="${n(w * 0.4)}" height="${n(h * 0.14)}" rx="3" fill="${shade(c, -0.3)}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.63)}" r="7" fill="${brass(rnd)}"/>`;
    s += sparkle(cx + w * 0.1, y + h * 0.14, 7, 0.4);
    return s;
  },

  // 75 ── Каменная статуэтка
  stonefigure({ rnd, pal, cx, base }) {
    const h = rnd.range(210, 250);
    const c = shade('#a89a86', rnd.range(-0.08, 0.08));
    const y = base - h;
    let s = `${rim(cx, base - h * 0.5, 200, h, 0.24)}
      <ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="46" ry="11" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - 40)}" y="${n(base - 26)}" width="80" height="26" rx="3" fill="${shade(c, -0.24)}"/>
      <rect x="${n(cx - 34)}" y="${n(base - 48)}" width="68" height="22" rx="3" fill="${shade(c, -0.12)}"/>
      <path d="M ${n(cx - 24)} ${n(base - 48)} C ${n(cx - 34)} ${n(y + h * 0.42)} ${n(cx - 18)} ${n(y + h * 0.16)} ${n(cx - 16)} ${n(y + h * 0.18)}
        L ${n(cx + 16)} ${n(y + h * 0.18)} C ${n(cx + 18)} ${n(y + h * 0.16)} ${n(cx + 34)} ${n(y + h * 0.42)} ${n(cx + 24)} ${n(base - 48)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(cx - 18)} ${n(y + h * 0.26)} q ${n(-26)} ${n(h * 0.12)} ${n(-22)} ${n(h * 0.32)}" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx + 18)} ${n(y + h * 0.26)} q ${n(20)} ${n(h * 0.1)} ${n(10)} ${n(h * 0.26)}" stroke="${shade(c, 0.1)}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx + 26)} ${n(y + h * 0.52)} l ${n(12)} ${n(h * 0.06)}" stroke="${shade(c, -0.2)}" stroke-width="9" stroke-linecap="round"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y + h * 0.1)}" rx="19" ry="23" fill="${c}"/>`;
    s += `<ellipse cx="${n(cx - 7)}" cy="${n(y + h * 0.07)}" rx="7" ry="10" fill="#fff" opacity="0.14"/>`;
    s += `<path d="M ${n(cx - 9)} ${n(y + h * 0.1)} q 9 5 18 0" stroke="${shade(c, -0.35)}" stroke-width="2.4" fill="none"/>`;
    s += `<path d="M ${n(cx - 12)} ${n(y + h * 0.02)} q 12 -6 24 0" stroke="${shade(c, -0.3)}" stroke-width="2" fill="none" opacity="0.7"/>`;
    s += `<path d="M ${n(cx - 26)} ${n(base - 34)} q ${n(14)} ${n(h * 0.08)} ${n(28)} ${n(-2)}" stroke="${shade(c, -0.2)}" stroke-width="2.6" fill="none"/>`;
    s += `${grime(cx, base - h * 0.5, 80, h, rnd, pal, 3)}`;
    s += sparkle(cx + 20, y + h * 0.3, 6, 0.3);
    return s;
  },

  // 76 ── Массовая двустволка
  shotgun({ rnd, pal, cx, base }) {
    const L = rnd.range(280, 320);
    const c = wood(rnd, -0.06);
    const a = rnd.range(-10, 10);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="120" ry="12" fill="#000" opacity="0.45" filter="url(#soft)"/>
      <g transform="rotate(${n(a)} ${n(cx)} ${n(base - 20)})">
      <rect x="${n(cx - L * 0.42)}" y="${n(base - 30)}" width="${n(L * 0.34)}" height="30" rx="9" fill="${c}"/>
      <path d="M ${n(cx - L * 0.42)} ${n(base - 18)} q ${n(L * 0.08)} ${n(-10)} ${n(L * 0.16)} 0 l 0 -14 q ${n(-L * 0.08)} ${n(-8)} ${n(-L * 0.16)} 0 Z" fill="${shade(c, 0.14)}"/>
      <path d="M ${n(cx - L * 0.08)} ${n(base - 30)} q ${n(L * 0.06)} ${n(-20)} ${n(-L * 0.04)} ${n(-24)} l ${n(L * 0.06)} ${n(4)} Z" fill="${shade(c, -0.1)}"/>`;
    s += `<rect x="${n(cx - L * 0.1)}" y="${n(base - 24)}" width="${n(L * 0.6)}" height="9" rx="4" fill="${steel(rnd, -0.2)}"/>`;
    s += `<rect x="${n(cx - L * 0.1)}" y="${n(base - 14)}" width="${n(L * 0.6)}" height="9" rx="4" fill="${steel(rnd, -0.2)}"/>`;
    s += `<rect x="${n(cx - L * 0.1)}" y="${n(base - 25)}" width="${n(L * 0.6)}" height="2.5" fill="#fff" opacity="0.16"/>`;
    s += `<rect x="${n(cx - L * 0.13)}" y="${n(base - 28)}" width="16" height="18" rx="3" fill="#2a2622"/>`;
    s += `<path d="M ${n(cx - L * 0.1)} ${n(base - 12)} q ${n(L * 0.06)} ${n(4)} ${n(L * 0.02)} ${n(12)}" stroke="${shade(c, -0.2)}" stroke-width="7" fill="none"/>`;
    s += `<circle cx="${n(cx - L * 0.06)}" cy="${n(base - 20)}" r="4" fill="${brass(rnd)}"/>`;
    s += `</g>`;
    return s;
  },

  // 77 ── Счётная машина
  addingmachine({ rnd, pal, cx, base }) {
    const w = rnd.range(178, 202);
    const h = rnd.range(198, 224);
    const y = base - h;
    const c = rnd.pick(['#2f3a34', '#3a3128', '#33323a', '#2c3a42']);
    const keyR = w * 0.055;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.6)}" ry="13" fill="#000" opacity="0.55" filter="url(#soft)"/>`;
    // корпус со скошенной крышкой
    s += `<path d="${poly([[cx - w / 2, base], [cx - w / 2, y + 26], [cx - w * 0.36, y + 6], [cx + w * 0.36, y + 6], [cx + w / 2, y + 30], [cx + w / 2, base]])}" fill="${c}"/>`;
    s += `<path d="${poly([[cx - w / 2, y + 26], [cx - w * 0.36, y + 6], [cx + w * 0.36, y + 6], [cx + w / 2, y + 30], [cx + w * 0.3, y + 40], [cx - w * 0.3, y + 40]])}" fill="${shade(c, 0.18)}"/>`;
    s += `<path d="${poly([[cx - w * 0.3, y + 40], [cx + w * 0.3, y + 40], [cx + w * 0.3, y + 46], [cx - w * 0.3, y + 46]])}" fill="${shade(c, -0.3)}"/>`;
    s += `<rect x="${n(cx - w * 0.46)}" y="${n(y + 44)}" width="${n(w * 0.1)}" height="${n(h - 48)}" fill="#fff" opacity="0.1"/>`;
    // рулон бумаги сверху
    s += `<rect x="${n(cx - w * 0.3)}" y="${n(y - 26)}" width="${n(w * 0.5)}" height="34" rx="6" fill="#e8dcc0"/>`;
    s += `<ellipse cx="${n(cx - w * 0.3)}" cy="${n(y - 9)}" rx="9" ry="17" fill="#c9bb99"/>`;
    s += `<circle cx="${n(cx - w * 0.3)}" cy="${n(y - 9)}" r="4" fill="#8d8168"/>`;
    s += `<path d="M ${n(cx - w * 0.3 + 9)} ${n(y - 14)} L ${n(cx + w * 0.34)} ${n(y - 12)} L ${n(cx + w * 0.36)} ${n(y + 4)} L ${n(cx - w * 0.3 + 9)} ${n(y + 2)} Z" fill="#f4eeda"/>`;
    for (let i = 0; i < 4; i++) {
      s += `<line x1="${n(cx - w * 0.18)}" y1="${n(y - 9 + i * 4)}" x2="${n(cx + w * 0.32)}" y2="${n(y - 8 + i * 4)}" stroke="#b8ad91" stroke-width="1" opacity="0.6"/>`;
    }
    s += `<rect x="${n(cx + w * 0.2)}" y="${n(y - 22)}" width="8" height="12" fill="#8d8168"/>`;
    // окно счётчика с барабанами цифр
    s += `<rect x="${n(cx - w * 0.42)}" y="${n(y + 48)}" width="${n(w * 0.84)}" height="${n(h * 0.17)}" rx="4" fill="#14120f"/>`;
    s += `<rect x="${n(cx - w * 0.42)}" y="${n(y + 48)}" width="${n(w * 0.84)}" height="4" fill="#fff" opacity="0.14"/>`;
    const digits = rnd.pick(['0481526', '0012543', '3176095', '9204817']);
    for (let i = 0; i < 7; i++) {
      const dx = cx - w * 0.38 + i * (w * 0.11);
      s += `<rect x="${n(dx)}" y="${n(y + 52)}" width="${n(w * 0.085)}" height="${n(h * 0.13)}" fill="#221f1a"/>`;
      s += `<text x="${n(dx + w * 0.0425)}" y="${n(y + 52 + h * 0.115)}" font-family="Consolas,monospace" font-size="${n(h * 0.1)}"
        font-weight="700" text-anchor="middle" fill="#e6dfc8">${digits[i]}</text>`;
      s += `<rect x="${n(dx)}" y="${n(y + 52 + h * 0.062)}" width="${n(w * 0.085)}" height="1.6" fill="#000" opacity="0.5"/>`;
    }
    // клавиатура: 4 ряда круглых клавиш
    s += `<rect x="${n(cx - w * 0.44)}" y="${n(y + h * 0.71)}" width="${n(w * 0.88)}" height="${n(h * 0.25)}" rx="6" fill="${shade(c, -0.24)}"/>`;
    for (let r = 0; r < 4; r++) {
      for (let k = 0; k < 5; k++) {
        const kx = cx - w * 0.34 + k * (w * 0.17);
        const ky = y + h * 0.755 + r * (h * 0.055);
        const isRed = (r === 3 && k >= 3) || (r === 0 && k === 4);
        const isDark = !isRed && (r + k) % 4 === 1;
        s += `<ellipse cx="${n(kx)}" cy="${n(ky + 2)}" rx="${n(keyR)}" ry="${n(keyR * 0.62)}" fill="#000" opacity="0.35"/>`;
        s += `<ellipse cx="${n(kx)}" cy="${n(ky)}" rx="${n(keyR)}" ry="${n(keyR * 0.62)}" fill="${isRed ? '#a8382c' : isDark ? '#26221d' : '#e2dac2'}"/>`;
        s += `<ellipse cx="${n(kx)}" cy="${n(ky - keyR * 0.16)}" rx="${n(keyR * 0.66)}" ry="${n(keyR * 0.3)}" fill="${isRed ? '#c85445' : isDark ? '#413a32' : '#f6f0dc'}"/>`;
      }
    }
    // ручка сброса справа
    s += `<path d="M ${n(cx + w * 0.46)} ${n(y + h * 0.42)} l ${n(30)} -10 l 0 18 l ${n(-30)} 8 Z" fill="${shade(c, 0.22)}"/>`;
    s += `<circle cx="${n(cx + w * 0.46)}" cy="${n(y + h * 0.48)}" r="6" fill="${shade(c, -0.2)}"/>`;
    s += `<circle cx="${n(cx + w * 0.46)}" cy="${n(y + h * 0.48)}" r="2.6" fill="#d8cdb4" opacity="0.7"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(base - 8)}" width="${n(w)}" height="8" rx="3" fill="#151311"/>`;
    s += sparkle(cx - w * 0.36, y + 54, 6, 0.28);
    return s + grime(cx, base - h * 0.5, w, h, rnd, pal, 3);
  },

  // 78 ── Меховая шуба
  furcoat({ rnd, pal, cx, base }) {
    const w = rnd.range(176, 208);
    const h = rnd.range(220, 258);
    const y = base - h;
    const c = shade('#5a3220', rnd.range(-0.1, 0.1));
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <path d="M ${n(cx - 20)} ${n(y)} l ${n(20)} 0 l ${n(6)} ${n(h * 0.12)} l ${n(w * 0.3)} ${n(h * 0.16)}
        q ${n(w * 0.16)} ${n(h * 0.1)} ${n(w * 0.1)} ${n(h * 0.3)} l ${n(-w * 0.1)} ${n(h * 0.4)} l ${n(-w * 0.6)} 0
        l ${n(-w * 0.1)} ${n(-h * 0.4)} q ${n(-w * 0.06)} ${n(-h * 0.2)} ${n(w * 0.1)} ${n(-h * 0.3)} l ${n(w * 0.3)} ${n(-h * 0.16)} Z" fill="${c}"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y + 6)}" rx="30" ry="20" fill="${shade(c, 0.24)}"/>`;
    s += `<ellipse cx="${n(cx - 8)}" cy="${n(y + 2)}" rx="12" ry="9" fill="#fff" opacity="0.12"/>`;
    for (let i = 0; i < 4; i++) {
      s += `<path d="M ${n(cx + 16)} ${n(y + 14 + i * (h * 0.03))} l ${n(-w * 0.34)} ${n(h * 0.16)}" stroke="${shade(c, 0.3)}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`;
      s += `<path d="M ${n(cx - 16)} ${n(y + 14 + i * (h * 0.03))} l ${n(w * 0.34)} ${n(h * 0.16)}" stroke="${shade(c, -0.2)}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>`;
    }
    s += `<path d="M ${n(cx)} ${n(y + 22)} v ${n(h * 0.62)}" stroke="${shade(c, -0.32)}" stroke-width="4"/>`;
    s += `<ellipse cx="${n(cx - w * 0.16)}" cy="${n(base - h * 0.3)}" rx="${n(w * 0.1)}" ry="${n(h * 0.2)}" fill="#fff" opacity="0.07"/>`;
    return s + folds(cx, y + h * 0.5, w, h, rnd, shade(c, -0.3), 0.2, 5);
  },

  // 79 ── Кожаные сапоги
  leathboots({ rnd, pal, cx, base }) {
    const c = shade('#6b3a1e', rnd.range(-0.1, 0.1));
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="88" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/>`;
    for (let i = 0; i < 2; i++) {
      const x = cx + (i === 0 ? -42 : 34);
      const h = rnd.range(126, 150);
      const flip = i === 0 ? -1 : 1;
      s += `<g transform="translate(${n(x)} 0) scale(${flip} 1)">
        <path d="M ${n(-26)} ${n(base)} L ${n(-28)} ${n(base - h)} L ${n(24)} ${n(base - h)} L ${n(30)} ${n(base - 24)}
          L ${n(66)} ${n(base - 18)} L ${n(72)} ${n(base)} Z" fill="${c}"/>`;
      s += `<rect x="${n(-32)}" y="${n(base - 12)}" width="108" height="14" rx="4" fill="#1c1510"/>`;
      s += `<rect x="${n(-30)}" y="${n(base - 9)}" width="104" height="4" fill="#fff" opacity="0.1"/>`;
      s += `<path d="M ${n(-26)} ${n(base - h * 0.78)} l 48 0" stroke="${shade(c, 0.3)}" stroke-width="4"/>`;
      s += `<path d="M ${n(-26)} ${n(base - h * 0.62)} l 48 0" stroke="${shade(c, 0.3)}" stroke-width="4"/>`;
      s += `<path d="M ${n(-26)} ${n(base - h * 0.46)} l 48 0" stroke="${shade(c, 0.3)}" stroke-width="4"/>`;
      s += `<circle cx="${n(-4)}" cy="${n(base - h * 0.78)}" r="4" fill="${brass(rnd)}"/>`;
      s += `<circle cx="${n(-4)}" cy="${n(base - h * 0.62)}" r="4" fill="${brass(rnd)}"/>`;
      s += `<circle cx="${n(-4)}" cy="${n(base - h * 0.46)}" r="4" fill="${brass(rnd)}"/>`;
      s += `<path d="M ${n(-30)} ${n(base - h)} l 54 0 l 0 10 l -54 0 Z" fill="${shade(c, -0.2)}"/>`;
      s += `</g>`;
    }
    return s + grime(cx, base - 60, 150, 120, rnd, pal, 3);
  },

  // 80 ── Мотоцикл
  motorcycle({ rnd, pal, cx, base }) {
    const R = rnd.range(46, 56);
    const c = rnd.pick(['#8a2a2a', '#2a4a8a', '#2a2a2a']);
    const x1 = cx - 88;
    const x2 = cx + 92;
    const y1 = base - R;
    const y2 = base - R;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="118" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <circle cx="${n(x1)}" cy="${n(y1)}" r="${n(R)}" fill="none" stroke="#1a1815" stroke-width="10"/>
      <circle cx="${n(x1)}" cy="${n(y1)}" r="${n(R * 0.5)}" fill="none" stroke="#9a9184" stroke-width="2" opacity="0.6"/>`;
    for (let j = 0; j < 10; j++) {
      const [x2a, y2a] = polar(x1, y1, R - 6, j * 36);
      s += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2a)}" y2="${n(y2a)}" stroke="#b0a89a" stroke-width="1.6" opacity="0.8"/>`;
    }
    s += `<circle cx="${n(x2)}" cy="${n(y2)}" r="${n(R)}" fill="none" stroke="#1a1815" stroke-width="10"/>`;
    for (let j = 0; j < 10; j++) {
      const [x2a, y2a] = polar(x2, y2, R - 6, j * 36);
      s += `<line x1="${n(x2)}" y1="${n(y2)}" x2="${n(x2a)}" y2="${n(y2a)}" stroke="#b0a89a" stroke-width="1.6" opacity="0.8"/>`;
    }
    s += `<path d="M ${n(x1)} ${n(y1)} L ${n(cx - 20)} ${n(y1 - 30)} L ${n(cx + 30)} ${n(y1 - 6)} L ${n(x1)} ${n(y1)}
      M ${n(cx - 20)} ${n(y1 - 30)} L ${n(cx - 6)} ${n(y1 - 66)} L ${n(cx + 24)} ${n(y1 - 68)} L ${n(cx + 30)} ${n(y1 - 6)}"
      fill="none" stroke="${c}" stroke-width="9" stroke-linejoin="round"/>`;
    s += `<ellipse cx="${n(cx + 6)}" cy="${n(y1 - 34)}" rx="34" ry="20" fill="${shade(c, 0.14)}"/>`;
    s += `<ellipse cx="${n(cx - 4)}" cy="${n(y1 - 42)}" rx="14" ry="8" fill="#fff" opacity="0.12"/>`;
    s += `<path d="M ${n(cx + 24)} ${n(y1 - 68)} L ${n(cx + 40)} ${n(y1 - 92)}" stroke="${shade(c, -0.1)}" stroke-width="8" stroke-linecap="round"/>`;
    s += `<path d="M ${n(cx + 34)} ${n(y1 - 92)} L ${n(cx + 58)} ${n(y1 - 92)}" stroke="${shade(c, -0.1)}" stroke-width="8" stroke-linecap="round"/>`;
    s += `<circle cx="${n(cx - 6)}" cy="${n(y1 - 66)}" r="13" fill="#2a2622"/>`;
    s += `<ellipse cx="${n(cx - 34)}" cy="${n(y1 - 26)}" rx="10" ry="7" fill="#2a2622"/>`;
    s += `<path d="M ${n(x2 - 8)} ${n(y2 - 10)} l ${n(-6)} ${n(-44)}" stroke="#3a3630" stroke-width="7"/>`;
    return s;
  },

  // 81 ── Кинокамера
  filmcamera({ rnd, pal, cx, base }) {
    const w = rnd.range(160, 186);
    const h = rnd.range(96, 112);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.56)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + 18)}" width="${n(w)}" height="${n(h - 18)}" rx="6" fill="#2b2724"/>
      <rect x="${n(cx - w / 2 + 4)}" y="${n(y + 22)}" width="${n(w * 0.16)}" height="${n(h - 26)}" fill="#fff" opacity="0.09"/>`;
    s += `<circle cx="${n(cx - w * 0.2)}" cy="${n(y + h * 0.6)}" r="${n(h * 0.3)}" fill="#1a1614"/>`;
    s += `<circle cx="${n(cx - w * 0.2)}" cy="${n(y + h * 0.6)}" r="${n(h * 0.22)}" fill="#0d1a22"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<circle cx="${n(cx - w * 0.2)}" cy="${n(y + h * 0.6)}" r="${n(h * 0.22 - i * 5)}" fill="none" stroke="#2a5068" stroke-width="2" opacity="0.5"/>`;
    }
    s += `<circle cx="${n(cx + w * 0.04)}" cy="${n(y + 14)}" r="${n(h * 0.3)}" fill="${steel(rnd, -0.1)}"/>`;
    s += `<circle cx="${n(cx + w * 0.04)}" cy="${n(y + 14)}" r="${n(h * 0.2)}" fill="#1a1614"/>`;
    s += `<path d="${arcPath(cx + w * 0.04, y + 14, h * 0.15, 160, 350)}" fill="none" stroke="#fff" stroke-width="2.4" opacity="0.2"/>`;
    s += `<rect x="${n(cx + w * 0.22)}" y="${n(y + 6)}" width="${n(w * 0.22)}" height="${n(h * 0.34)}" rx="4" fill="#3a3630"/>`;
    for (let i = 0; i < 2; i++) {
      s += `<circle cx="${n(cx + w * 0.26 + i * (w * 0.1))}" cy="${n(y + 6 + h * 0.16)}" r="${n(h * 0.11)}" fill="${brass(rnd, -0.2)}"/>`;
    }
    s += `<rect x="${n(cx - w * 0.44)}" y="${n(y + 8)}" width="${n(w * 0.14)}" height="${n(h * 0.24)}" rx="3" fill="#3a3630"/>`;
    s += `<path d="M ${n(cx - w * 0.1)} ${n(y + 18)} l ${n(-10)} ${n(-22)} l ${n(w * 0.24)} 0 l ${n(-8)} ${n(22)} Z" fill="#3a3630"/>`;
    s += sparkle(cx - w * 0.2, y + h * 0.5, 6, 0.4);
    return s;
  },

  // 82 ── Кинопроектор
  projector({ rnd, pal, cx, base }) {
    const w = rnd.range(120, 142);
    const h = rnd.range(160, 184);
    const y = base - h;
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="62" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - 42)}" y="${n(base - 10)}" width="84" height="12" rx="3" fill="#2b2724"/>`;
    s += `<rect x="${n(cx - 30)}" y="${n(y + 40)}" width="60" height="${n(h - 46)}" rx="5" fill="#2e2a26"/>`;
    s += `<rect x="${n(cx - 26)}" y="${n(y + 44)}" width="14" height="${n(h - 54)}" fill="#fff" opacity="0.09"/>`;
    s += `<rect x="${n(cx - 22)}" y="${n(y + 6)}" width="44" height="44" rx="5" fill="#3a3630"/>`;
    s += `<circle cx="${n(cx - 8)}" cy="${n(y + 8)}" r="9" fill="#8a8272"/>`;
    s += `<circle cx="${n(cx + 14)}" cy="${n(y + 8)}" r="9" fill="#8a8272"/>`;
    s += `<circle cx="${n(cx - 8)}" cy="${n(y + 48)}" r="9" fill="#8a8272"/>`;
    s += `<circle cx="${n(cx + 14)}" cy="${n(y + 48)}" r="9" fill="#8a8272"/>`;
    s += `<rect x="${n(cx - 14)}" y="${n(y + 22)}" width="28" height="8" fill="#6a6157"/>`;
    s += `<path d="M ${n(cx + 30)} ${n(y + 16)} l ${n(w * 0.5)} ${n(-24)} l 14 6 l ${n(-w * 0.5)} ${n(26)} Z" fill="${steel(rnd, -0.14)}"/>`;
    s += `<ellipse cx="${n(cx + 30 + w * 0.5)}" cy="${n(y - 6)}" rx="9" ry="14" fill="#141c22"/>`;
    s += `<ellipse cx="${n(cx + 30 + w * 0.5)}" cy="${n(y - 6)}" rx="9" ry="14" fill="none" stroke="${shade('#8a8272', 0.1)}" stroke-width="3"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.66)}" r="18" fill="${shade(brass(rnd), -0.2)}"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.66)}" r="7" fill="#1a1614"/>`;
    s += `<path d="${arcPath(cx, y + h * 0.66, 13, 190, 350)}" fill="none" stroke="#fff" stroke-width="2" opacity="0.3"/>`;
    s += sparkle(cx + 30 + w * 0.5, y - 6, 6, 0.5);
    return s;
  },

  // 83 ── Слесарный набор
  toolbox({ rnd, pal, cx, base }) {
    const w = rnd.range(200, 232);
    const h = rnd.range(104, 124);
    const y = base - h;
    const c = rnd.pick(['#8a3b2a', '#2f5a7a', '#6a6a5a']);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.55)}" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + 34)}" width="${n(w)}" height="${n(h - 34)}" rx="5" fill="${c}"/>`;
    s += `<rect x="${n(cx - w / 2 + 3)}" y="${n(y + 36)}" width="${n(w * 0.16)}" height="${n(h - 38)}" fill="#fff" opacity="0.1"/>`;
    s += `<path d="M ${n(cx - w * 0.24)} ${n(y + 34)} q ${n(-4)} ${n(-30)} ${n(24)} ${n(-30)} l ${n(w * 0.48)} 0
      q ${n(28)} 0 ${n(24)} ${n(30)} l 0 0 Z" fill="none" stroke="${shade(c, -0.2)}" stroke-width="8"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y + 24)}" width="${n(w)}" height="14" rx="4" fill="${shade(c, 0.2)}"/>`;
    s += `<rect x="${n(cx - w / 2 + 8)}" y="${n(y + 4)}" width="${n(w - 16)}" height="24" rx="5" fill="${shade(c, -0.1)}"/>`;
    s += `<rect x="${n(cx - 30)}" y="${n(y + 6)}" width="60" height="20" rx="4" fill="${steel(rnd, -0.1)}"/>`;
    s += `<rect x="${n(cx - w / 2 + 12)}" y="${n(y + 50)}" width="${n(w * 0.2)}" height="${n(h * 0.26)}" rx="3" fill="${shade(c, -0.3)}"/>`;
    for (let i = 0; i < 5; i++) {
      s += `<rect x="${n(cx - w * 0.3 + i * (w * 0.12))}" y="${n(y + 52)}" width="${n(w * 0.1)}" height="7" rx="2" fill="${shade(c, -0.4)}"/>`;
    }
    s += sparkle(cx, y + 16, 6, 0.35);
    return s;
  },

  // 84 ── Альбом с монетами
  coinalbum({ rnd, pal, cx, base }) {
    const w = rnd.range(180, 206);
    const h = rnd.range(216, 244);
    const y = base - h;
    const lean = rnd.range(-8, 8);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="60" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(lean)} ${n(cx + w * 0.4)} ${n(base)})">
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="6" fill="#5a2a2a"/>`;
    s += `<rect x="${n(cx - w / 2 + 4)}" y="${n(y + 4)}" width="${n(w * 0.2)}" height="${n(h - 8)}" rx="4" fill="#fff" opacity="0.08"/>`;
    s += `<rect x="${n(cx - w / 2 + 14)}" y="${n(y + 14)}" width="${n(w - 28)}" height="${n(h - 28)}" fill="#1a1512"/>`;
    const cols = 3;
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = cx - w / 2 + 14 + ((w - 28) / cols) * (c + 0.5);
        const py = y + 14 + ((h - 28) / rows) * (r + 0.5);
        const cr = Math.min((w - 28) / cols, (h - 28) / rows) * 0.34;
        const cc = brass(rnd, rnd.range(-0.16, 0.14));
        s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(cr)}" fill="${shade(cc, -0.3)}"/>`;
        s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(cr * 0.9)}" fill="${cc}"/>`;
        s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(cr * 0.5)}" fill="${shade(cc, -0.2)}"/>`;
        if (rnd.chance(0.3)) {
          s += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(cr * 0.9)}" fill="#000" opacity="0.45"/>`;
        }
        s += `<ellipse cx="${n(px - cr * 0.3)}" cy="${n(py - cr * 0.34)}" rx="${n(cr * 0.3)}" ry="${n(cr * 0.2)}" fill="#fff" opacity="0.22"/>`;
      }
    }
    s += `<rect x="${n(cx - w * 0.3)}" y="${n(y + 6)}" width="${n(w * 0.6)}" height="10" rx="3" fill="#c9bda0" opacity="0.4"/>`;
    s += `</g>`;
    return s + sparkle(cx + 20, y + h * 0.4, 6, 0.3);
  },

  // 85 ── Фарфоровый сервиз
  porcelain({ rnd, pal, cx, base }) {
    const w = rnd.range(190, 220);
    const c = shade('#e8e4da', rnd.range(-0.05, 0.04));
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.52)}" ry="12" fill="#000" opacity="0.42" filter="url(#soft)"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 12)}" rx="${n(w * 0.48)}" ry="14" fill="${shade(c, -0.2)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 16)}" rx="${n(w * 0.48)}" ry="14" fill="${shade(c, 0.1)}"/>`;
    // чайник
    s += `<path d="M ${n(cx - w * 0.28)} ${n(base - 20)} q ${n(-6)} ${n(-58)} ${n(42)} ${n(-58)} q ${n(48)} 0 ${n(42)} ${n(58)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(cx - w * 0.24)} ${n(base - 22)} q ${n(-5)} ${n(-52)} ${n(34)} ${n(-55)} l ${n(-9)} 0 q ${n(-28)} ${n(8)} ${n(-19)} ${n(55)} Z" fill="#fff" opacity="0.4"/>`;
    s += `<path d="M ${n(cx - w * 0.28)} ${n(base - 38)} q ${n(-30)} ${n(-4)} ${n(-24)} ${n(22)}" stroke="${shade(c, -0.12)}" stroke-width="7" fill="none"/>`;
    s += `<path d="M ${n(cx - w * 0.28 + 42)} ${n(base - 36)} q ${n(34)} ${n(2)} ${n(30)} ${n(-26)} l ${n(11)} 0 q ${n(2)} ${n(34)} ${n(-38)} ${n(32)} Z" fill="${shade(c, -0.06)}"/>`;
    s += `<ellipse cx="${n(cx - w * 0.22)}" cy="${n(base - 78)}" rx="9" ry="6" fill="${shade(c, -0.1)}"/>`;
    // синий орнамент
    s += `<path d="M ${n(cx - w * 0.26)} ${n(base - 34)} q ${n(w * 0.24)} ${n(8)} ${n(w * 0.5)} ${n(-2)}" stroke="#3b5a8a" stroke-width="3" fill="none" opacity="0.7"/>`;
    // чашки
    for (const dx of [0.06, 0.28]) {
      const x = cx + w * dx;
      s += `<path d="M ${n(x - 22)} ${n(base - 34)} q 0 26 22 26 q 22 0 22 -26 Z" fill="${c}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 34)}" rx="22" ry="7" fill="${shade(c, 0.14)}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 34)}" rx="16" ry="4" fill="#4a3a2a" opacity="0.7"/>`;
      s += `<path d="M ${n(x + 21)} ${n(base - 30)} q 13 2 11 -11" stroke="${shade(c, -0.1)}" stroke-width="4" fill="none"/>`;
      s += `<path d="M ${n(x - 18)} ${n(base - 22)} q ${n(18)} 6 ${n(36)} -2}" stroke="#3b5a8a" stroke-width="2.6" fill="none" opacity="0.7"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 8)}" rx="18" ry="4" fill="${shade(c, -0.08)}"/>`;
    }
    s += sparkle(cx - w * 0.24, base - 52, 7, 0.5);
    return s;
  },

  // 86 ── Латунные подсвечники
  candlesticks({ rnd, pal, cx, base }) {
    const h = rnd.range(190, 226);
    const c = brass(rnd);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="60" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>`;
    for (const off of [-46, 46]) {
      const x = cx + off;
      const y = base - h;
      const sc = off < 0 ? c : shade(c, -0.1);
      s += `<ellipse cx="${n(x)}" cy="${n(base - 6)}" rx="26" ry="8" fill="${shade(sc, -0.25)}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(base - 9)}" rx="26" ry="8" fill="${shade(sc, 0.12)}"/>`;
      s += `<path d="M ${n(x - 9)} ${n(base - 12)} q ${n(-8)} ${n(-h * 0.4)} ${n(2)} ${n(-h * 0.62)} l ${n(14)} 0
        q ${n(10)} ${n(h * 0.22)} ${n(2)} ${n(h * 0.62)} Z" fill="${sc}"/>`;
      s += `<ellipse cx="${n(x - 3)}" cy="${n(base - h * 0.32)}" rx="5" ry="${n(h * 0.12)}" fill="#fff" opacity="0.16"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(y + 16)}" rx="22" ry="8" fill="${shade(sc, 0.2)}"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(y + 16)}" rx="14" ry="5" fill="${shade(sc, -0.1)}"/>`;
      s += `<rect x="${n(x - 8)}" y="${n(y - 8)}" width="16" height="24" rx="3" fill="#e8dcc0"/>`;
      s += `<ellipse cx="${n(x)}" cy="${n(y - 8)}" rx="8" ry="3" fill="#c9bda0"/>`;
      s += `<path d="M ${n(x - 20)} ${n(base - 30)} q ${n(20)} ${n(8)} ${n(40)} 0" stroke="${shade(sc, 0.24)}" stroke-width="3" fill="none" opacity="0.5"/>`;
      s += sparkle(x + 12, y + 30, 6, 0.4);
    }
    return s;
  },

  // 87 ── Гравюра в раме
  engraving({ rnd, pal, cx, base }) {
    const w = rnd.range(150, 178);
    const h = rnd.range(196, 230);
    const y = base - h;
    const c = rnd.pick(['#6b4a2a', '#3a4a5a', '#5a4a2a']);
    const lean = rnd.range(-8, 8);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="52" ry="11" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(lean)} ${n(cx + w * 0.4)} ${n(base)})">
      <rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${shade(c, -0.3)}"/>
      <rect x="${n(cx - w / 2 + 13)}" y="${n(y + 13)}" width="${n(w - 26)}" height="${n(h - 26)}" fill="#cfc4a8"/>`;
    s += `<path d="M ${n(cx - w * 0.38)} ${n(base - 30)} l ${n(w * 0.2)} ${n(-h * 0.4)} l ${n(w * 0.14)} ${n(h * 0.22)} l ${n(w * 0.2)} ${n(-h * 0.1)} l ${n(w * 0.22)} ${n(h * 0.28)} Z" fill="#6a5f48" opacity="0.55"/>`;
    s += `<circle cx="${n(cx + w * 0.2)}" cy="${n(y + h * 0.24)}" r="${n(w * 0.1)}" fill="#6a5f48" opacity="0.5"/>`;
    for (let i = 0; i < 12; i++) {
      s += `<line x1="${n(cx - w * 0.4)}" y1="${n(y + 22 + i * ((h - 44) / 12))}" x2="${n(cx + w * 0.4)}"
        y2="${n(y + 22 + i * ((h - 44) / 12))}" stroke="#8a7a5a" stroke-width="1" opacity="0.35"/>`;
    }
    s += `<rect x="${n(cx - w * 0.4)}" y="${n(base - 46)}" width="${n(w * 0.5)}" height="4" fill="#5a4c34" opacity="0.6"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="13" fill="${shade(c, 0.12)}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(base - 13)}" width="${n(w)}" height="13" fill="${shade(c, -0.1)}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="13" height="${n(h)}" fill="${c}"/>`;
    s += `<rect x="${n(cx + w / 2 - 13)}" y="${n(y)}" width="13" height="${n(h)}" fill="${shade(c, -0.14)}"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w * 0.16)}" height="13" fill="#fff" opacity="0.14"/>`;
    s += `<ellipse cx="${n(cx - w * 0.18)}" cy="${n(y + h * 0.3)}" rx="${n(w * 0.24)}" ry="${n(h * 0.2)}" fill="#fff" opacity="0.08"/>`;
    s += `</g>`;
    return s;
  },

  // 88 ── Старинный глобус
  globe({ rnd, pal, cx, base }) {
    const R = rnd.range(66, 80);
    const h = rnd.range(190, 218);
    const y = base - h;
    const a = rnd.range(-16, 16);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="56" ry="12" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <g transform="rotate(${n(a)} ${n(cx)} ${n(base)})">
      <path d="M ${n(cx - 14)} ${n(base - 8)} L ${n(cx - 8)} ${n(y + R * 0.6)} L ${n(cx + 8)} ${n(y + R * 0.6)} L ${n(cx + 14)} ${n(base - 8)} Z" fill="${wood(rnd, -0.1)}"/>
      <ellipse cx="${n(cx)}" cy="${n(base - 10)}" rx="34" ry="9" fill="${wood(rnd, 0.06)}"/>
      <path d="M ${n(cx + 8)} ${n(y + R * 0.6)} q ${n(30)} ${n(-R * 0.3)} ${n(34)} ${n(-R * 0.5)}" fill="none" stroke="${brass(rnd, -0.1)}" stroke-width="7"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R)}" fill="#2a4058"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R)}" fill="url(#backglow)" opacity="0.4"/>`;
    s += `<path d="M ${n(cx - R * 0.8)} ${n(y - R * 0.3)} q ${n(R * 0.3)} ${n(-R * 0.3)} ${n(R * 0.6)} ${n(R * 0.1)}
      q ${n(R * 0.3)} ${n(R * 0.4)} ${n(-R * 0.1)} ${n(R * 0.6)} q ${n(-R * 0.4)} ${n(R * 0.2)} ${n(-R * 0.5)} ${n(-R * 0.3)} Z" fill="#7a8a5a"/>`;
    s += `<path d="M ${n(cx + R * 0.2)} ${n(y - R * 0.7)} q ${n(R * 0.5)} ${n(R * 0.1)} ${n(R * 0.4)} ${n(R * 0.5)}
      q ${n(-R * 0.2)} ${n(R * 0.3)} ${n(-R * 0.5)} ${n(-R * 0.1)} Z" fill="#7a8a5a"/>`;
    s += `<ellipse cx="${n(cx - R * 0.34)}" cy="${n(y - R * 0.42)}" rx="${n(R * 0.34)}" ry="${n(R * 0.24)}" fill="#fff" opacity="0.14"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y)}" r="${n(R)}" fill="none" stroke="${brass(rnd)}" stroke-width="5"/>`;
    s += `<ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(R * 0.3)}" ry="${n(R)}" fill="none" stroke="${brass(rnd, -0.1)}" stroke-width="2.6" opacity="0.7"/>`;
    s += `<path d="${arcPath(cx, y, R, 250, 300)}" fill="none" stroke="#e8dcc0" stroke-width="2" opacity="0.4"/>`;
    s += `</g>`;
    return s + sparkle(cx + R * 0.3, y - R * 0.5, 6, 0.35);
  },

  // 89 ── Сундук с замком
  chest({ rnd, pal, cx, base }) {
    const w = rnd.range(210, 244);
    const h = rnd.range(120, 146);
    const y = base - h;
    const c = wood(rnd, -0.08);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 3)}" rx="${n(w * 0.54)}" ry="13" fill="#000" opacity="0.5" filter="url(#soft)"/>
      <rect x="${n(cx - w / 2)}" y="${n(y + h * 0.44)}" width="${n(w)}" height="${n(h * 0.56)}" fill="${c}"/>`;
    s += `<path d="M ${n(cx - w / 2)} ${n(y + h * 0.46)} q ${n(0)} ${n(-h * 0.5)} ${n(w * 0.5)} ${n(-h * 0.5)}
      q ${n(w * 0.5)} 0 ${n(w * 0.5)} ${n(h * 0.5)} Z" fill="${shade(c, 0.1)}"/>`;
    s += `<path d="M ${n(cx - w * 0.5)} ${n(y + h * 0.46)} q 0 ${n(-h * 0.48)} ${n(w * 0.28)} ${n(-h * 0.49)} l ${n(-w * 0.06)} 0
      q ${n(-w * 0.16)} ${n(h * 0.06)} ${n(-w * 0.2)} ${n(h * 0.49)} Z" fill="#fff" opacity="0.1"/>`;
    s += `<rect x="${n(cx - w / 2)}" y="${n(y + h * 0.4)}" width="${n(w)}" height="9" fill="${shade(c, -0.3)}"/>`;
    const b = brass(rnd, -0.1);
    for (const bx of [-0.34, 0.22]) {
      s += `<rect x="${n(cx + w * bx)}" y="${n(y + h * 0.4)}" width="18" height="${n(h * 0.6)}" fill="${b}"/>`;
      s += `<rect x="${n(cx + w * bx)}" y="${n(y + h * 0.4)}" width="6" height="${n(h * 0.6)}" fill="#fff" opacity="0.16"/>`;
    }
    s += `<path d="M ${n(cx - w * 0.1)} ${n(y + h * 0.34)} q ${n(w * 0.1)} ${n(-h * 0.14)} ${n(w * 0.2)} 0" fill="none" stroke="${b}" stroke-width="8"/>`;
    s += `<rect x="${n(cx - 15)}" y="${n(y + h * 0.4)}" width="30" height="26" rx="4" fill="${b}"/>`;
    s += `<rect x="${n(cx - 15)}" y="${n(y + h * 0.4)}" width="30" height="8" rx="4" fill="#fff" opacity="0.2"/>`;
    s += `<circle cx="${n(cx)}" cy="${n(y + h * 0.55)}" r="5" fill="#2a1c0c"/>`;
    s += `<rect x="${n(cx - 3)}" y="${n(y + h * 0.55)}" width="6" height="9" fill="#2a1c0c"/>`;
    s += sparkle(cx, y + h * 0.5, 6, 0.35);
    return s + grime(cx, y + h * 0.5, w, h, rnd, pal, 3);
  },

  // 90 ── Шахматные фигуры
  chess({ rnd, pal, cx, base }) {
    const w = rnd.range(206, 232);
    const db = 92; // глубина доски на экране
    const dark = '#1c1712';
    const light = '#e6dcc0';
    const sq = w / 8;
    // перспективное сжатие дальнего края
    const k = 0.62;
    const zAt = (i) => 1 - (1 - k) * (i / 8);
    let s = `<ellipse cx="${n(cx)}" cy="${n(base + 4)}" rx="${n(w * 0.62)}" ry="14" fill="#000" opacity="0.55" filter="url(#soft)"/>
      <g transform="rotate(${n(rnd.range(-4, 4))} ${n(cx)} ${n(base)})">`;
    // рама доски
    s += `<path d="${poly([[cx - w / 2, base], [cx + w / 2, base], [cx + w / 2 * k, base - db], [cx - w / 2 * k, base - db]])}" fill="${shade(light, -0.34)}"/>`;
    // клетки
    for (let r = 0; r < 8; r++) {
      const z0 = zAt(r);
      const z1 = zAt(r + 1);
      const y0 = base - db * (1 - z0);
      const y1 = base - db * (1 - z1);
      for (let c2 = 0; c2 < 8; c2++) {
        const xa0 = cx - (w / 2) * z0 + sq * z0 * c2;
        const xa1 = cx - (w / 2) * z0 + sq * z0 * (c2 + 1);
        const xb0 = cx - (w / 2) * z1 + sq * z1 * c2;
        const xb1 = cx - (w / 2) * z1 + sq * z1 * (c2 + 1);
        s += `<path d="${poly([[xa0, y0], [xa1, y0], [xb1, y1], [xb0, y1]])}" fill="${(r + c2) % 2 === 0 ? light : dark}"/>`;
      }
    }
    // блик по кромке
    s += `<path d="${poly([[cx - w / 2, base], [cx + w / 2, base], [cx + w / 2 * k, base - db], [cx - w / 2 * k, base - db]])}" fill="none" stroke="#fff" stroke-width="1.6" opacity="0.2"/>`;
    // позиция: координаты (клетка, ряд) → экран
    const at = (c2, r) => {
      const z = zAt(r + 1);
      return [cx - (w / 2) * z + sq * z * (c2 + 0.5), base - db * (1 - z)];
    };
    // дальний ряд: ладья, конь, ферзь, король
    const back = [
      { c2: 1.5, r: 1.2, h: 74, c: dark, t: 'rook' },
      { c2: 2.6, r: 1.0, h: 80, c: light, t: 'knight' },
      { c2: 3.7, r: 1.1, h: 86, c: dark, t: 'bishop' },
      { c2: 4.9, r: 1.35, h: 104, c: light, t: 'king' },
      { c2: 6.1, r: 1.1, h: 92, c: dark, t: 'queen' },
    ];
    for (const p of back) {
      const [px, py] = at(p.c2, p.r);
      s += `<ellipse cx="${n(px)}" cy="${n(py + 2)}" rx="${n(p.h * 0.2)}" ry="${n(p.h * 0.05)}" fill="#000" opacity="0.4"/>`;
      s += piece(px, py, p.h, p.c, p.t, rnd);
    }
    // ближний ряд: конь, пешка, ладья
    const front = [
      { c2: 2.4, r: 4.4, h: 94, c: dark, t: 'knight' },
      { c2: 3.6, r: 5.1, h: 58, c: light, t: 'pawn' },
      { c2: 5.0, r: 4.8, h: 86, c: light, t: 'rook' },
    ];
    for (const p of front) {
      const [px, py] = at(p.c2, p.r);
      s += `<ellipse cx="${n(px)}" cy="${n(py + 2)}" rx="${n(p.h * 0.22)}" ry="${n(p.h * 0.055)}" fill="#000" opacity="0.45"/>`;
      s += piece(px, py, p.h, p.c, p.t, rnd);
    }
    // упавшая пешка на переднем краю
    const [fx, fy] = at(1.3, 6.4);
    s += `<g transform="rotate(${n(rnd.range(70, 110))} ${n(fx)} ${n(fy)})">${piece(fx, fy, 52, light, 'pawn', rnd)}</g>`;
    s += `</g>`;
    return s + sparkle(cx + w * 0.1, base - db - 96, 6, 0.3);
  },
};

function w_(L) {
  return 34;
}

function piece(x, base, h, c, type, rnd) {
  const w = h * 0.32; // ширина основания
  const dk = shade(c, -0.42);
  const lt = shade(c, 0.3);
  const yB = base; // низ
  const yN = base - h * 0.14; // верх постамента
  const yT = base - h * 0.6; // плечи
  let s = '';
  // постамент: две ступени
  s += `<ellipse cx="${n(x)}" cy="${n(yB + 1)}" rx="${n(w * 0.68)}" ry="${n(h * 0.045)}" fill="#000" opacity="0.45"/>`;
  s += `<path d="M ${n(x - w * 0.5)} ${n(yB)} L ${n(x - w * 0.42)} ${n(yB - h * 0.07)} L ${n(x + w * 0.42)} ${n(yB - h * 0.07)} L ${n(x + w * 0.5)} ${n(yB)} Z" fill="${dk}"/>`;
  s += `<path d="M ${n(x - w * 0.42)} ${n(yB - h * 0.07)} L ${n(x - w * 0.34)} ${n(yB - h * 0.15)} L ${n(x + w * 0.34)} ${n(yB - h * 0.15)} L ${n(x + w * 0.42)} ${n(yB - h * 0.07)} Z" fill="${shade(c, -0.16)}"/>`;
  s += `<rect x="${n(x - w * 0.34)}" y="${n(yB - h * 0.16)}" width="${n(w * 0.68)}" height="2.4" fill="#fff" opacity="0.22"/>`;

  if (type === 'knight') {
    // шея и голова коня — самый узнаваемый силуэт
    s += `<path d="M ${n(x - w * 0.3)} ${n(yB - h * 0.15)}
      C ${n(x - w * 0.42)} ${n(yB - h * 0.34)} ${n(x - w * 0.34)} ${n(yB - h * 0.46)} ${n(x - w * 0.3)} ${n(yB - h * 0.52)}
      L ${n(x - w * 0.2)} ${n(yB - h * 0.62)} L ${n(x - w * 0.24)} ${n(yB - h * 0.72)}
      C ${n(x - w * 0.02)} ${n(yB - h * 0.78)} ${n(x + w * 0.3)} ${n(yB - h * 0.74)} ${n(x + w * 0.42)} ${n(yB - h * 0.62)}
      C ${n(x + w * 0.5)} ${n(yB - h * 0.56)} ${n(x + w * 0.42)} ${n(yB - h * 0.5)} ${n(x + w * 0.3)} ${n(yB - h * 0.5)}
      C ${n(x + w * 0.34)} ${n(yB - h * 0.44)} ${n(x + w * 0.3)} ${n(yB - h * 0.36)} ${n(x + w * 0.2)} ${n(yB - h * 0.34)}
      C ${n(x + w * 0.28)} ${n(yB - h * 0.3)} ${n(x + w * 0.3)} ${n(yB - h * 0.22)} ${n(x + w * 0.2)} ${n(yB - h * 0.18)}
      L ${n(x + w * 0.26)} ${n(yB - h * 0.15)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(x - w * 0.2)} ${n(yB - h * 0.72)} l ${n(w * 0.1)} ${n(-h * 0.06)} l ${n(-w * 0.02)} ${n(h * 0.08)} Z" fill="${c}"/>`;
    s += `<circle cx="${n(x + w * 0.2)}" cy="${n(yB - h * 0.64)}" r="${n(w * 0.05)}" fill="#100c08"/>`;
    s += `<path d="M ${n(x - w * 0.3)} ${n(yB - h * 0.15)} C ${n(x - w * 0.36)} ${n(yB - h * 0.34)} ${n(x - w * 0.3)} ${n(yB - h * 0.46)} ${n(x - w * 0.26)} ${n(yB - h * 0.52)}" stroke="#fff" stroke-width="3" fill="none" opacity="0.16"/>`;
    return s;
  }

  // корпус: перехваченная ваза
  s += `<path d="M ${n(x - w * 0.34)} ${n(yB - h * 0.15)}
    C ${n(x - w * 0.42)} ${n(yB - h * 0.3)} ${n(x - w * 0.2)} ${n(yB - h * 0.42)} ${n(x - w * 0.19)} ${n(yB - h * 0.5)}
    L ${n(x - w * 0.24)} ${n(yT)} L ${n(x + w * 0.24)} ${n(yT)}
    C ${n(x + w * 0.2)} ${n(yB - h * 0.42)} ${n(x + w * 0.42)} ${n(yB - h * 0.3)} ${n(x + w * 0.34)} ${n(yB - h * 0.15)} Z" fill="${c}"/>`;
  s += `<path d="M ${n(x - w * 0.2)} ${n(yB - h * 0.34)} C ${n(x - w * 0.06)} ${n(yB - h * 0.32)} ${n(x + w * 0.06)} ${n(yB - h * 0.32)} ${n(x + w * 0.2)} ${n(yB - h * 0.34)}"
    stroke="${dk}" stroke-width="2.6" fill="none" opacity="0.5"/>`;
  s += `<path d="M ${n(x - w * 0.36)} ${n(yB - h * 0.17)} C ${n(x - w * 0.44)} ${n(yB - h * 0.3)} ${n(x - w * 0.22)} ${n(yB - h * 0.44)} ${n(x - w * 0.2)} ${n(yB - h * 0.5)}"
    stroke="#fff" stroke-width="3.4" fill="none" opacity="0.18"/>`;
  // венчик у плеч
  s += `<rect x="${n(x - w * 0.27)}" y="${n(yT - h * 0.035)}" width="${n(w * 0.54)}" height="${n(h * 0.045)}" rx="2" fill="${shade(c, 0.22)}"/>`;

  if (type === 'pawn') {
    s += `<circle cx="${n(x)}" cy="${n(yT - h * 0.11)}" r="${n(w * 0.24)}" fill="${c}"/>`;
    s += `<circle cx="${n(x - w * 0.08)}" cy="${n(yT - h * 0.15)}" r="${n(w * 0.08)}" fill="#fff" opacity="0.2"/>`;
  } else if (type === 'rook') {
    const t = yT - h * 0.035;
    s += `<path d="M ${n(x - w * 0.24)} ${n(t)} L ${n(x - w * 0.24)} ${n(t - h * 0.2)} L ${n(x - w * 0.1)} ${n(t - h * 0.2)}
      L ${n(x - w * 0.1)} ${n(t - h * 0.12)} L ${n(x)} ${n(t - h * 0.12)} L ${n(x)} ${n(t - h * 0.2)}
      L ${n(x + w * 0.1)} ${n(t - h * 0.2)} L ${n(x + w * 0.1)} ${n(t - h * 0.12)} L ${n(x + w * 0.24)} ${n(t - h * 0.12)}
      L ${n(x + w * 0.24)} ${n(t - h * 0.2)} L ${n(x + w * 0.3)} ${n(t - h * 0.2)} L ${n(x + w * 0.3)} ${n(t)} Z" fill="${c}"/>`;
    s += `<rect x="${n(x - w * 0.3)}" y="${n(t - h * 0.035)}" width="${n(w * 0.6)}" height="${n(h * 0.035)}" fill="${shade(c, 0.24)}"/>`;
  } else if (type === 'bishop') {
    const t = yT - h * 0.035;
    s += `<path d="M ${n(x)} ${n(t - h * 0.34)} C ${n(x + w * 0.22)} ${n(t - h * 0.2)} ${n(x + w * 0.2)} ${n(t - h * 0.04)} ${n(x)} ${n(t - h * 0.04)}
      C ${n(x - w * 0.2)} ${n(t - h * 0.04)} ${n(x - w * 0.22)} ${n(t - h * 0.2)} ${n(x)} ${n(t - h * 0.34)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(x)} ${n(t - h * 0.28)} L ${n(x)} ${n(t - h * 0.1)}" stroke="${dk}" stroke-width="3" opacity="0.6"/>`;
    s += `<circle cx="${n(x)}" cy="${n(t - h * 0.37)}" r="${n(w * 0.1)}" fill="${c}"/>`;
    s += `<path d="M ${n(x - w * 0.14)} ${n(t - h * 0.24)} C ${n(x - w * 0.18)} ${n(t - h * 0.14)} ${n(x - w * 0.12)} ${n(t - h * 0.08)} ${n(x - w * 0.1)} ${n(t - h * 0.06)}" stroke="#fff" stroke-width="3" fill="none" opacity="0.18"/>`;
  } else if (type === 'queen') {
    const t = yT - h * 0.035;
    // корона с пятью зубцами и шариками
    const tip = t - h * 0.3;
    s += `<path d="M ${n(x - w * 0.28)} ${n(t)}
      L ${n(x - w * 0.32)} ${n(tip + h * 0.06)} L ${n(x - w * 0.17)} ${n(tip + h * 0.15)}
      L ${n(x - w * 0.06)} ${n(tip)} L ${n(x)} ${n(tip + h * 0.13)} L ${n(x + w * 0.06)} ${n(tip)}
      L ${n(x + w * 0.17)} ${n(tip + h * 0.15)} L ${n(x + w * 0.32)} ${n(tip + h * 0.06)} L ${n(x + w * 0.28)} ${n(t)} Z" fill="${c}"/>`;
    for (const [bx, by] of [[-w * 0.32, tip + h * 0.06], [-w * 0.17, tip + h * 0.15], [0, tip + h * 0.13], [w * 0.17, tip + h * 0.15], [w * 0.32, tip + h * 0.06]]) {
      s += `<circle cx="${n(x + bx)}" cy="${n(by - w * 0.08)}" r="${n(w * 0.1)}" fill="${c}"/>`;
    }
    s += `<rect x="${n(x - w * 0.28)}" y="${n(t - h * 0.02)}" width="${n(w * 0.56)}" height="${n(h * 0.04)}" fill="${shade(c, 0.24)}"/>`;
  } else {
    // король: корона и крест
    const t = yT - h * 0.035;
    s += `<path d="M ${n(x - w * 0.26)} ${n(t)} L ${n(x - w * 0.26)} ${n(t - h * 0.12)} L ${n(x - w * 0.12)} ${n(t - h * 0.18)}
      L ${n(x)} ${n(t - h * 0.12)} L ${n(x + w * 0.12)} ${n(t - h * 0.18)} L ${n(x + w * 0.26)} ${n(t - h * 0.12)} L ${n(x + w * 0.26)} ${n(t)} Z" fill="${c}"/>`;
    s += `<path d="M ${n(x)} ${n(t - h * 0.4)} L ${n(x)} ${n(t - h * 0.1)} M ${n(x - w * 0.1)} ${n(t - h * 0.3)} L ${n(x + w * 0.1)} ${n(t - h * 0.3)}"
      stroke="${c}" stroke-width="${n(w * 0.16)}" stroke-linecap="round"/>`;
    s += `<rect x="${n(x - w * 0.26)}" y="${n(t - h * 0.02)}" width="${n(w * 0.52)}" height="${n(h * 0.04)}" fill="${shade(c, 0.24)}"/>`;
    s += sparkle(x, t - h * 0.42, w * 0.16, 0.5);
  }
  void lt;
  void rnd;
  return s;
}
