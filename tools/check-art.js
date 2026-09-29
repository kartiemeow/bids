// Проверка сгенерированных SVG без просмотра глазами:
// 1) XML-каркас сбалансирован,
// 2) нет NaN / undefined / Infinity,
// 3) координаты фигуры в пределах сцены (без <defs> и без transform),
// 4) у каждого лота свой id фигуры.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/rng.js';
import { CATALOG } from '../src/catalog.js';
import { PALETTES, STAGE, OPEN } from './art/lib.js';
import { CHEAP1 } from './art/shapes-cheap1.js';
import { CHEAP2 } from './art/shapes-cheap2.js';
import { MID } from './art/shapes-mid.js';
import { RICH } from './art/shapes-rich.js';

const SHAPES = { ...CHEAP1, ...CHEAP2, ...MID, ...RICH };
const HERE = dirname(fileURLToPath(import.meta.url));
const IMG = join(HERE, '..', 'public', 'img');

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'ellipse', 'rect',
  'line', 'polygon', 'polyline', 'stop', 'use', 'image']);

let problems = 0;
const warn = (msg) => { problems++; console.log('  ПРОБЛЕМА: ' + msg); };

function checkTags(svg, id) {
  const stack = [];
  const re = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(svg))) {
    const [, close, name, attrs, selfClose] = m;
    if (close) {
      const top = stack.pop();
      if (top !== name) { warn(`${id}: </${name}> закрывает <${top}>`); return; }
    } else if (!selfClose && !VOID.has(name)) {
      stack.push(name);
    }
    if (/="[^"]*$/.test(attrs)) { warn(`${id}: незакрытая кавычка в <${name}>`); return; }
  }
  if (stack.length) warn(`${id}: не закрыты ${stack.join(',')}`);
  if (!/^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg)) warn(`${id}: нет корневого <svg>`);
}

function checkNumbers(svg, id) {
  for (const bad of ['NaN', 'undefined', 'Infinity', '"null"']) {
    if (svg.includes(bad)) {
      const i = svg.indexOf(bad);
      warn(`${id}: "${bad}" → …${svg.slice(Math.max(0, i - 90), i + 40).replace(/\s+/g, ' ')}…`);
    }
  }
}

// Матрица из атрибута transform: [a, b, c, d, e, f], где
// x' = a·x + c·y + e, y' = b·x + d·y + f. Фигуры рисуются через
// translate/scale/rotate, поэтому наивный разбор координат даёт ложные
// срабатывания: локальное x = -24 внутри отражённой группы — это не выход за
// сцену. Координаты приводим к мировым, и только их проверяем.
const mul = (p, q) => [
  p[0] * q[0] + p[2] * q[1],
  p[1] * q[0] + p[3] * q[1],
  p[0] * q[2] + p[2] * q[3],
  p[1] * q[2] + p[3] * q[3],
  p[0] * q[4] + p[2] * q[5] + p[4],
  p[1] * q[4] + p[3] * q[5] + p[5],
];

function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0];
  for (const fn of str.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const args = fn[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    let t = null;
    if (fn[1] === 'translate') {
      t = [1, 0, 0, 1, args[0] || 0, args[1] || 0];
    } else if (fn[1] === 'scale') {
      const sx = args.length ? args[0] : 1;
      t = [sx, 0, 0, args.length > 1 ? args[1] : sx, 0, 0];
    } else if (fn[1] === 'rotate') {
      const a = ((args[0] || 0) * Math.PI) / 180;
      const cx = args[1] || 0;
      const cy = args[2] || 0;
      t = mul(
        mul([1, 0, 0, 1, cx, cy], [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]),
        [1, 0, 0, 1, -cx, -cy],
      );
    }
    if (t) m = mul(m, t);
  }
  return m;
}

// Все координаты фигуры, приведённые к мировым.
function collectCoords(art) {
  const body = art.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  const stack = [[1, 0, 0, 1, 0, 0]];
  const out = [];
  // Поворот связывает оси, поэтому точкуtransform'им целиком, а не по осям.
  const add = (m, x, y, ctx) => {
    out.push({ kind: 'x', v: m[0] * x + m[2] * y + m[4], ctx });
    out.push({ kind: 'y', v: m[1] * x + m[3] * y + m[5], ctx });
  };
  // Имя атрибута должно совпасть целиком: иначе `cx` читается как `x`, и в
  // границы попадает ноль вместо настоящей координаты.
  const attr = (a, ...names) => {
    for (const k of names) {
      const m = new RegExp(`(?:^|\\s)${k}="(-?\\d+(?:\\.\\d+)?)"`).exec(a);
      if (m) return Number(m[1]);
    }
    return null;
  };
  const tagRe = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(body))) {
    const [, close, name, attrs] = m;
    const tagCtx = body.slice(Math.max(0, m.index - 20), m.index + 40).replace(/\s+/g, ' ');
    if (close) {
      if (name === 'g' && stack.length > 1) stack.pop();
      continue;
    }
    if (name === 'g') {
      const tf = /\stransform="([^"]*)"/.exec(attrs);
      stack.push(tf ? mul(stack[stack.length - 1], parseTransform(tf[1])) : stack[stack.length - 1]);
    }
    const mat = stack[stack.length - 1];

    // Пары «ось X — ось Y»: у rect это x/y, у circle cx/cy, у line x1/y1.
    const pair = (xNames, yNames) => {
      const px = attr(attrs, ...xNames);
      const py = attr(attrs, ...yNames);
      if (px !== null && py !== null) add(mat, px, py, tagCtx);
    };
    pair(['x'], ['y']);
    pair(['cx'], ['cy']);
    pair(['x1'], ['y1']);
    pair(['x2'], ['y2']);
    // Точки polygon/polyline — парами, иначе фигуры на polar() не проверяются.
    const pts = /(?:^|\s)points="([^"]*)"/.exec(attrs);
    if (pts) {
      const nums = pts[1].trim().split(/[\s,]+/).map(Number).filter((v) => !Number.isNaN(v));
      for (let i = 0; i + 1 < nums.length; i += 2) add(mat, nums[i], nums[i + 1], tagCtx);
    }
  }
  return out;
}

function checkBounds(art, id, name) {
  const coords = collectCoords(art);
  const xs = coords.filter((o) => o.kind === 'x');
  const ys = coords.filter((o) => o.kind === 'y');
  if (!xs.length || !ys.length) { warn(`${id} (${name}): нет координат`); return; }
  const minX = Math.min(...xs.map((o) => o.v));
  const maxX = Math.max(...xs.map((o) => o.v));
  const minY = Math.min(...ys.map((o) => o.v));
  const maxY = Math.max(...ys.map((o) => o.v));
  const out = [];
  if (minX < OPEN.x - 70) out.push(`x_min=${minX} [${xs.find((o) => o.v === minX).ctx}]`);
  if (maxX > OPEN.x + OPEN.w + 70) out.push(`x_max=${maxX} [${xs.find((o) => o.v === maxX).ctx}]`);
  if (minY < 100) out.push(`y_min=${minY} [${ys.find((o) => o.v === minY).ctx}]`);
  if (maxY > STAGE.base + 14) out.push(`y_max=${maxY} [${ys.find((o) => o.v === maxY).ctx}]`);
  if (out.length) warn(`${id} (${name}): ${out.join(' | ')}`);
}

function checkRefs(svg, id) {
  const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const refs = new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]));
  for (const r of refs) {
    if (!ids.has(r)) warn(`${id}: ссылка url(#${r}) без определения`);
  }
  const dupes = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) !== i);
  if (dupes.length) warn(`${id}: повторяющиеся id: ${[...new Set(dupes)].join(', ')}`);
}

const files = readdirSync(IMG).filter((f) => f.endsWith('.svg')).sort();
console.log(`Файлов: ${files.length}`);
if (files.length !== CATALOG.length) warn(`ожидалось ${CATALOG.length}`);

const shapes = new Set();
const sizes = [];
for (const item of CATALOG) {
  if (shapes.has(item.s)) warn(`дубль фигуры ${item.s}`);
  shapes.add(item.s);
  const draw = SHAPES[item.s];
  if (!draw) { warn(`нет функции ${item.s}`); continue; }
  const art = draw({ rnd: makeRng(item.seed), pal: PALETTES[item.t], cx: STAGE.cx, base: STAGE.base });
  checkBounds(art, item.id, item.s);
  const svg = readFileSync(join(IMG, `${item.id}.svg`), 'utf8');
  checkTags(svg, item.id);
  checkNumbers(svg, item.id);
  checkRefs(svg, item.id);
  for (const need of ['url(#opening)', 'url(#vig)', 'url(#beam)', 'url(#door)', '<svg xmlns']) {
    if (!svg.includes(need)) warn(`${item.id}: в сцене нет ${need}`);
  }
  if (art.length < 400) warn(`${item.id} (${item.s}): подозрительно мало элементов (${art.length})`);
  sizes.push([item.id, item.s, art.length]);
}

sizes.sort((a, b) => a[2] - b[2]);
console.log('\nСамые короткие фигуры:');
for (const s of sizes.slice(0, 12)) console.log(`  ${s[0]} ${s[1]} — ${s[2]} символов`);
console.log(problems ? `\nИтого замечаний: ${problems}` : '\nВсе проверки пройдены');
