// Генератор 100 превью-кладовок в public/img/lot-XXX.svg
// Запуск: npm run gen:images
//
// Одна картинка = сцена (дверь, луч фонарика, пыль, трафарет) + фигура предмета.
// Тир определяет только настроение света и богатство прорисовки, НЕ ценность лота.

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeRng } from '../src/rng.js';
import { CATALOG } from '../src/catalog.js';
import { PALETTES, STAGE } from './art/lib.js';
import { defs, scene, wrap } from './art/scene.js';
import { CHEAP1 } from './art/shapes-cheap1.js';
import { CHEAP2 } from './art/shapes-cheap2.js';
import { MID } from './art/shapes-mid.js';
import { RICH } from './art/shapes-rich.js';

const SHAPES = { ...CHEAP1, ...CHEAP2, ...MID, ...RICH };

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'public', 'img');

function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const seen = new Set();
  let bytes = 0;

  for (const item of CATALOG) {
    if (seen.has(item.s)) throw new Error(`Дубликат фигуры: ${item.s}`);
    seen.add(item.s);

    const draw = SHAPES[item.s];
    if (typeof draw !== 'function') throw new Error(`Нет функции рисования: ${item.s}`);

    const pal = PALETTES[item.t];
    const rnd = makeRng(item.seed);
    const art = draw({ rnd, pal, cx: STAGE.cx, base: STAGE.base });
    if (typeof art !== 'string' || art.length < 200) {
      throw new Error(`Фигура почти пустая: ${item.id} ${item.s}`);
    }

    const svg = wrap(defs(pal) + scene({ pal, rnd, item: art }), pal);
    const file = join(OUT, `${item.id}.svg`);
    writeFileSync(file, svg, 'utf8');
    bytes += svg.length;
  }

  console.log(`Готово: ${CATALOG.length} SVG в public/img (${(bytes / 1024).toFixed(0)} КБ)`);
}

main();
