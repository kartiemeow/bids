// Геометрия раскладки кладовки.
//
// Внутри светового проёма должно быть видно не меньше половины каждого
// предмета. Меньше — значит фигура уехала за косяк и на превью её не видно,
// даже если трансформация формально корректна.

import { CATALOG } from '../src/catalog.js';
import { makePile } from '../src/pile.js';
import { makeRng } from '../src/rng.js';
import { renderPile, frontCount } from './art/pile-art.js';
import { OPEN, STAGE } from './art/lib.js';

const MIN_VISIBLE = 0.5;      // доля площади предмета, которая должна быть видна
const MIN_COVERED = 0.5;      // доля задних предметов, которую должен закрыть передний план

// Отсечение выпуклого многоугольника прямоугольником (Сазерленд–Ходжман).
function clipToOpen(poly) {
  const edges = [
    (p) => p.x >= OPEN.x,
    (p) => p.x <= OPEN.x + OPEN.w,
    (p) => p.y >= OPEN.y,
    (p) => p.y <= OPEN.y + OPEN.h,
  ];
  const cuts = [
    (a, b) => ({ x: OPEN.x, y: a.y + ((b.y - a.y) * (OPEN.x - a.x)) / (b.x - a.x) }),
    (a, b) => ({ x: OPEN.x + OPEN.w, y: a.y + ((b.y - a.y) * (OPEN.x + OPEN.w - a.x)) / (b.x - a.x) }),
    (a, b) => ({ x: a.x + ((b.x - a.x) * (OPEN.y - a.y)) / (b.y - a.y), y: OPEN.y }),
    (a, b) => ({ x: a.x + ((b.x - a.x) * (OPEN.y + OPEN.h - a.y)) / (b.y - a.y), y: OPEN.y + OPEN.h }),
  ];

  let out = poly;
  for (let e = 0; e < 4; e++) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const curIn = edges[e](cur);
      const prevIn = edges[e](prev);
      if (curIn) {
        if (!prevIn) out.push(cuts[e](prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(cuts[e](prev, cur));
      }
    }
    if (!out.length) return [];
  }
  return out;
}

function area(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

// Прямоугольник фигуры до трансформации: от (cx - w/2, base - h) до (cx, base).
const BOX = [
  { x: STAGE.cx - STAGE.w / 2, y: STAGE.base - STAGE.h },
  { x: STAGE.cx + STAGE.w / 2, y: STAGE.base - STAGE.h },
  { x: STAGE.cx + STAGE.w / 2, y: STAGE.base },
  { x: STAGE.cx - STAGE.w / 2, y: STAGE.base },
];

function visibleFraction(sx, sy, rot, s) {
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const quad = BOX.map((p) => {
    const ax = (p.x - STAGE.cx) * s;
    const ay = (p.y - STAGE.base) * s;
    return { x: sx + ax * cos - ay * sin, y: sy + ax * sin + ay * cos };
  });
  const total = area(quad);
  if (!total) return 0;
  return area(clipToOpen(quad)) / total;
}

// Какая доля площади заднего предмета остаётся на виду, если поверх него
// положить габариты передних. Считаем решёткой по самому повёрнутому
// прямоугольнику, а не по AABB, — иначе метрика слишком щедрая.
function visibleShareOfBack(box, frontBoxes) {
  const rad = (box.rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const halfW = (STAGE.w * box.scale) / 2;
  const h = STAGE.h * box.scale;
  const N = 10;
  let open = 0;
  let total = 0;
  for (let a = 1; a < N; a++) {
    for (let b = 1; b < N; b++) {
      const lx = -halfW + (2 * halfW * a) / N;
      const ly = -h + (h * b) / N;
      const x = box.x + lx * cos - ly * sin;
      const y = box.y + lx * sin + ly * cos;
      total++;
      const hidden = frontBoxes.some((f) => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
      if (!hidden) open++;
    }
  }
  return total ? open / total : 0;
}

// AABB предмета после трансформации — грубо, но достаточно, чтобы понять,
// накрывает ли передний план задний.
function boxOf(sx, sy, rot, s) {
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const halfW = (STAGE.w * s) / 2;
  const h = STAGE.h * s;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const lx of [-halfW, halfW]) {
    for (const ly of [-h, 0]) {
      const x = sx + lx * cos - ly * sin;
      const y = sy + lx * sin + ly * cos;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

// Стабильный набор неповторяющихся предметов на нужный состав.
// Состав задаётся профилем кладовки, поэтому раскладку надо проверять ровно на
// том, что реально выпадает в игре: столько крупных, столько средних, столько
// мелочи, а не на плоском списке каталога.
function drawFactory(rnd) {
  const byTier = { rich: [], mid: [], cheap: [] };
  for (const it of CATALOG) byTier[it.t].push(it);
  for (const t of ['rich', 'mid', 'cheap']) {
    const p = byTier[t];
    for (let i = p.length - 1; i > 0; i--) {
      const j = rnd.int(0, i);
      [p[i], p[j]] = [p[j], p[i]];
    }
  }
  const at = { rich: 0, mid: 0, cheap: 0 };
  return (profile) => {
    const out = [];
    for (const t of ['rich', 'mid', 'cheap']) {
      const n = profile[t] || 0;
      const p = byTier[t];
      if (at[t] + n > p.length) at[t] = 0; // добор, если раундов больше лотов
      for (let k = 0; k < n; k++) out.push(p[at[t]++]);
    }
    return out;
  };
}

// Слой читаем из самого SVG: у каждой фигуры он проставлен явно.
const RE = /data-layer="(front|back)"\s+transform="translate\(([-\d.]+)\s+([-\d.]+)\)\s*rotate\(([-\d.]+)\)\s*scale\(([-\d.]+)\)/g;

let checked = 0;
let worst = 1;
let worstInfo = '';
const failures = [];
const fracs = [];
const counts = new Map();   // сколько предметов в кладовке -> раз
const frontSeen = new Map();// сколько передних предметов -> раз
let coveredTotal = 0;
let shareSum = 0;
let backTotal = 0;
let buried = 0;        // задних предметов видно меньше 2 % — считаем погребёнными
let partlyVisible = 0; // задних предметов видно больше 55 %
let readable = 0;      // задних предметов видно больше 15 % — их видно как предметы

for (let seed = 1; seed <= 300; seed++) {
  const rng = makeRng(`layout/${seed}`);
  const pile = makePile(rng, drawFactory(rng));
  const svg = renderPile(pile, seed);

  RE.lastIndex = 0;
  let m;
  const front = [];
  const back = [];
  while ((m = RE.exec(svg))) {
    const layer = m[1];
    const sx = Number(m[2]);
    const sy = Number(m[3]);
    const rot = Number(m[4]);
    const s = Number(m[5]);
    const frac = visibleFraction(sx, sy, rot, s);
    checked++;
    fracs.push(frac);
    const entry = { x: sx, y: sy, rot, scale: s, ...boxOf(sx, sy, rot, s) };
    (layer === 'front' ? front : back).push(entry);
    if (frac < worst) {
      worst = frac;
      worstInfo = `seed ${seed}: x=${m[2]} y=${m[3]} rot=${m[4]} scale=${m[5]}`;
    }
    if (frac < MIN_VISIBLE) {
      failures.push(`seed ${seed} (${pile.count} шт.): видно ${(frac * 100).toFixed(0)}% — x=${m[2]} y=${m[3]} rot=${m[4]} scale=${m[5]}`);
    }
  }

  // Переднего плана должно быть ровно столько, сколько обещала раскладка.
  counts.set(pile.count, (counts.get(pile.count) || 0) + 1);
  const wantFront = frontCount(pile.count);
  frontSeen.set(front.length, (frontSeen.get(front.length) || 0) + 1);
  if (front.length !== wantFront) {
    failures.push(`seed ${seed}: передних предметов ${front.length}, ожидалось ${wantFront}`);
  }

  // Задний предмет закрыт тем сильнее, чем меньше от него остаётся видно.
  // Считаем площадь, а не попадание центра: иначе куча схлопнется в 3–4
  // предмета и перестанет читаться как завал.
  for (const b of back) {
    backTotal++;
    const share = visibleShareOfBack(b, front);
    if (share > 0.15) readable++;
    if (share > 0.55) partlyVisible++;
    if (share < 0.02) buried++;
    shareSum += share;
  }
}

console.log(`\nПроверено предметов: ${checked} (300 кладовок)`);
console.log('размер кладовок: ' + [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([c, n]) => `${c}×${n}`).join('  '));
console.log('передних предметов: ' + [...frontSeen.entries()].sort((a, b) => a[0] - b[0]).map(([c, n]) => `${c}×${n}`).join('  '));
const covered = backTotal ? 1 - shareSum / backTotal : 1;
const pct = (n) => (backTotal ? ((n / backTotal) * 100).toFixed(0) + '%' : '—');
console.log('задних предметов: ' + backTotal);
console.log(`передним планом закрыто в среднем: ${(covered * 100).toFixed(0)}% площади задних`);
console.log(`  видно больше 55 % площади: ${partlyVisible} (${pct(partlyVisible)}) — читаются как отдельные вещи`);
console.log(`  видно больше 15 % площади: ${readable} (${pct(readable)}) — угадывается форма`);
console.log(`  видно меньше 2 %:         ${buried} (${pct(buried)}) — погребены полностью`);
console.log(`Худший случай видимости в проёме: ${(worst * 100).toFixed(0)}% — ${worstInfo}`);

// Распределение: если почти всё в верхней корзине, куча слипается в строчку.
const BUCKETS = [[0, 0.5], [0.5, 0.7], [0.7, 0.85], [0.85, 0.95], [0.95, 1.01]];
console.log('распределение доли видимой площади:');
for (const [lo, hi] of BUCKETS) {
  const n = fracs.filter((f) => f >= lo && f < hi).length;
  const bar = '█'.repeat(Math.round((n / checked) * 40));
  console.log(`  ${String(Math.round(lo * 100)).padStart(3)}–${String(Math.round(hi * 100)).padStart(3)}%  ${String(n).padStart(4)}  ${bar}`);
}

if (failures.length) {
  console.log(`\nМало видно (порог ${MIN_VISIBLE * 100}%): ${failures.length}`);
  for (const f of failures.slice(0, 8)) console.log('  ' + f);
  process.exit(1);
}
if (covered < MIN_COVERED) {
  console.log(`\nПередний план закрывает только ${(covered * 100).toFixed(0)}% задних, нужно ${MIN_COVERED * 100}%`);
  process.exit(1);
}
console.log('Все предметы в проёме, передний план закрывает задний.');
