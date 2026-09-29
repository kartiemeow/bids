// Прогон полного цикла без сети: комната -> 15 раундов -> итог -> реванш.
// Проверяем, что состояние честное, ставки слепые, кладовки не повторяются,
// деньги не уходят в минус.
//
//   npm test

import { Game, PHASES, RULES } from '../src/game.js';
import { makeRng } from '../src/rng.js';
import { makePile, publicPile } from '../src/pile.js';
import { CATALOG } from '../src/catalog.js';

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
// Состав соседних кладовок пересекаться не должен: один и тот же предмет два
// раунда подряд игрок запомнит. А вот через раунд повтор допустим — за партию
// вынуждено разыгрывается больше 100 предметов, каталог столько не содержит.
let prevPileLots = new Set();
let consecutiveRepeats = 0;
let auctions = 0;
let wins = 0;
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
    for (const id of lots) if (prevPileLots.has(id)) consecutiveRepeats++;
    prevPileLots = lots;
    for (const it of pile.items) seenLots.add(it.lotId);

    const snap = game.publicState();
    if (snap.pile.value !== null) fail('цена кладовки видна до разбора');
    // Цена каждой вещи тоже не должна утекать до разбора, иначе список
    // «картинка — цена» покажет разбор заранее.
    if (snap.pile.items.some((i) => 'value' in i)) fail('цены предметов видны в торгах');

    // Открытый аукцион: игроки по очереди перебивают друг друга, пока
    // текущая ставка не упрётся в чей-то потолок или в шаг повышения.
    let steps = 0;
    for (const p of game.players) {
      const cap = Math.floor(p.money * RULES.maxBidRatio);
      if (cap < (game.state.highBid || 0) + RULES.minStep) continue;
      const r = game.raise(p.id, (game.state.highBid || 0) + RULES.minStep);
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
      if (typeof s.pile.value !== 'number') fail('цена не раскрыта в разборе');
      const sum = s.pile.items.reduce((t, i) => t + i.value, 0);
      if (sum !== s.pile.value) fail(`цены предметов не дают сумму кладовки: ${sum} != ${s.pile.value}`);
      const desc = s.pile.items.every((i, k, arr) => k === 0 || arr[k - 1].value >= i.value);
      if (!desc) fail('разбор не отсортирован по убыванию цены');
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
check('в соседних кладовках нет повторов', consecutiveRepeats === 0, `случаев: ${consecutiveRepeats}`);
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
// минус ВСЕ сгоревшие ставки. Ставка списывается в момент постановки, поэтому
// горят и ставки перебитых — победителю достаётся только находка.
let moneyMismatch = 0;
for (const p of game.players) {
  const got = p.won.reduce((s, w) => s + w.value, 0);
  const expect = RULES.startMoney + got - p.burned + RULES.incomePerRound * RULES.totalRounds;
  if (expect !== p.money) moneyMismatch++;
}
check('деньги сходятся с находками и сгоревшими ставками', moneyMismatch === 0, `расхождений: ${moneyMismatch}`);

// ── 2. Открытый аукцион: перебития, шаг, сгорание ставок ─────────────

console.log('\n[2] Открытый аукцион и границы');
const g2 = new Game('BLND');
g2.addPlayer('a', 'Аня');
g2.addPlayer('b', 'Борис');
g2.start();

const before = g2.publicState();
// Аукцион открытый, но цена кладовки до разбора не видна ни через что.
check('в снимке нет поля bid', before.players.every((p) => !('bid' in p)));
check('цена скрыта в фазе торгов', before.pile.value === null);
check('состав кладовки виден', before.pile.items.length === before.pile.count);
check('состав без цен', !JSON.stringify(before.pile).includes('_value'));
check('цены вещей не видны в торгах', before.pile.items.every((i) => !('value' in i)));
check('до первой ставки лидера нет', before.highBid === null && before.highBidder === null);

const moneyA = g2.state.players.get('a').money;
const over = g2.raise('a', moneyA + 1);
check('ставка выше капитала отклонена', !over.ok, JSON.stringify(over));
const zero = g2.raise('a', 0);
check('нулевая ставка отклонена', !zero.ok, JSON.stringify(zero));

// Первая ставка открывает аукцион и сразу сгорает.
const open = g2.raise('a', 100);
check('первая ставка принята', open.ok, JSON.stringify(open));
check('ставка списана сразу', g2.state.players.get('a').money === moneyA - 100,
  String(g2.state.players.get('a').money));
check('лидер виден всем', g2.publicState().highBidderName === 'Аня', g2.publicState().highBidderName);
const selfBid = g2.raise('a', 200);
check('лидер не может перебить сам себя', !selfBid.ok, JSON.stringify(selfBid));

// Шаг перебития — ровно minStep.
const tiny = g2.raise('b', 105);
check('перебитие меньше шага отклонено', !tiny.ok, JSON.stringify(tiny));
const okRaise = g2.raise('b', 110);
check('перебитие на шаг принято', okRaise.ok, JSON.stringify(okRaise));
check('новый лидер — Борис', g2.state.highBidder === 'b' && g2.state.highBid === 110);
check('окно на перебитие сброшено в 10 секунд', g2.state.phaseMs === RULES.raiseMs, String(g2.state.phaseMs));

// Возврат лидера: Аня снова может перебить, и это допустимо.
const back = g2.raise('a', 120);
check('прежний лидер может перебить снова', back.ok, JSON.stringify(back));
// moneyA — это капитал после старта, у обоих он одинаковый: Борис сгорел
// ровно свою ставку 110 и ничего не получил взамен.
const moneyB = g2.state.players.get('b').money;
check('перебитая ставка не возвращается', moneyB === moneyA - 110, `${moneyB} вместо ${moneyA - 110}`);

g2.closeBidding();
const rev = g2.publicState();
check('в разборе виден победитель', rev.pile.winner === 'Аня', String(rev.pile.winner));
check('цена раскрыта в разборе', typeof rev.pile.value === 'number');
check('в разборе видны цены вещей', rev.pile.items.every((i) => typeof i.value === 'number'));
check('разбор отсортирован по убыванию', rev.pile.items.every((i, k, arr) => k === 0 || arr[k - 1].value >= i.value));
check('сумма вещей равна цене кладовки',
  rev.pile.items.reduce((t, i) => t + i.value, 0) === rev.pile.value);
g2.destroy();

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
const draw = (seed) => {
  let i = 0;
  const r = makeRng(seed);
  const r2 = makeRng(seed);
  const take = (count) => Array.from({ length: count }, () => CATALOG[(i++ + 7) % CATALOG.length].id);
  return makePile(r, take, 4);
};
const d1 = draw('k1');
const d2 = draw('k1');
check('одинаковый сид -> одинаковая цена', d1._value === d2._value, `${d1._value} / ${d2._value}`);
check('одинаковый сид -> одинаковый состав',
  d1.items.map((i) => i.lotId).join() === d2.items.map((i) => i.lotId).join());
check('цена — сумма цен предметов',
  d1._value === d1.items.reduce((s, i) => s + i._value, 0));
check('цена в разумных пределах', d1._value >= 10 && d1._value <= 40000, String(d1._value));

// ── 5. Маскировка реально обманывает ─────────────────────────────────

console.log('\n[5] Маскировка: вид кладовки не выдаёт цену');
// Полоса кладовки и тир картинки — разные шкалы. Настоящая «правда» здесь:
// какой тир кладовка обязана была бы показывать, если бы не маскировка.
const PILE_TIER = { trash: 'cheap', modest: 'cheap', solid: 'mid', big: 'rich', treasure: 'rich' };
let deceptive = 0, total = 0;
const byLook = { cheap: [], mid: [], rich: [] };
for (let i = 0; i < 200; i++) {
  const r = makeRng('mask/' + i);
  let k = 0;
  const p = makePile(r, (count) => Array.from({ length: count }, () => CATALOG[(k++ * 7 + i) % CATALOG.length].id), 4);
  total++;
  if (p.shownTier !== PILE_TIER[p.bandId]) deceptive++;
  byLook[p.shownTier].push(p._value);
}
const rate = deceptive / total;
check('вид кладовки обманчив', rate > 0.15 && rate < 0.95, `обмануто ${(rate * 100).toFixed(0)}%`);

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
check('встречаются и пустые, и богатые', samples[0] < 300 && samples[total - 1] > 3000,
  `${samples[0]}..${samples[total - 1]}`);

// ── 6. Реванш ────────────────────────────────────────────────────────

console.log('\n[6] Реванш');
const g4 = new Game('RMT');
g4.addPlayer('h', 'Хост');
g4.addPlayer('g', 'Гость');
const secretBefore = g4.secret;
g4.state.players.get('h').money = 900;
g4.state.players.get('h').won.push({ round: 0, value: 500, bid: 100 });
g4.start();
g4.raise('h', 200);
g4.closeBidding();
// Ставка сгорела при постановке, находка пришла при разборе: 900 + доход - ставка + value.
const h = g4.state.players.get('h');
const lastWin = h.won[h.won.length - 1];
check('победителю начислена сумма находки',
  h.money === 900 + RULES.incomePerRound - 200 + lastWin.value,
  String(h.money));
check('сгоревшая ставка не вернулась', h.burned === 200, String(h.burned));

g4.resetToLobby();
check('вернулись в лобби', g4.state.phase === PHASES.LOBBY);
check('деньги сброшены', g4.state.players.get('h').money === RULES.startMoney);
check('кладовки нет', g4.state.currentPile === null);
check('секрет новый', g4.secret !== secretBefore);
check('колода перемешана заново', g4.deck.length === CATALOG.length);
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
g5.destroy();

console.log(failures === 0 ? '\nВсе проверки пройдены.\n' : `\nПровалено проверок: ${failures}\n`);
process.exit(failures === 0 ? 0 : 1);
