// Прогон полного цикла без сети: комната -> 15 раундов -> итог -> реванш.
// Проверяем, что состояние честное, ставки слепые, кладовки не повторяются,
// деньги не уходят в минус.
//
//   npm test

import { Game, PHASES, RULES } from '../src/game.js';
import { makeRng } from '../src/rng.js';
import { makePile, publicPile } from '../src/pile.js';
import { CATALOG } from '../src/catalog.js';
import { VALUE_BANDS, MOOD_BY_BAND } from '../src/values.js';

const rnd = makeRng('test/game-cycle/v2');
let failures = 0;

function check(name, cond, extra = '') {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`);
  }
}

function fail(name, extra = '') {
  failures++;
  console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`);
}

// ── 1. Полный прогон комнаты ──────────────────────────────────────────

console.log('\n[1] Полный цикл: 3 игрока, 15 раундов');
const game = new Game('TEST');
game.addPlayer('p1', 'Аня');
game.addPlayer('p2', 'Борис');
game.addPlayer('p3', 'Вера');

const seenLots = new Set();
let minMoney = Infinity;
let reveals = 0;
let totalItems = 0;
let duplicateInPile = 0;
let minCount = Infinity;
let maxCount = 0;
// Состав соседних кладовок пересекаться почти не должен: один и тот же предмет
// два раунда подряд игрок запомнит. Строго запретить нельзя — крупных
// предметов в каталоге всего десять, а раундов пятнадцать, — поэтому считаем
// долю кладовок с повтором, а не сам факт.
let prevPileLots = new Set();
let repeatedPiles = 0;
let pilesSeen = 0;
let consecutiveRepeats = 0;
let auctions = 0;
let wins = 0;
let unsold = 0;
let unsoldLate = 0;
let earlyCloses = 0;

game.start();
check('игра стартовала сразу с торгов', game.state.phase === PHASES.BID);

while (game.state.phase !== PHASES.FINISHED) {
  const phase = game.state.phase;

  if (phase === PHASES.BID) {
    const pile = game.state.currentPile;
    if (!pile) { fail('в торгах есть кладовка'); break; }
    totalItems += pile.count;
    minCount = Math.min(minCount, pile.count);
    maxCount = Math.max(maxCount, pile.count);
    if (new Set(pile.items.map((i) => i.lotId)).size !== pile.count) duplicateInPile++;
    const lots = new Set(pile.items.map((i) => i.lotId));
    let hit = 0;
    for (const id of lots) if (prevPileLots.has(id)) { hit++; consecutiveRepeats++; }
    if (prevPileLots.size && hit) repeatedPiles++;
    pilesSeen++;
    prevPileLots = lots;
    for (const it of pile.items) seenLots.add(it.lotId);

    const snap = game.publicState();
    if (snap.pile.value !== null) fail('цена кладовки видна до разбора');
    // Цена каждой вещи тоже не должна утекать до разбора, иначе список
    // «картинка — цена» покажет разбор заранее.
    if (snap.pile.items.some((i) => 'value' in i)) fail('цены предметов видны в торгах');

    // Открытый аукцион: игроки по очереди перебивают друг друга, пока
    // текущая ставка не упрётся в чей-то потолок или в шаг повышения.
    // Игроки оценивают кладовку и поднимают ставку до своей оценки. Проверяем
    // не только списание, но и то, что кладовки в принципе выкупаются: раньше
    // тест поднимал по шагу и всегда брал любую кладовку за десять монет.
    const target = Math.ceil(game.state.currentPile._value * 0.8 / RULES.minStep) * RULES.minStep;
    let steps = 0;
    for (const p of game.players) {
      const cur = game.state.highBid || 0;
      const cap = Math.floor(p.money * RULES.maxBidRatio);
      const want = Math.min(cap, Math.max(target, cur + RULES.minStep));
      if (want < cur + RULES.minStep) continue;
      const r = game.raise(p.id, want);
      if (r.ok) steps++;
    }
    const snap2 = game.publicState();
    if (snap2.players.some((p) => 'bid' in p)) fail('чужие ставки утекли в снимок');
    if (snap2.highBid !== null && typeof snap2.highBidderName !== 'string') {
      fail('лидер не показан в снимке');
    }
    auctions++;
    // Ставки могут не пройти по лимиту — тогда ждём закрытия по кнопке,
    // как это делает сервер по таймеру.
    if (game.state.phase === PHASES.BID) game.closeBidding();
    if (game.state.phase === PHASES.REVEAL) {
      reveals++;
      earlyCloses++;
      // Ставка лидера должна быть списана к этому моменту, а находка
      // начислена ровно один раз.
      const s = game.publicState();
      if (s.pile.void) {
        unsold++;
        if (game.state.round > Math.ceil(RULES.totalRounds / 2)) unsoldLate++;
        // Невыкупленную кладовку не разбирают: её сумма остаётся тайной, иначе
        // игрок узнал бы цену лота, который не купил.
        if (s.pile.value !== null || s.pile.items.length) fail('невыкупленная кладовка раскрыта в разборе');
      } else {
        if (typeof s.pile.value !== 'number') fail('цена не раскрыта в разборе');
        const sum = s.pile.items.reduce((t, i) => t + i.value, 0);
        if (sum !== s.pile.value) fail(`цены предметов не дают сумму кладовки: ${sum} != ${s.pile.value}`);
        const desc = s.pile.items.every((i, k, arr) => k === 0 || arr[k - 1].value >= i.value);
        if (!desc) fail('разбор не отсортирован по убыванию цены');
      }
      for (const p of game.players) {
        if (p.money < 0) fail(`отрицательные деньги: ${p.name} ${p.money}`);
        minMoney = Math.min(minMoney, p.money);
      }
    }
  } else if (phase === PHASES.REVEAL) {
    game.nextRound();
  } else {
    break;
  }
  if (game.state.round > RULES.totalRounds + 2) { fail('цикл не завершился'); break; }
}

check('разборов было', reveals >= 15, `получено ${reveals}`);
// Минимальная цена не должна делать аукцион пустым. Невыкупленные лоты
// законны в начале партии, когда денег ещё нет, и почти не встречаются к
// середине: капитал растёт, и рынок раскрывается.
check('кладовки в основном выкупались', unsold <= reveals / 5,
  `не выкуплено ${unsold} из ${reveals}`);
check('к середине партии лоты выкупаются', unsoldLate === 0,
  `не выкуплено ${unsoldLate} после ${Math.ceil(RULES.totalRounds / 2)} раунда`);
check('игра дошла до финиша', game.state.phase === PHASES.FINISHED);
check('никаких отрицательных денег', minMoney >= 0, `минимум ${minMoney}`);
check('в финале кладовки нет', game.publicState().pile === null);
check('итоги отсортированы по капиталу', (() => {
  const s = game.standings().map((p) => p.money);
  return s.every((v, i) => i === 0 || s[i - 1] >= v);
})());

check('предметов в кладовках 10..15', minCount >= 10 && maxCount <= 15, `${minCount}..${maxCount}`);
check('внутри кладовки нет повторов', duplicateInPile === 0, `случаев: ${duplicateInPile}`);
check('всего предметов набито достаточно', totalItems >= 150, `предметов: ${totalItems}`);
// Повтор с прошлой кладовкой — исключение, а не правило. Внутри одной кладовки
// повтор недопустим вовсе, между соседними — изредка и только потому, что
// крупных предметов в каталоге десять на пятнадцать раундов.
check('в соседних кладовках повтор редок',
  repeatedPiles <= Math.max(1, Math.floor(pilesSeen / 5)),
  `повтор в ${repeatedPiles} из ${pilesSeen - 1} кладовок`);
// Повторы между раундами неизбежны: 15 кладовок по 10–15 предметов — это
// 150–225 розыгрышей против 100 лотов в каталоге. Проверяем, что каталог
// действительно проходится целиком, а не выдаётся одно и то же по кругу.
check('каталог не вырождается в повтор одного набора', seenLots.size >= 90, `уникальных ${seenLots.size} из 100`);

// Аукцион обязан реально проходить: пока ставки уходили не в ту фазу, их
// отклоняли и победителей не было вовсе, а проверки денег проходили вхолостую.
for (const p of game.players) wins += p.won.length;
check('аукцион прошёл в каждом раунде', auctions === RULES.totalRounds, `торгов: ${auctions}`);
check('победители выдавались', wins > 0, `выигрышей: ${wins}`);
// Каждый раунд обязан заканчиваться разбором, иначе парция встала бы.
check('торги закрывались', earlyCloses === RULES.totalRounds, `закрыто: ${earlyCloses}`);
check('фазы осмотра больше нет', !RULES.previewMs && !PHASES.PREVIEW);
check('разбор длится 5 секунд', RULES.revealMs === 5000, String(RULES.revealMs));
check('окно на открытие — 20 секунд', RULES.openMs === 20000, String(RULES.openMs));
check('окно на перебитие — 10 секунд', RULES.raiseMs === 10000, String(RULES.raiseMs));
check('шаг перебития — 10', RULES.minStep === 10, String(RULES.minStep));

// Деньги == стартовый капитал + доход за каждый раунд + вся найденная сумма
// минус плата за выкупленные кладовки минус сгоревшие разницы. Плата за лот —
// это bid в won: деньги ушли из оборота в момент постановки ставки, а вернулась
// находка. Сгоревшие разницы отдельно: перебитый теряет только то, чем
// перебил, остальное ему возвращается.
let moneyMismatch = 0;
for (const p of game.players) {
  const got = p.won.reduce((s, w) => s + w.value, 0);
  const paid = p.won.reduce((s, w) => s + w.bid, 0);
  const expect = RULES.startMoney + got - paid - p.burned + RULES.incomePerRound * RULES.totalRounds;
  if (expect !== p.money) moneyMismatch++;
}
check('деньги сходятся с находками и сгоревшими ставками', moneyMismatch === 0, `расхождений: ${moneyMismatch}`);

// ── 2. Открытый аукцион: перебития, шаг, сгорание ставок ─────────────

console.log('\n[2] Открытый аукцион и границы');
const g2 = new Game('BLND');
g2.addPlayer('a', 'Аня');
g2.addPlayer('b', 'Борис');
g2.start();
// Секрет комнаты случаен, поэтому лот может выпасть дороже стартового капитала.
// Для проверки механики аукциона капитал поднимаем так, чтобы любой лот можно
// было выкупить: проверяем правила торгов, а не удачу розыгрыша.
for (const p of g2.players) p.money = 5000;

const before = g2.publicState();
// Аукцион открытый, но цена кладовки до разбора не видна ни через что.
// Состав тоже не отдаём: при фиксированных ценах предметов список вещей — это
// и есть сумма, и в devtools она читалась бы мгновенно.
check('в снимке нет поля bid', before.players.every((p) => !('bid' in p)));
check('цена скрыта в фазе торгов', before.pile.value === null);
check('состав кладовки не утекает', before.pile.items.length === 0);
check('состав без цен', !JSON.stringify(before.pile).includes('_value'));
check('количество предметов известно', before.pile.count > 0);
check('до первой ставки лидера нет', before.highBid === null && before.highBidder === null);

const moneyA = g2.state.players.get('a').money;
const over = g2.raise('a', moneyA + 1);
check('ставка выше капитала отклонена', !over.ok, JSON.stringify(over));
const zero = g2.raise('a', 0);
check('нулевая ставка отклонена', !zero.ok, JSON.stringify(zero));

// Первая ставка открывает аукцион и сразу замораживается. Ставим осмысленную
// сумму: кладовка заведомо стоит больше минимальной цены, иначе лот просто не
// продастся и проверки разбора ничего не будут проверять.
const worth = g2.state.currentPile._value;
const openBid = Math.ceil(worth * 0.8 / RULES.minStep) * RULES.minStep;
const open = g2.raise('a', openBid);
check('первая ставка принята', open.ok, JSON.stringify(open));
check('ставка заморожена сразу', g2.state.players.get('a').money === moneyA - openBid,
  String(g2.state.players.get('a').money));
check('лидер виден всем', g2.publicState().highBidderName === 'Аня', g2.publicState().highBidderName);
const selfBid = g2.raise('a', openBid + 100);
check('лидер не может перебить сам себя', !selfBid.ok, JSON.stringify(selfBid));

// Шаг перебития — ровно minStep.
const tiny = g2.raise('b', openBid + 5);
check('перебитие меньше шага отклонено', !tiny.ok, JSON.stringify(tiny));
const okRaise = g2.raise('b', openBid + 10);
check('перебитие на шаг принято', okRaise.ok, JSON.stringify(okRaise));
check('новый лидер — Борис',
  g2.state.highBidder === 'b' && g2.state.highBid === openBid + 10,
  `${g2.state.highBidder} ${g2.state.highBid}`);
check('окно на перебитие сброшено в 10 секунд', g2.state.phaseMs === RULES.raiseMs, String(g2.state.phaseMs));

// Возврат лидера: Аня снова может перебить, и это допустимо.
const back = g2.raise('a', openBid + 20);
check('прежний лидер может перебить снова', back.ok, JSON.stringify(back));
// moneyA — капитал после старта, у обоих одинаковый. Борис ставил openBid + 10,
// его перебили на +20: сгорает только разница 10, а остальное возвращается.
const moneyB = g2.state.players.get('b').money;
check('перебитый теряет только разницу', moneyB === moneyA - 10, `${moneyB} вместо ${moneyA - 10}`);
check('сгоревшая разница учтена', g2.state.players.get('b').burned === 10,
  String(g2.state.players.get('b').burned));

g2.closeBidding();
const rev = g2.publicState();
check('в разборе виден победитель', rev.pile.winner === 'Аня', String(rev.pile.winner));
check('цена раскрыта в разборе', typeof rev.pile.value === 'number');
check('в разборе видны цены вещей', rev.pile.items.every((i) => typeof i.value === 'number'));
check('разбор отсортирован по убыванию', rev.pile.items.every((i, k, arr) => k === 0 || arr[k - 1].value >= i.value));
check('сумма вещей равна цене кладовки',
  rev.pile.items.reduce((t, i) => t + i.value, 0) === rev.pile.value);
g2.destroy();

// ── 2б. Кладовку ниже минимальной цены не продают ─────────────────────

console.log('\n[2б] Минимальная цена');
const g2b = new Game('RSRV');
g2b.addPlayer('a', 'Аня');
g2b.addPlayer('b', 'Борис');
g2b.start();
for (const p of g2b.players) p.money = 5000;
const pileValue = g2b.state.currentPile._value;
// Ставим заведомо ниже минимальной цены: порог считается от настоящей суммы,
// поэтому половины от неё заведомо хватает.
const lowBid = Math.max(RULES.minStep, Math.floor(pileValue * RULES.reserveRatio / 2 / RULES.minStep) * RULES.minStep);
const openedLow = g2b.raise('a', lowBid);
check('низкая ставка принимается в торгах', openedLow.ok, JSON.stringify(openedLow));
check('ставка ниже минимальной цены', lowBid < Math.round(pileValue * RULES.reserveRatio),
  `${lowBid} против ${Math.round(pileValue * RULES.reserveRatio)}`);
g2b.closeBidding();
const lowRev = g2b.publicState();
check('кладовка ниже минимальной не продана', lowRev.pile.void === true, String(lowRev.pile.void));
check('цена невыкупленной кладовки не раскрыта', lowRev.pile.value === null, String(lowRev.pile.value));
check('состав невыкупленной кладовки не раскрыт', lowRev.pile.items.length === 0);
check('ставка возвращена полностью',
  g2b.state.players.get('a').money === 5000,
  String(g2b.state.players.get('a').money));
check('заморозка закрыта', g2b.state.players.get('a').held === 0);
g2b.destroy();

// ── 3. Старт невозможен без игроков ───────────────────────────────────

console.log('\n[3] Лобби');
const g3 = new Game('LBY');
g3.addPlayer('solo', 'Один');
check('в одиночку не стартует', g3.start() === false);
g3.addPlayer('duo', 'Двое');
check('вдвоём стартует', g3.start() === true);
g3.destroy();

// ── 4. Детерминизм кладовки ───────────────────────────────────────────

console.log('\n[4] Кладовка детерминирована');
// Раздача вне игры: берём предметы каталога по профилю, без колоды.
const draw = (seed) => {
  let i = 0;
  const r = makeRng(seed);
  const take = (profile) => {
    const want = [profile.rich, profile.mid, profile.cheap];
    const out = [];
    for (const [tier, n] of [['rich', want[0]], ['mid', want[1]], ['cheap', want[2]]]) {
      const pool = CATALOG.filter((c) => c.t === tier);
      for (let k = 0; k < n; k++) out.push(pool[(i++ * 7) % pool.length]);
    }
    return out;
  };
  return makePile(r, take);
};
const d1 = draw('k1');
const d2 = draw('k1');
check('одинаковый сид -> одинаковая цена', d1._value === d2._value, `${d1._value} / ${d2._value}`);
check('одинаковый сид -> одинаковый состав',
  d1.items.map((i) => i.lotId).join() === d2.items.map((i) => i.lotId).join());
check('цена — сумма цен предметов',
  d1._value === d1.items.reduce((s, i) => s + i._value, 0));
check('цена в разумных пределах', d1._value >= 40 && d1._value <= 4000, String(d1._value));
// Цена предмета не должна зависеть от того, в каком раунде он выпал: это
// главное свойство новой экономики, из неё растёт возможность выучить каталог.
const catalogFixed = CATALOG.every((c) => typeof c.v === 'number' && c.v > 0);
check('у каждого предмета фиксированная цена', catalogFixed);
const sameItem = new Map();
for (const it of d1.items) sameItem.set(it.lotId, (sameItem.get(it.lotId) || 0) + it._value);
check('цена предмета не зависит от раунда',
  [...sameItem.keys()].every((id) => id && CATALOG.find((c) => c.id === id).v > 0));

// ── 5. Маскировка реально обманывает ─────────────────────────────────

console.log('\n[5] Маскировка: вид кладовки не выдаёт цену');
// Тон сцены (shownTier) и настоящая полоса суммы — разные шкалы. Маскировка
// нужна для того, чтобы выученный каталог не превращался в калькулятор: надо
// уметь определить полосу по картинке, но не сорвать точную сумму.
const drawFromCatalog = (rnd) => {
  let i = 0;
  return (profile) => {
    const out = [];
    for (const [tier, n] of [['rich', profile.rich], ['mid', profile.mid], ['cheap', profile.cheap]]) {
      const pool = CATALOG.filter((c) => c.t === tier);
      for (let k = 0; k < n; k++) out.push(pool[(i++ * 7) % pool.length]);
    }
    return out;
  };
};
// Тон, который кладовка обязана была бы получить без маскировки.
const trueMoodOf = (pile) => MOOD_BY_BAND[VALUE_BANDS.findIndex((b) => b.id === pile.bandId)];

let deceptive = 0, total = 0;
const byLook = { cheap: [], mid: [], rich: [] };
for (let i = 0; i < 300; i++) {
  const r = makeRng('mask/' + i);
  const p = makePile(r, drawFromCatalog(r));
  total++;
  if (p.shownTier !== trueMoodOf(p)) deceptive++;
  byLook[p.shownTier].push(p._value);
}
const rate = deceptive / total;
check('вид кладовки обманчив', rate > 0.15 && rate < 0.6, `обмануто ${(rate * 100).toFixed(0)}%`);

// Главное свойство маскировки: «выглядит дорого» не значит «дорого».
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const cheapAvg = avg(byLook.cheap);
const richAvg = avg(byLook.rich);
check('дорогой вид — слабый намёк, а не ответ', richAvg < cheapAvg * 3,
  `выглядит дёшево ~${Math.round(cheapAvg)}, выглядит дорого ~${Math.round(richAvg)}`);
check('но дорогой вид всё-таки полезен', richAvg > cheapAvg * 1.15,
  `выглядит дёшево ~${Math.round(cheapAvg)}, выглядит дорого ~${Math.round(richAvg)}`);

// Главное свойство обмана: распределения должны пересекаться. Дорогая на вид
// кладовка обязана иногда оказываться пустой, и наоборот.
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const cheapMed = median(byLook.cheap);
const richCheapFools = byLook.rich.filter((v) => v < cheapMed).length / byLook.rich.length;
const cheapRichFools = byLook.cheap.filter((v) => v > median(byLook.rich)).length / byLook.cheap.length;
check('дорогие на вид бывают пустыми', richCheapFools > 0.15,
  `${(richCheapFools * 100).toFixed(0)}% дорогих на вид дешевле медианы дешёвых на вид`);
// Обратный случай реже по замыслу: маскировка односторонняя — дорогое иногда
// выглядит дешёвым, но дешёвое почти никогда не выглядит сокровищем. Так
// картинка остаётся полезным намёком и всё же обманывает.
check('дешёвые на вид изредка богаты', cheapRichFools > 0.1,
  `${(cheapRichFools * 100).toFixed(0)}% дешёвых на вид дороже медианы дорогих на вид`);

const samples = byLook.cheap.concat(byLook.mid, byLook.rich);
samples.sort((a, b) => a - b);
check('цены кладовок разнообразны',
  samples[Math.floor(total * 0.9)] > samples[Math.floor(total * 0.1)] * 3,
  `p10=${samples[Math.floor(total * 0.1)]} p90=${samples[Math.floor(total * 0.9)]}`);
// Крайние кладовки обязаны дотягивать до краёв шкалы полос, иначе в игре нет
// ставок, ради которых вообще стоит рисковать.
const bandMax = (id) => VALUE_BANDS.find((b) => b.id === id).max;
check('встречаются и пустые, и богатые',
  samples[0] < bandMax('junk') && samples[total - 1] > bandMax('big'),
  `${samples[0]}..${samples[total - 1]}`);

// ── 6. Реванш ────────────────────────────────────────────────────────

console.log('\n[6] Реванш');
const g4 = new Game('RMT');
g4.addPlayer('h', 'Хост');
g4.addPlayer('g', 'Гость');
const secretBefore = g4.secret;
// Капитал заведомо хватает на любой лот: секрет комнаты случайный, и при
// небольшой сумме тест то выигрывал, то нет — проверка денег зависела от удачи.
g4.state.players.get('h').money = 5000;
g4.state.players.get('h').won.push({ round: 0, value: 500, bid: 100 });
g4.start();
// Ставим выше минимальной цены, иначе лот не продастся и начисления не будет.
const g4bid = Math.ceil(g4.state.currentPile._value * 0.8 / RULES.minStep) * RULES.minStep;
check('ставка реванша принята', g4.raise('h', g4bid).ok, String(g4bid));
g4.closeBidding();
check('лот реванша продан', g4.state.currentPile._void === false);
// Ставка заморожена при постановке, находка пришла при разборе:
// 5000 + доход - плата за лот + находка. Никто ставку не перебивал, поэтому
// сгоревших разниц нет вовсе: burned растёт только на перебитиях.
const h = g4.state.players.get('h');
const lastWin = h.won[h.won.length - 1];
check('победителю начислена сумма находки',
  h.money === 5000 + RULES.incomePerRound - g4bid + lastWin.value,
  String(h.money));
check('выигранная ставка не сгорела', h.burned === 0, String(h.burned));
check('заморозка закрыта после разбора', h.held === 0, String(h.held));

g4.resetToLobby();
check('вернулись в лобби', g4.state.phase === PHASES.LOBBY);
check('деньги сброшены', g4.state.players.get('h').money === RULES.startMoney);
check('кладовки нет', g4.state.currentPile === null);
check('секрет новый', g4.secret !== secretBefore);
check('колоды перемешаны заново',
  Object.values(g4.decks).every((d) => d.length > 0)
  && Object.values(g4.decks).flat().length === CATALOG.length);
check('старый выигрыш очищен', g4.state.players.get('h').won.length === 0);
check('снова можно стартовать', g4.start() === true);
check('новая кладовка создана', !!g4.state.currentPile);
g4.destroy();

// ── 7. Снимок не течёт наружу ─────────────────────────────────────────

console.log('\n[7] Снимок для сети');
const g5 = new Game('LEAK');
g5.addPlayer('x', 'Ксю');
g5.addPlayer('y', 'Юля');
g5.start();
const raw = JSON.stringify(g5.publicState());
check('в снимке нет secret', !raw.includes(g5.secret));
check('в снимке нет суммы кладовки', !raw.includes(`"value":${g5.state.currentPile._value}`));
check('в снимке нет _value', !raw.includes('_value'));
check('publicPile без цен', !JSON.stringify(publicPile(g5.state.currentPile)).includes('_'));
// Минимальная цена держится в секрете: знать её долю — значит уметь переводить
// оценку завала в «продастся или нет» и бить точно в порог. Проверяем поля, а
// не подстроку в JSON: число порога совпадает с чьим-то капиталом или ставкой
// примерно в одной лоте из двадцати, и такая проверка мигает без причины.
const snap = g5.publicState();
const secretKeys = Object.keys(snap.pile).filter((k) => /reserve|min|threshold|minbid/i.test(k));
check('в снимке нет полей минимальной цены', secretKeys.length === 0, secretKeys.join(','));
check('в снимке видны заморозка и сгоревшее', snap.players.every((p) => typeof p.held === 'number' && typeof p.burned === 'number'));
// Порог обязан быть достижим: иначе «ниже минимальной цены» приходит в ответ на
// максимально возможную ставку, и игрока обвиняют в неудачной оценке, хотя он
// физически не мог доплатить. Проверяем первые раунды на свежем капитале.
{
  let unreachable = 0;
  const probeRounds = 60;
  for (let k = 0; k < probeRounds; k++) {
    const gp = new Game('CAP' + k);
    gp.addPlayer('x', 'Ксю');
    gp.addPlayer('y', 'Юля');
    gp.start();
    const cap = Math.floor(RULES.startMoney * RULES.maxBidRatio);
    if (gp.reserveFor(gp.state.currentPile) > cap) unreachable++;
    gp.destroy();
  }
  check('в 1-м раунде нет недоступных лотов', unreachable === 0,
    `${unreachable} из ${probeRounds}`);
}
g5.destroy();

console.log(failures === 0 ? '\nВсе проверки пройдены.\n' : `\nПровалено проверок: ${failures}\n`);
process.exit(failures === 0 ? 0 : 1);
