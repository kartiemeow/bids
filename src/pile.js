// Состав кладовки: несколько предметов, уложенных вразнобой.
//
// Сначала выбирается полоса самой кладовки (от «хлама в углу» до «сокровища»),
// и уже по ней раздаётся микс предметов. Так суммарная цена получается
// естественной, а «сокровище» — это несколько крупных вещей, затерянных среди
// мусора, а не одна дорогая картинка в центре.

import { CATALOG } from './catalog.js';
import {
  rollPileBand, mixFor, rollValue, maskTierFor, pileBandById,
} from './values.js';

const BY_ID = new Map(CATALOG.map((i) => [i.id, i]));

// Показываемый тир кладовки — по большинству тиров её предметов. От него
// зависит настроение света, но не цена.
function dominantTier(items) {
  const count = { cheap: 0, mid: 0, rich: 0 };
  for (const it of items) count[it.shownTier]++;
  return ['cheap', 'mid', 'rich'].reduce((a, b) => (count[a] >= count[b] ? a : b));
}

/**
 * Собрать кладовку.
 * @param rnd      детерминированный ГПСЧ комнаты
 * @param drawIds  функция(count) -> массив неповторяющихся lotId
 * @param count    сколько предметов класть (переопределяет разброс полосы)
 */
export function makePile(rnd, drawIds, count) {
  const band = rollPileBand(rnd);
  const total = count || rnd.int(band.min, band.max);
  const ids = drawIds(total);
  const mix = mixFor(band.id);

  const items = ids.map((lotId) => {
    const meta = BY_ID.get(lotId);
    const v = rollValue(rnd, mix);
    return {
      lotId,
      name: meta ? meta.n : lotId,
      // Тир картинки намеренно сбит с настоящей полосы предмета.
      shownTier: maskTierFor(rnd, v.bandId),
      // Скрытая часть: наружу не отдаётся до разбора.
      _value: v.value,
      _bandId: v.bandId,
    };
  });

  return {
    items,
    count: items.length,
    shownTier: dominantTier(items),
    bandId: band.id,
    bandLabel: pileBandById(band.id).label,
    _value: items.reduce((s, i) => s + i._value, 0),
  };
}

// Снимок для клиента. До разбора цены не отдаём: настоящую сумму знает
// только сервер. В разборе возвращаем цену каждой вещи — по ней клиент
// сортирует список «от дорогой к дешёвой», чтобы игрок видел, откуда сумма.
export function publicPile(pile, revealed = false) {
  if (!pile) return null;
  return {
    count: pile.count,
    shownTier: pile.shownTier,
    items: pile.items
      .map((i) => (revealed
        ? { lotId: i.lotId, name: i.name, shownTier: i.shownTier, value: i._value }
        : { lotId: i.lotId, name: i.name, shownTier: i.shownTier }))
      // В разборе список идёт от самой дорогой вещи к самой дешёвой: игрок
      // видит, из чего сложилась сумма. Порядок задаёт сервер, чтобы у всех
      // клиентов он был одинаковым.
      .sort((a, b) => ((b.value ?? -1) - (a.value ?? -1))),
  };
}
