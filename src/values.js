// Экономика аукциона: из чего складывается кладовка.
//
// Цена предмета живёт в каталоге (catalog.js, поле v) и не меняется от раунда к
// раунду. Здесь описано только то, как предметы складываются в кладовку и как
// называется получившаяся сумма.
//
// Главное отличие от прежней схемы: раньше цена каждого предмета бросалась
// заново из полосы, поэтому кладовку невозможно было выучить — только угадать.
// Теперь сумма кладовки — это просто сумма фиксированных цен, и игрок, который
// знает каталог, может прикинуть её по картинке. Неопределённость осталась в
// другом месте: предметы лежат в завале, часть завалена, а настроение сцены не
// обязано совпадать с содержимым.

import { CATALOG } from './catalog.js';

// ── Состав кладовки ────────────────────────────────────────────────────
// Профили описывают не цену, а пропорцию: сколько дорогих и сколько средних
// вещей попадёт в кладовку. Сумма после этого — следствие, а не цель, поэтому
// она честно называется по факту (см. bandForValue).

const COMPOSITIONS = [
  { id: 'junk',      weight: 24, total: [10, 12], rich: [0, 0], mid: [0, 1] },
  { id: 'modest',    weight: 27, total: [10, 13], rich: [0, 1], mid: [2, 3] },
  { id: 'solid',     weight: 23, total: [11, 14], rich: [1, 2], mid: [3, 4] },
  { id: 'big',       weight: 16, total: [12, 14], rich: [2, 3], mid: [4, 5] },
  { id: 'treasure',  weight: 10, total: [13, 15], rich: [3, 4], mid: [5, 6] },
];

const BY_TIER = {
  rich: CATALOG.filter((i) => i.t === 'rich'),
  mid: CATALOG.filter((i) => i.t === 'mid'),
  cheap: CATALOG.filter((i) => i.t === 'cheap'),
};

export const TIER_POOLS = BY_TIER;

/**
 * Разложить профиль на конкретные количества: сколько предметов всего,
 * сколько из них дорогих и средних. Остальное — дешёвые.
 */
export function rollComposition(rnd) {
  const totalWeight = COMPOSITIONS.reduce((s, c) => s + c.weight, 0);
  let roll = rnd() * totalWeight;
  let profile = COMPOSITIONS[0];
  for (const c of COMPOSITIONS) {
    roll -= c.weight;
    if (roll <= 0) { profile = c; break; }
  }

  const total = rnd.int(profile.total[0], profile.total[1]);
  const rich = rnd.int(profile.rich[0], profile.rich[1]);
  const mid = rnd.int(profile.mid[0], Math.min(profile.mid[1], total - rich));
  const cheap = Math.max(0, total - rich - mid);
  return { id: profile.id, total, rich, mid, cheap };
}

// ── Как называется сумма ───────────────────────────────────────────────
// Название выводится из настоящей суммы, поэтому в разборе оно всегда правда.

export const VALUE_BANDS = [
  { id: 'junk',     label: 'Хлам в углу', max: 300 },
  { id: 'modest',   label: 'Скромная',   max: 800 },
  { id: 'solid',    label: 'Солидная',   max: 1400 },
  { id: 'big',      label: 'Крупная',    max: 2000 },
  { id: 'treasure', label: 'Сокровище',  max: Infinity },
];

export function bandForValue(sum) {
  return VALUE_BANDS.find((b) => sum < b.max) || VALUE_BANDS[VALUE_BANDS.length - 1];
}

// ── Маскировка картинки ────────────────────────────────────────────────
// Тон сцены — намёк, а не ответ. Раньше он выбирался почти наугад, и картинка
// не значила вообще ничего: выглядевшие дорого кладовки стоили столько же,
// сколько выглядевшие дёшево, и торг превращался в лотерею. Теперь тон
// отталкивается от настоящей полосы суммы, но почти в половине случаев
// показывает другую: картинка остаётся полезной и при этом регулярно врёт.

export const MOOD_BY_BAND = ['cheap', 'cheap', 'mid', 'rich', 'rich'];
const TRUTH_RATE = 0.4;
// На какую полосу смотрит картинка, когда врёт. Смещение у краёв шкалы: ложь
// всегда прыгает через полосу, а не сдвигается на соседнюю. Завал хлама от
// этого выглядит заметным сокровищем, а не «почти дорогим», — обман заметен
// и запоминается, но настоящую полосу по картинке не восстановить.
const LIE_PRIOR = [0.3, 0.1, 0.1, 0.2, 0.3];

/**
 * Тон сцены для кладовки.
 * @param bandId настоящая полоса суммы (см. VALUE_BANDS)
 */
export function maskMood(rnd, bandId) {
  const idx = Math.max(0, VALUE_BANDS.findIndex((b) => b.id === bandId));
  let j = idx;
  if (!rnd.chance(TRUTH_RATE)) {
    let roll = rnd();
    j = VALUE_BANDS.length - 1;
    for (let k = 0; k < LIE_PRIOR.length; k++) {
      roll -= LIE_PRIOR[k];
      if (roll <= 0) { j = k; break; }
    }
  }
  return MOOD_BY_BAND[j];
}

export const TIER_LABEL = { cheap: 'Дешёвый вид', mid: 'Средний вид', rich: 'Дорогой вид' };
