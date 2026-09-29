// Отрисовка кладовки: несколько предметов, уложенных вразнобой в одном проёме.
//
// Каждая фигура из tools/art/shapes-*.js рисуется от общей точки
// (STAGE.cx, STAGE.base). Чтобы поставить её в другое место, переносим именно
// эту точку в нужную позицию, а масштаб и поворот крутим вокруг неё — тогда
// тень предмета остаётся под самим предметом.

import { makeRng } from '../../src/rng.js';
import { CATALOG } from '../../src/catalog.js';
import { PALETTES, STAGE, OPEN, n, lerp } from './lib.js';
import { defs, scene, wrap } from './scene.js';
import { CHEAP1 } from './shapes-cheap1.js';
import { CHEAP2 } from './shapes-cheap2.js';
import { MID } from './shapes-mid.js';
import { RICH } from './shapes-rich.js';

const SHAPES = { ...CHEAP1, ...CHEAP2, ...MID, ...RICH };
const BY_ID = new Map(CATALOG.map((i) => [i.id, i]));

const LEFT = OPEN.x;
const RIGHT = OPEN.x + OPEN.w;
const BOTTOM = OPEN.y + OPEN.h;

/**
 * Раскладка предметов по полу проёма.
 * Возвращает позиции в порядке отрисовки: дальние (мельче, выше) первыми.
 */
// Сколько предметов работает первым планом: именно они закрывают остальные.
export function frontCount(count) {
  return count >= 13 ? 4 : 3;
}

function layout(count, rnd) {
  const slots = [];
  const pad = 10;
  const front = frontCount(count);
  const back = count - front;

  for (let i = 0; i < count; i++) {
    const isFront = i >= back;
    const group = isFront ? front : back;
    const inGroup = isFront ? i - back : i;
    // Положение внутри своей группы: 0 — дальний край, 1 — ближний.
    const u = group === 1 ? 0.65 : inGroup / (group - 1);
    const d = Math.max(0, Math.min(1, u + rnd.range(-0.08, 0.08)));

    // Передние — крупные: три-четыре больших предмета должны перекрыть
    // остальные, чтобы задний план читался как завал, а не как набор
    // одинаково видимых фигур. Разброс внутри группы широкий, иначе стена.
    const scale = isFront
      ? lerp(0.50, 0.74, d) * rnd.range(0.94, 1.06)
      : lerp(0.30, 0.56, d) * rnd.range(0.92, 1.08);
    const rot = rnd.range(-16, 16) * (0.45 + 0.55 * d);

    // Габарит повёрнутой фигуры относительно её точки опоры. Считаем по
    // углам, потому что предмет у косяка иначе уезжает за проём и на превью
    // его попросту не видно — ширины проёма на всех не хватает.
    const rad = (rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const halfW = (STAGE.w * scale) / 2;
    const h = STAGE.h * scale;
    let dxMin = Infinity, dxMax = -Infinity, dyMin = Infinity, dyMax = -Infinity;
    for (const lx of [-halfW, halfW]) {
      for (const ly of [-h, 0]) {
        const dx = lx * cos - ly * sin;
        const dy = lx * sin + ly * cos;
        if (dx < dxMin) dxMin = dx;
        if (dx > dxMax) dxMax = dx;
        if (dy < dyMin) dyMin = dy;
        if (dy > dyMax) dyMax = dy;
      }
    }

    const minX = LEFT - dxMin + pad;
    const maxX = RIGHT - dxMax - pad;
    const minY = OPEN.y - dyMin + pad;
    const maxY = BOTTOM - dyMax - pad;

    // Задние расползаются от края до края — они должны заполнять проём.
    // Передние тоже идут на всю ширину: прижатые к середине три крупных
    // предмета оставляют по краям щели, сквозь которые видно каждую заднюю
    // фигуру целиком, и завал рассыпается.
    const midX = (minX + maxX) / 2;
    const spread = isFront ? 0.85 : 0.98;
    const x = midX + (rnd() - 0.5) * (maxX - minX) * spread;
    // Слои стоят на разной глубине у самой двери, поэтому задние приподняты
    // над передними и выглядывают из-под них сверху.
    const yPref = isFront ? lerp(450, 500, d) : lerp(342, 400, d);
    const y = Math.min(maxY, Math.max(minY, yPref));

    slots.push({ x, y, scale, rot, d, front: isFront });
  }
  // Порядок отрисовки — строго по слоям, а не по высоте: иначе задний предмет
  // с бо́льшим y нарисуется поверх переднего и перекроет первый план.
  slots.sort((a, b) => (a.front === b.front ? a.y - b.y : a.front ? 1 : -1));
  return slots;
}
/** Куча тряпья/обломков под кладовкой, чтобы низ не зиял пустотой */
function heap(rnd, count) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = rnd.range(LEFT + 30, RIGHT - 30);
    const y = rnd.range(BOTTOM - 40, BOTTOM - 8);
    const w = rnd.range(30, 90);
    s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(w * 0.5)}" ry="${n(rnd.range(5, 11))}"
      fill="#3a2f22" opacity="${n(rnd.range(0.3, 0.5))}"/>`;
  }
  return s;
}

/**
 * Собрать SVG кладовки.
 * @param pile  состав из src/pile.js
 * @param seed  ключ для детерминированного рандома раскладки
 */
export function renderPile(pile, seed) {
  const rnd = makeRng(`pile-art/${seed}`);
  const pal = PALETTES[pile.shownTier] || PALETTES.cheap;
  const slots = layout(pile.count, rnd);

  let items = '';
  pile.items.forEach((entry, i) => {
    const slot = slots[i];
    const meta = BY_ID.get(entry.lotId);
    if (!meta) return;
    const draw = SHAPES[meta.s];
    if (typeof draw !== 'function') return;

    // Свой ГПСЧ на предмет: та же картинка, что и в одиночном превью.
    const art = draw({ rnd: makeRng(meta.seed), pal, cx: STAGE.cx, base: STAGE.base });
    if (typeof art !== 'string' || !art.length) return;

    // Точка опоры фигуры — (STAGE.cx, STAGE.base). Переносим её в слот,
    // а масштаб и поворот крутим уже вокруг неё, иначе тень уезжает из-под
    // предмета. Порядок: сначала сдвиг, потом поворот, потом масштаб.
    // data-layer нужен проверкам раскладки: отличить первый план от заднего
    // по размеру нельзя, группы по масштабу пересекаются.
    items += `<g data-layer="${slot.front ? 'front' : 'back'}" transform="translate(${n(slot.x)} ${n(slot.y)})
      rotate(${n(slot.rot)}) scale(${n(slot.scale)})
      translate(${n(-STAGE.cx)} ${n(-STAGE.base)})"
      opacity="${n(slot.front ? 0.97 : 0.74 + slot.d * 0.13)}">${art}</g>`;
  });

  const art = heap(rnd, 4 + pile.count) + items;
  return wrap(defs(pal) + scene({ pal, rnd, item: art }), pal);
}
