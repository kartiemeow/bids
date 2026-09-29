// Скрытая ценность и маскировка.
//
// Главная идея: игрок видит картинку и не знает цену. Тир картинки
// (cheap/mid/rich) определяет только художественный стиль, настоящая стоимость
// живёт здесь. Дешёвая коробка может лежать в кладовке с золотом, поэтому
// цену нельзя выводить из src/catalog.js — она обязана быть отдельной величиной
// со своим ГПСЧ и своей шкалой.

import { makeRng } from './rng.js';

// Полосы стоимости одного предмета. Внутри полосы разброс большой, чтобы знание
// полосы не гарантировало успех: между 2 и 20 разница вдесятеро.
//
// Шкала подобрана под 10–15 предметов в кладовке: сумма кладовки держится
// примерно в тех же пределах, что и при 2–6 предметах, поэтому капитал,
// доход и ставки остаются сопоставимыми на всех 15 раундах. Менять предметов
// в кладовке можно только вместе с пересчётом этих полос.
export const BANDS = [
  { id: 'junk',  label: 'Хлам',        min: 2,   max: 20,   tint: '#4b5563' },
  { id: 'low',   label: 'Скромная',    min: 20,  max: 70,   tint: '#6ee7b7' },
  { id: 'mid',   label: 'Солидная',    min: 70,  max: 225,  tint: '#60a5fa' },
  { id: 'high',  label: 'Крупная',     min: 225, max: 580,  tint: '#c084fc' },
  { id: 'vault', label: 'Удивительно', min: 580, max: 1350, tint: '#fbbf24' },
  { id: 'legend',label: 'Легенда',     min: 1350, max: 2900, tint: '#f472b6' },
];

export function bandById(id) {
  return BANDS.find((b) => b.id === id) || BANDS[0];
}

// Настоящий «класс» лота: три ступени на вид, шесть полос на деньги.
// Картинка рисуется по этому классу, а не по полосе — иначе обмана нет.
const BAND_TIER = {
  junk: 'cheap', low: 'cheap', mid: 'mid',
  high: 'rich', vault: 'rich', legend: 'rich',
};

export function trueTierOf(bandId) {
  return BAND_TIER[bandId];
}

// Маскировка. С настоящего класса выбираем тир картинки так, чтобы игрок
// систематически ошибался: дорогому предмету чаще показывают дешёвую картинку.
const MASK_FOR_TIER = {
  cheap: { cheap: 0.55, mid: 0.35, rich: 0.10 },
  mid:   { cheap: 0.40, mid: 0.42, rich: 0.18 },
  rich:  { cheap: 0.18, mid: 0.40, rich: 0.42 },
};

export function maskTierFor(rnd, bandId) {
  const table = MASK_FOR_TIER[trueTierOf(bandId)];
  let roll = rnd();
  for (const tier of ['cheap', 'mid', 'rich']) {
    roll -= table[tier];
    if (roll <= 0) return tier;
  }
  return 'cheap';
}

// Бросок одной полосы по таблице весов. Таблица — объект { bandId: weight }.
export function rollBandId(rnd, weights) {
  let total = 0;
  for (const k in weights) total += weights[k];
  let roll = rnd() * total;
  for (const band of BANDS) {
    roll -= weights[band.id] || 0;
    if (roll <= 0) return band.id;
  }
  return 'junk';
}

// Цена одного предмета. Смещение к нижнему краю полосы, но не прилипание к нему:
// чаще попадается начало диапазона, верхний край — редкость.
export function rollValue(rnd, weights) {
  const bandId = rollBandId(rnd, weights);
  const band = bandById(bandId);
  const t = Math.pow(rnd(), 1.45);
  return { value: Math.round(band.min + t * (band.max - band.min)), bandId };
}

// ── Кладовка целиком ──────────────────────────────────────────────────
// Полоса кладовки задаёт не сумму, а микс предметов внутри. Так суммарная
// цена распределяется естественно, а не подгоняется под круглое число.

export const PILE_BANDS = [
  { id: 'trash',    label: 'Хлам в углу',  weight: 24, min: 10, max: 12, tint: '#4b5563' },
  { id: 'modest',   label: 'Скромная',     weight: 27, min: 10, max: 13, tint: '#6ee7b7' },
  { id: 'solid',    label: 'Солидная',     weight: 23, min: 11, max: 14, tint: '#60a5fa' },
  { id: 'big',      label: 'Крупная',      weight: 16, min: 12, max: 14, tint: '#c084fc' },
  { id: 'treasure', label: 'Сокровище',    weight: 10, min: 13, max: 15, tint: '#fbbf24' },
];

// Веса полос предметов внутри кладовки. Сокровище — это не « дорогой предмет,
// показанный красиво», а несколько крупных вещей, спрятанных среди хлама.
const PILE_MIX = {
  trash:    { junk: 62, low: 28, mid: 8,   high: 2,   vault: 0,  legend: 0 },
  modest:   { junk: 34, low: 44, mid: 17,  high: 5,   vault: 0,  legend: 0 },
  solid:    { junk: 15, low: 34, mid: 34,  high: 14,  vault: 3,  legend: 0 },
  big:      { junk: 6,  low: 19, mid: 36,  high: 28,  vault: 10, legend: 1 },
  treasure: { junk: 10, low: 18, mid: 28,  high: 28,  vault: 14, legend: 2 },
};

export function pileBandById(id) {
  return PILE_BANDS.find((b) => b.id === id) || PILE_BANDS[0];
}

export function rollPileBand(rnd) {
  let total = PILE_BANDS.reduce((s, b) => s + b.weight, 0);
  let roll = rnd() * total;
  for (const band of PILE_BANDS) {
    roll -= band.weight;
    if (roll <= 0) return band;
  }
  return PILE_BANDS[0];
}

export function mixFor(pileBandId) {
  return PILE_MIX[pileBandId] || PILE_MIX.solid;
}

export const TIER_LABEL = { cheap: 'Дешёвый вид', mid: 'Средний вид', rich: 'Дорогой вид' };
