// Контактный лист: раскладка всех 100 превью в сетку SVG для быстрой проверки.
// Запуск: npm run gen:sheet  ->  preview/sheet-1..4.svg (открываются в браузере)
//
// Зависимостей нет: каждый кадр — вложенный <svg> с viewBox превью.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATALOG } from '../src/catalog.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const IMG = join(HERE, '..', 'public', 'img');
const OUT = join(HERE, '..', 'preview');

const COLS = 5;
const ROWS = 5;
const PER = COLS * ROWS;
const TW = 300;
const TH = 225;
const GAP = 12;
const LABEL = 20;

function escapeXml(s) {
  return s.replace(/[<>&"']/g, (ch) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch]
  ));
}

function buildSheet(items) {
  const w = COLS * TW + (COLS + 1) * GAP;
  const h = ROWS * (TH + LABEL + GAP) + GAP;
  const cells = items
    .map((item, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const x = GAP + c * (TW + GAP);
      const y = GAP + r * (TH + LABEL + GAP);
      const svg = readFileSync(join(IMG, `${item.id}.svg`), 'utf8');
      const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      return `<g>
  <svg x="${x}" y="${y}" width="${TW}" height="${TH}" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">${inner}</svg>
  <rect x="${x}" y="${y + TH + 2}" width="${TW}" height="${LABEL}" fill="#141414"/>
  <text x="${x + 5}" y="${y + TH + 16}" font-family="Consolas,monospace" font-size="13" fill="#e8d9a8">${item.id} ${escapeXml(item.n)}</text>
</g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#1a1a1a"/>${cells}</svg>`;
}

function main() {
  const files = readdirSync(IMG).filter((f) => f.endsWith('.svg'));
  if (files.length !== CATALOG.length) {
    throw new Error(`Ожидалось ${CATALOG.length} SVG, найдено ${files.length}`);
  }
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const pages = Math.ceil(CATALOG.length / PER);
  for (let p = 0; p < pages; p++) {
    const items = CATALOG.slice(p * PER, (p + 1) * PER);
    const file = join(OUT, `sheet-${p + 1}.svg`);
    writeFileSync(file, buildSheet(items), 'utf8');
    console.log(`Лист ${p + 1}/${pages}: ${file}`);
  }
}

main();
