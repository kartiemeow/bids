// Состав кладовки: несколько предметов, уложенных вразнобой.
//
// Цена кладовки — это сумма ФИКСИРОВАННЫХ цен её предметов (поле v в
// каталоге). Раньше цена каждого предмета бросалась заново в каждом раунде, и
// кладовку было невозможно выучить: оставалось только гадать. Теперь сумма
// однозначна, и ценность игры в том, чтобы по картинке завала понять, что
// внутри. Не видно при этом половину предметов (см. test-pile-layout), плюс тон
// сцены сбит с содержимым — см. maskMood.

import { rollComposition, bandForValue, maskMood } from './values.js';

/**
 * Собрать кладовку.
 * @param rnd      детерминированный ГПСЧ комнаты
 * @param drawLots функция(profile) -> массив предметов каталога без повторов
 */
export function makePile(rnd, drawLots) {
  const profile = rollComposition(rnd);
  const lots = drawLots(profile);
  const items = lots.map((m) => ({ lotId: m.id, name: m.n, tier: m.t, _value: m.v }));
  const total = items.reduce((s, i) => s + i._value, 0);
  const band = bandForValue(total);

  return {
    items,
    count: items.length,
    // Тон сцены — намёк, а не приговор: картинка обязана и помогать, и обманывать.
    // Считается от настоящей полосы суммы, поэтому картинка хоть что-то значит,
    // но в трети случаев показывает соседнюю полосу (см. maskMood).
    shownTier: maskMood(rnd, band.id),
    // Название полосы выводится из настоящей суммы, поэтому в разборе правда.
    bandId: band.id,
    bandLabel: band.label,
    _value: total,
  };
}

// Снимок для клиента. До разбора состав НЕ отдаём: при фиксированных ценах
// список предметов — это и есть сумма кладовки, и в devtools она читалась бы
// мгновенно, убивая весь аукцион. Наружу уходит только количество предметов.
export function publicPile(pile, revealed = false) {
  if (!pile) return null;
  return {
    count: pile.count,
    shownTier: pile.shownTier,
    items: revealed
      ? pile.items
        .map((i) => ({ lotId: i.lotId, name: i.name, tier: i.tier, value: i._value }))
        // В разборе список идёт от самой дорогой вещи к самой дешёвой: игрок
        // видит, из чего сложилась сумма. Порядок задаёт сервер, чтобы у всех
        // клиентов он был одинаковым.
        .sort((a, b) => b.value - a.value)
      : [],
  };
}
