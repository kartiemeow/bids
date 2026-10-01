// Баланс: снежный комк или нет. Не тест (тесты не знают про «а как игроки
// ходят»), а замер. Играем по-настоящему через Game: кладовки настоящие,
// деньги настоящие, потолки и перевес настоящие. Оценку завала игроки берут по
// КАРТИНКЕ (shownTier — то, что реально видно), полосу и деньги соперников в
// оценку не кладут: скрытая информация не должна протекать в модель.
//
// Один лидер играет «grief»: он видит деньги всех и бьёт ровно на монету выше
// потолка того, кто сейчас ведёт. Лот гарантирован, переплата копеечная,
// оценка завала не нужна. Пока это работает, никакие правила про разрыв
// капиталов не имеют смысла, и зонд честно показывает, работает ли ещё.
//
//   node tools/probe-balance.js

import { Game, RULES, PHASES } from '../src/game.js';

const LOOK_MID = { cheap: 300, mid: 800, rich: 1800 };
const N = 4;
const GAMES = 300;

function play(seed) {
  const g = new Game('LIVE' + seed);
  for (let i = 0; i < N; i++) g.addPlayer('p' + i, 'p' + i);
  g.start();
  let s = seed * 2654435761 % 2147483647;
  const rnd = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

  let blindLate = 0, late = 0, lots = 0, outsider = 0, backWins = 0;
  let griefUsed = 0, griefWin = 0, blocked = 0;

  for (let r = 1; r <= RULES.totalRounds; r++) {
    const pile = g.state.currentPile;
    if (!pile) break;
    const truth = pile._value;
    const seen = LOOK_MID[pile.shownTier] || 500;
    const front = g.players.reduce((a, b) => (b.money > a.money ? b : a)).id;
    const back = g.players.reduce((a, b) => (b.money < a.money ? b : a)).id;
    const phaseAtStart = g.state.phase;

    if (r > RULES.totalRounds / 2) {
      late++;
      const poorCap = Math.min(...g.players.map((p) => g.bidCapFor(p)));
      if (poorCap < truth) blindLate++;
    }

    // Ходят по очереди. Лидер, который вырвался, применяет grief: бьёт на
    // монету выше потолка второго места. Обычно он упирается в общую крышу,
    // и это ровно то, что мы хотим проверить.
    for (const p of g.players) {
      if (!p.connected) continue;
      const cap = g.bidCapFor(p);
      const floorBid = (g.state.highBid === null ? 0 : g.state.highBid) + RULES.minStep;
      if (floorBid > cap) continue;
      let est = Math.max(RULES.minStep, Math.round(seen * (1 + gauss() * 0.7)));
      // Grief: лидер по деньгам бьёт ровно на монету выше потолка того, кто
      // сейчас ведёт. Считаем отдельно, сколько таких ставок сервер отбил
      // общей крышей — именно это и есть доказательство, что правило работает.
      const isFrontrunner = p.money === Math.max(...g.players.map((q) => q.money));
      let griefing = false;
      if (isFrontrunner && g.state.highBidder !== null && g.state.highBidder !== p.id) {
        // Второе место считаем среди ОСТАВШИХСЯ: сам лидер в этой выборке
        // оказывался первым и «перебивал сам себя», что давало ложное
        // «крыша всё отбила» даже при крыше в бесконечность.
        const second = g.players.filter((q) => q.id !== g.state.highBidder && q.id !== p.id)
          .sort((a, b) => b.money - a.money)[0];
        if (!second) continue;
        const griefBid = Math.floor(g.bidCapFor(second)) + RULES.minStep;
        griefing = true;
        griefUsed++;
        if (griefBid > cap) { blocked++; continue; }
        est = Math.max(est, griefBid);
      }
      const v = Math.min(est, cap);
      if (v < floorBid) { if (griefing) griefUsed--; continue; }
      if (g.raise(p.id, v).ok && griefing) griefWin++;
    }

    if (g.state.phase === PHASES.BID) g.closeBidding();
    if (g.state.phase === PHASES.REVEAL) {
      const winner = pile._winner;
      lots++;
      if (winner && winner !== front) outsider++;
      if (winner === back) backWins++;
      g.nextRound();
    }
    void phaseAtStart;
  }
  const monies = g.players.map((p) => p.money);
  const total = g.players.reduce((s, p) => s + p.money, 0);
  g.destroy();
  return {
    spread: Math.max(...monies) - Math.min(...monies),
    blind: blindLate / Math.max(1, late),
    lots, outsider, backWins, griefUsed, griefWin, blocked, total,
  };
}

const acc = { spreads: [], blind: [], lots: 0, outsider: 0, backWins: 0, griefUsed: 0, griefWin: 0, blocked: 0 };
for (let i = 1; i <= GAMES; i++) {
  const r = play(i);
  acc.spreads.push(r.spread);
  acc.blind.push(r.blind);
  acc.lots += r.lots; acc.outsider += r.outsider; acc.backWins += r.backWins;
  acc.griefUsed += r.griefUsed; acc.griefWin += r.griefWin; acc.blocked += r.blocked;
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const p90 = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length * 0.9)]; };

// Один и тот же зонд на одних и тех же партиях, но со старыми правилами:
// крыша убрана в бесконечность, перевес выключен. Разница — ровно то, что
// сделали новые правила, без оглядки на то, как игроки ходят.
function run(label, cap, levy) {
  const oldCap = RULES.bidCap; const oldLevy = RULES.levyRate;
  RULES.bidCap = cap; RULES.levyRate = levy;
  const a = { spreads: [], blind: [], lots: 0, outsider: 0, backWins: 0, griefUsed: 0, griefWin: 0, blocked: 0 };
  for (let i = 1; i <= GAMES; i++) {
    const r = play(i);
    a.spreads.push(r.spread); a.blind.push(r.blind);
    a.lots += r.lots; a.outsider += r.outsider; a.backWins += r.backWins;
    a.griefUsed += r.griefUsed; a.griefWin += r.griefWin; a.blocked += r.blocked;
  }
  RULES.bidCap = oldCap; RULES.levyRate = oldLevy;
  console.log(label);
  console.log(`   разрыв капиталов   медиана ${med(a.spreads)}, p90 ${p90(a.spreads)}`);
  console.log(`   отрезан в поздних  ${Math.round(med(a.blind) * 100)}% раундов`);
  console.log(`   лот не лидеру      ${Math.round(a.outsider / a.lots * 100)}%`);
  console.log(`   лот последнему     ${Math.round(a.backWins / a.lots * 100)}%`);
  console.log(`   grief              пробовали ${a.griefUsed}, прошло ${a.griefWin}, отбито крышей ${a.blocked}\n`);
}

console.log(`Настоящая игра, ${N} игроков, ${RULES.totalRounds} раундов, ${GAMES} партий`);
console.log(`старт ${RULES.startMoney}, доход ${RULES.incomePerRound}\n`);
run('БЫЛО: потолок от своего капитала, без перевеса', 1e9, 0);
run(`СТАЛО: крыша ${RULES.bidCap}, перевес ${RULES.levyRate}`, RULES.bidCap, RULES.levyRate);
