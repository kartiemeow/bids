// Игровая комната. Чистая логика без сети и таймеров: setTimeout здесь
// единственный побочный эффект, всё состояние лежит в this.state.
//
// Цикл раунда: BID -> REVEAL -> (следующий раунд). Отдельного осмотра нет:
// кладовка и так видна, а цена скрыта до разбора, поэтому тянуть раунд на
// минуту до ставок незачем. Аукцион открытый, ставки перебиваются: кто первым
// поставил — тот лидер, остальные могут перебить в течение raiseMs, и каждое
// перебитие заново открывает это окно. Кто не перебил за окно — остаётся с
// лотом, а его ставка уже сгорела.

import { CATALOG } from './catalog.js';
import { makeRng } from './rng.js';
import { makePile, publicPile } from './pile.js';

export const PHASES = {
  LOBBY: 'lobby',
  BID: 'bid',
  REVEAL: 'reveal',
  FINISHED: 'finished',
};

const BY_ID = new Map(CATALOG.map((i) => [i.id, i]));

export const RULES = {
  // Стартовый капитал и доход подобраны так, чтобы хватало на любой лот:
  // сумма тянется до ~2700, а лимит ставки — 90% капитала. При прежних
  // 1000/50 капитал не догонял цену лота, и к 8 раунду торговаться было
  // уже нечем.
  startMoney: 1500,
  incomePerRound: 120,
  // Окно на открытие торгов: кто первый поставил, тот и лидер.
  openMs: 20000,
  // Окно на перебитие. Обнуляется при каждом новом повышении.
  raiseMs: 10000,
  // Перебить можно на 10 монет больше текущей ставки.
  minStep: 10,
  // Разбор: показываем, из чего сложилась сумма, от самой дорогой вещи.
  revealMs: 5000,
  minPlayers: 2,
  maxPlayers: 6,
  totalRounds: 15,
  // Ставка не может превысить деньги игрока: нельзя зайти в минус.
  maxBidRatio: 0.9, // доля капитала, которую разумно ставить одним лотом
  // Ровная крыша на всех. Потолок от СВОЕГО капитала превращает деньги в силу:
  // у лидера крыша всегда выше, чем у остальных, а деньги соперников видны, и
  // лидер бьёт ровно на монету выше потолка второго места — лот гарантирован,
  // переплата копеечная, оценка завала не нужна. Общая крыша обрывает эту
  // стратегию по построению: перебить её можно только заплатив больше неё, а
  // неё для всех одна и та же.
  bidCap: 800,
  // Доля превышения над медианой комнаты, которую отдают те, кто выше.
  levyRate: 0.5,
  };

const now = () => Date.now();

// Лоты на игру: перемешиваем каталог, чтобы у всех комнат была своя последовательность.
// Колода не одна, а по одной на тир: состав кладовки задаёт профиль (сколько
// дорогих, сколько средних), и тянуть надо именно из нужного тира. Общая
// колода давала бы произвольную пропорцию, и суммы кладовок скакали бы.
function makeDecks(secret) {
  const rnd = makeRng(`deck/${secret}`);
  return {
    rich: rnd.shuffle(CATALOG.filter((i) => i.t === 'rich').map((i) => i.id)),
    mid: rnd.shuffle(CATALOG.filter((i) => i.t === 'mid').map((i) => i.id)),
    cheap: rnd.shuffle(CATALOG.filter((i) => i.t === 'cheap').map((i) => i.id)),
  };
}

export class Game {
  constructor(code, opts = {}) {
    this.code = code;
    this.secret = Math.floor(Math.random() * 1e9).toString(36);
    this.decks = makeDecks(this.secret);
    // Лоты, уже розыгранные в этой партии. Нужны, чтобы после исчерпания
    // колоды добор шёл из не использованных предметов, а не из всех подряд.
    this.played = new Set();
    // Лоты, уже взятые в текущей кладовке. Живёт только на время розыгрыша.
    this.drawing = new Set();
    // Смена фазы происходит по таймеру, а не по событию от игрока. Без этого
    // хука сервер не узнает, что осмотр закончился, и клиенты зависнут:
    // onChange обязан вызываться при каждом переходе фазы.
    this.onChange = opts.onChange || (() => {});
    this.state = {
      phase: PHASES.LOBBY,
      round: 0,
      players: new Map(),
      hostId: null,
      currentPile: null,
      // Открытый аукцион: кто сколько ставит прямо сейчас. В отличие от
      // закрытых ставок это видно всем — в этом весь смысл перебивания.
      highBid: null,
      highBidder: null,
      highBidderName: null,
      timerEndsAt: 0,
      log: [],
      startedAt: 0,
    };
    this.timer = null;
  }

  // ── Игроки ────────────────────────────────────────────────────────────

  addPlayer(id, name) {
    if (this.state.players.has(id)) return this.state.players.get(id);
    const p = {
      id,
      name: String(name || 'Игрок').slice(0, 18),
      money: RULES.startMoney,
      won: [],
      // Сколько монет сгорело в текущем раунде на перебитиях.
      spent: 0,
      // Сколько сгорело за всю партию. При перебивании горит только разница
      // между ставками, поэтому перебитый много не теряет.
      burned: 0,
      // Ставка, под которую у игрока сейчас заморожены деньги. При перебивании
      // разница сгорает, а остальное возвращается на руку.
      held: 0,
      // Сколько отдано перевесом и сколько получено обратно за партию. Нужны
      // в разборе, иначе игрок видит, как его капитал тает, и не понимает куда.
      levied: 0,
      received: 0,
      ready: false,
      connected: true,
    };
    this.state.players.set(id, p);
    if (!this.state.hostId) this.state.hostId = id;
    return p;
  }

  get players() {
    return [...this.state.players.values()];
  }

  get host() {
    return this.state.players.get(this.state.hostId);
  }

  removePlayer(id) {
    const p = this.state.players.get(id);
    if (!p) return;
    p.connected = false;
    // Отключившегося выкидываем из торгов. Забирать ему кладовку нельзя —
    // иначе можно было бы набить ставку, перезайти на паузе и забрать лот
    // бесплатно. Но если ушёл именно лидер, кладовку не достаётся никому:
    // следующего по величине ставки в открытом аукционе не существует.
    // Заложенную ставку при этом возвращаем: лот не продан, платить некому,
    // и обрыв связи не должен стоить игроку всего стека.
    if (this.state.phase === PHASES.BID && this.state.highBidder === id) {
      this.log(`${p.name} вышел, будучи лидером. Кладовка не выкуплена.`);
      p.money += p.held || 0;
      p.held = 0;
      const pile = this.state.currentPile;
      if (pile) {
        pile._winner = null;
        pile._winnerBid = null;
        pile._second = null;
        pile._bids = null;
      }
      this.enter(PHASES.REVEAL, RULES.revealMs);
    }
  }

  setReady(id, ready) {
    const p = this.state.players.get(id);
    if (!p) return;
    p.ready = !!ready;
  }

  isReady(id) {
    const p = this.state.players.get(id);
    return !!(p && p.ready);
  }

  // Хост стартует, когда собралось достаточно игроков.
  canStart() {
    const online = this.players.filter((p) => p.connected);
    return online.length >= RULES.minPlayers;
  }

  // ── Управление раундом ────────────────────────────────────────────────

  start() {
    if (this.state.phase !== PHASES.LOBBY) return false;
    if (!this.canStart()) return false;
    this.state.startedAt = now();
    this.state.round = 0;
    this.log(`Игра началась. ${this.players.length} игроков, ${RULES.totalRounds} раундов.`);
    this.nextRound();
    return true;
  }

  // Перевес. Тот, кто выше среднего по комнате, отдаёт половину превышения тем,
  // кто ниже. Это не наказание, а то, что не даёт партии закончиться на
  // третьем раунде: без него капитал растёт только у того, кто уже впереди, и
  // отстающих к середине отрезает от дорогих кладовок — потолок ставки у них
  // ниже, перебить их физически нечем. Общая крыша (bidCap) при этом ломает
  // стратегию «перебить за копейку над потолком соперника», а перевес не даёт
  // копить. Вместе они сжимают разрыв капиталов примерно втрое.
  //
  // Отсчёт от среднего, а не от медианы: при ничьей лидеров медиана равна их
  // общему капиталу, платить не станет никто, и нулевой игрок не получит
  // ни копейки — ровно тот случай, где перевес нужнее всего.
  settleLevy() {
    const live = [...this.state.players.values()].filter((p) => p.connected && p.money >= 0);
    if (live.length < 2) return;
    const mean = Math.floor(live.reduce((s, p) => s + p.money, 0) / live.length);
    const up = live.filter((p) => p.money > mean);
    const down = live.filter((p) => p.money <= mean);
    if (!up.length || !down.length) return;

    // Котёл собираем из уже округлённых платежей, а не округляем отдельно сумму
    // превышений: sum(floor(x_i)) меньше floor(sum(x_i)), и при таком подсчёте
    // перевес печатает монеты из воздуха. Делим ровно столько, сколько собрали.
    const pays = up.map((p) => Math.min(p.money, Math.floor((p.money - mean) * RULES.levyRate)));
    const pot = pays.reduce((s, v) => s + v, 0);
    if (pot <= 0) return;
    for (let i = 0; i < up.length; i++) {
      up[i].money -= pays[i];
      up[i].levied += pays[i];
    }
    const share = Math.floor(pot / down.length);
    for (const p of down) {
      p.money += share;
      p.received += share;
    }
    // Остаток котла отдаём беднейшему: перевес не должен исчезать из-за округления.
    const leftover = pot - share * down.length;
    if (leftover > 0) {
      const poorest = down.reduce((a, b) => (b.money < a.money ? b : a));
      poorest.money += leftover;
      poorest.received += leftover;
    }
    this.log(`Перевес: ${pot} отдал(и) лидер(ы) ${down.length} отстающим.`);
  }

  nextRound() {
    this.clearTimer();
    this.state.round += 1;
    if (this.state.round > RULES.totalRounds) return this.finish();

    // Кладовка набирается из колоды без повторов: предмет не должен попасть
    // в две кладовки подряд, иначе игрок выучит его цену.
    const rnd = makeRng(`pile/${this.secret}/${this.state.round}`);
    const pile = makePile(rnd, (profile) => this.drawLots(profile));
    this.state.currentPile = pile;

    for (const p of this.state.players.values()) {
      p.spent = 0;
      // Заморозка прошлого раунда закрыта: кто выиграл, тот заплатил свою
      // ставку и получил кладовку. Обнуляем, иначе следующая ставка была бы
      // посчитана от старой и игрок заплатил бы вдвое меньше.
      p.held = 0;
    }
    // Перевес и доход — после того, как закрылись все заморозки: перевес делит
    // деньги, а делить замороженное нельзя.
    this.settleLevy();
    for (const p of this.state.players.values()) p.money += RULES.incomePerRound;
    this.log(`Раунд ${this.state.round}/${RULES.totalRounds}: открыта кладовка из ${pile.count} предметов.`);
    this.openBidding();
  }

  // Раздача неповторяющихся лотов из колоды. Колода короче, чем нужно за
  // партию: 15 кладовок по 10–15 предметов — это 150–225 розыгрышей против
  // 100 лотов в каталоге. Поэтому добор идёт не из всей колоды, а только из
  // лотов, которые в этой партии ещё не выпадали, иначе предмет, розыгранный
  // в первом раунде, всплывал бы снова в девятом.
  // Раздача неповторяющихся лотов под профиль: столько-то дорогих, столько-то
  // средних, остальное — дешёвые. Колода короче нужного: 15 кладовок по 10–15
  // предметов — это 150–225 розыгрышей против 100 лотов в каталоге, поэтому
  // добор идёт из лотов, которые в партии ещё не выпадали, и лишь в крайнем
  // случае — из уже выпадавших (минус лоты прошлой кладовки).
  drawLots(profile) {
    // Лоты текущей кладовки держим отдельно от played. Когда тир кончается и
    // колода пересобирается, played сбрасывается на прошлую кладовку — и без
    // этого набора уже взятые предметы снова попали бы в розыгрыш.
    this.drawing = new Set();
    try {
      const out = [];
      for (const tier of ['rich', 'mid', 'cheap']) {
        const want = profile[tier] || 0;
        for (let k = 0; k < want; k++) out.push(this.drawOne(tier));
      }
      return out;
    } finally {
      this.drawing = new Set();
    }
  }

  drawOne(tier) {
    // Проверяем и берём через this.decks[tier] каждый раз: refillDeck
    // подменяет колоду новым массивом, и ссылка на старый пустой массив дала бы
    // предмет без id.
    if (!this.decks[tier].length) this.refillDeck(tier);
    const id = this.decks[tier].shift();
    if (id) {
      this.played.add(id);
      this.drawing.add(id);
    }
    return BY_ID.get(id) || { id, n: 'Лот', t: tier, v: 0 };
  }

  // Колода тира кончилась: добираем из того, что ещё не розыгрывалось.
  // Пул считаем в три приёма, и каждый следующий строже предыдущего, потому
  // что крупных предметов в каталоге всего десять, а партия — пятнадцать
  // раундов: местами они неизбежно повторятся, но внутри кладовки повтор
  // недопустим, и подряд с прошлой кладовкой — тоже.
  refillDeck(tier) {
    const rnd = makeRng(`reshuffle/${this.secret}/${this.state.round}/${tier}`);
    const all = CATALOG.filter((i) => i.t === tier).map((i) => i.id);
    const cur = this.drawing;

    let pool = all.filter((id) => !this.played.has(id) && !cur.has(id));
    if (pool.length < 4) {
      const prev = this.state.currentPile;
      const prevIds = new Set(prev ? prev.items.map((i) => i.lotId) : []);
      this.played = new Set(prevIds);
      pool = all.filter((id) => !prevIds.has(id) && !cur.has(id));
    }
    // Совсем крайний случай: тира не хватает даже без повторов. Тогда
    // соглашаемся на повтор с прошлой кладовкой, но всё равно не выдаём
    // предмет, который уже лежит в текущей.
    if (!pool.length) pool = all.filter((id) => !cur.has(id));

    this.decks[tier] = rnd.shuffle(pool);
  }

  enter(phase, ms) {
    this.state.phase = phase;
    this.state.phaseMs = ms;
    this.state.timerEndsAt = now() + ms;
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      if (phase === PHASES.BID) this.onBidWindowEnd();
      else if (phase === PHASES.REVEAL) this.nextRound();
    }, ms);
    this.onChange();
  }

  // Окно торгов истекло. Если лидера так и не было — никто не открыл аукцион,
  // раунд проходит вхолостую: сразу открываем новую кладовку.
  onBidWindowEnd() {
    if (this.state.highBidder === null) {
      this.log('Никто не открыл торги. Кладовка не выкуплена, открываем новую.');
      return this.nextRound();
    }
    return this.closeBidding();
  }

  openBidding() {
    this.state.highBid = null;
    this.state.highBidder = null;
    this.state.highBidderName = null;
    this.log('Торги открыты. Кто первый поставит — тот лидер, остальные перебивают.');
    this.enter(PHASES.BID, RULES.openMs);
  }

  // Ставка или перебитие. Ставка открывает аукцион, если лидера ещё нет, и
  // всегда сбрасывает окно на перебитие.
  // Потолок ставки игрока: его деньги И общая крыша комнаты. Крыша одна на всех,
// поэтому сколько бы игрок ни накопил, выше неё он не залезет — и перебить
// соперника на его преимуществе в деньгах уже нельзя (см. bidCap в RULES).
bidCapFor(p) {
  return Math.max(0, Math.min(Math.floor(p.money * RULES.maxBidRatio), RULES.bidCap));
}

// Подсказка в отказе: показываем то ограничение, которое сработало. Иначе игрок
// с полным карманом удивляется «максимум 800» и думает, что его обманули.
capHint(p) {
  const byMoney = Math.floor(p.money * RULES.maxBidRatio);
  return byMoney < RULES.bidCap
    ? `Максимум ${byMoney} — не больше 90% капитала`
    : `Максимум ${RULES.bidCap} — общий потолок ставки`;
}

  raise(id, amount) {
    if (this.state.phase !== PHASES.BID) return { ok: false, error: 'Ставки не принимаются' };
    const p = this.state.players.get(id);
    if (!p || !p.connected) return { ok: false, error: 'Игрок не найден' };
    if (this.state.highBidder === id) return { ok: false, error: 'Вы уже лидер' };

    const value = Math.round(Number(amount) || 0);
    if (!Number.isFinite(value) || value <= 0) {
      return { ok: false, error: 'Ставка должна быть больше нуля' };
    }
    const opening = this.state.highBid === null;
    const min = opening ? 1 : this.state.highBid + RULES.minStep;
    if (value < min) {
      return {
        ok: false,
        error: opening ? 'Минимальная ставка — 1 монета' : `Перебить можно от ${min}`,
      };
    }
    const cap = this.bidCapFor(p);
    if (value > cap) return { ok: false, error: this.capHint(p) };

    // Деньги не сгорают целиком. Игрок держит на руке сумму value, но
    // заморожено у него только то, чем он перебил: если его самого перебьют,
    // сгорит лишь разница между ставками, а остальное вернётся.
    // burned/spent здесь НЕ трогаем: пока деньги просто заморожены, они не
    // потеряны. Их списываем в двух местах — при перебитии и при выкупе.
    const hold = value - (p.held || 0);
    p.money -= hold;
    p.held = value;

    if (!opening) {
      const prev = this.state.players.get(this.state.highBidder);
      // Прежний лидер теряет не всю ставку, а разницу: он ставил held,
      // его перебили на value, значит сгорает value - held, а остальное
      // возвращается на руку. Отрицательной разница быть не может — больше
      // своей ставки он в любом случае не теряет.
      if (prev && prev.held) {
        const burn = Math.min(prev.held, Math.max(0, value - prev.held));
        prev.money += prev.held - burn;
        prev.burned += burn;
        prev.spent += burn;
        prev.held = 0;
      }
      this.log(`${prev ? prev.name : 'Лидер'} перебит на ${value}.`);
    } else {
      this.log(`${p.name} открывает торги ставкой ${value}.`);
    }

    this.state.highBid = value;
    this.state.highBidder = id;
    this.state.highBidderName = p.name;

    // Каждое перебитие заново открывает окно: иначе можно было бы перебить
    // заранее и не дать сопернику ответить.
    this.enter(PHASES.BID, RULES.raiseMs);
    return { ok: true, bid: value };
  }

  closeBidding() {
    const pile = this.state.currentPile;
    if (!pile) return this.nextRound();

    const winner = this.state.highBidder ? this.state.players.get(this.state.highBidder) : null;
    if (!winner) return this.onBidWindowEnd();

    const bid = this.state.highBid || 0;
    // Лот уходит лидеру за любую сумму: минимальной цены нет, выигрывает
    // последняя ставка, а не удачная оценка завала. Ставка уже заморожена в
    // момент постановки, здесь только находка.
    this.applyPile(winner, bid);

    this.log(`Кладовку забрал ${winner.name} за ${bid}.`);

    pile._winner = winner.name;
    pile._winnerBid = bid;
    pile._second = null;
    pile._bids = [{ name: winner.name, bid }];

    this.enter(PHASES.REVEAL, RULES.revealMs);
  }

  applyPile(p, bid) {
    const pile = this.state.currentPile;
    const value = pile ? pile._value : 0;
    // Ставка заморожена при постановке, поэтому здесь только находка: сколько
    // нашли в кладовке столько и приходит. Переплата (ставка выше суммы)
// остаётся съеденной, недобор — наоборот, прибыль.
    p.money += value;
    // Заморозка превращается в оплаченную ставку: кладовка выкуплена.
    p.spent += p.held || 0;
    p.held = 0;
    p.won.push({
      round: this.state.round,
      lots: pile ? pile.items.map((i) => i.lotId) : [],
      name: pile ? pile.items.map((i) => i.name).join(', ') : [],
      count: pile ? pile.count : 0,
      bid,
      value,
      reason: 'Победил',
    });
  }

  finish() {
    this.clearTimer();
    this.state.phase = PHASES.FINISHED;
    this.state.currentPile = null;
    const winner = this.standings()[0];
    this.log(winner ? `Игра окончена. Победил ${winner.name} — ${winner.money} монет.` : 'Игра окончена.');
    this.onChange();
  }

  standings() {
    return this.players
      .filter((p) => p.connected)
      .sort((a, b) => b.money - a.money || a.name.localeCompare(b.name));
  }

  // ── Представление для сети ───────────────────────────────────────────

  // Скрытое (цену, полосу) наружу не отдаём: клиент её не знает до REVEAL.
  publicState() {
    const s = this.state;
    const pile = s.currentPile;
    // Разбор показывает состав только у проданной кладовки. Кладовку, лидер
    // которой ушёл с игры, не раскрываем: показывать её цену незачем, никто
    // за неё не заплатил.
    const revealed = !!(pile && pile._winner);
    const pilePublic = publicPile(pile, revealed);
    return {
      code: this.code,
      phase: s.phase,
      phaseMs: s.phaseMs || 0,
      round: s.round,
      totalRounds: RULES.totalRounds,
      timerEndsAt: s.timerEndsAt,
      serverNow: now(),
      hostId: s.hostId,
      rules: RULES,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        money: p.money,
        connected: p.connected,
        ready: p.ready,
        spent: p.spent || 0,
        // Сгоревшие разницы видны всем: по новым правилам игрок теряет не всю
        // ставку, а только разницу, и без этого счёт «потрачено» выглядит
        // неправдоподобно — будто он проиграл больше, чем вложил.
        burned: p.burned || 0,
        // Сколько у игрока сейчас заложено в текущем лоте. Пока ставка держится,
        // эти деньги не его: их вернут, если перебьют, и спишут, если лот купит.
        held: p.held || 0,
        // Перевес: отдал и получил. Показываем явно, иначе выглядит так, будто
        // деньги просто пропали.
        levyOut: p.levied || 0,
        levyIn: p.received || 0,
        // Его личный потолок ставки: игрок должен видеть границу заранее,
        // иначе не понимает, почему сервер отклонил ставку.
        bidCap: this.bidCapFor(p),
        won: p.won,
      })),
      // Аукцион открытый: текущая ставка и лидер видны всем, иначе перебивать
      // нечего. Игрок узнаёт себя по id, который сервер шлёт каждому.
      highBid: s.highBid,
      highBidder: s.highBidder,
      highBidderName: s.highBidderName,
      // Состав и цена видны только в разборе проданной кладовки.
      pile: pilePublic && Object.assign(pilePublic, {
        img: `/img/pile.svg?code=${this.code}&r=${s.round}`,
        revealed,
        value: revealed ? pile._value : null,
        bandLabel: revealed ? pile.bandLabel : null,
        winner: revealed ? pile._winner : null,
        winnerBid: revealed ? pile._winnerBid : null,
        second: revealed ? pile._second : null,
        bids: revealed ? pile._bids : null,
        // Лот без победителя бывает один: лидер ушёл с игры посреди торгов.
        // Тогда игрок должен понимать, почему его ставка не стала покупкой.
        void: !revealed && !!pile,
      }),
      standings: this.standings().map((p) => ({ id: p.id, name: p.name, money: p.money })),
      log: s.log.slice(-12),
    };
  }

  // Реванш: та же комната и те же игроки, но новый секрет и новый порядок
  // лотов. Старый secret больше не действует, иначе второй круг был бы
  // предсказуемым — цены повторились бы один в один.
  resetToLobby() {
    this.clearTimer();
    this.secret = Math.floor(Math.random() * 1e9).toString(36);
    this.decks = makeDecks(this.secret);
    this.played = new Set();
    this.drawing = new Set();
    this.state = {
      phase: PHASES.LOBBY,
      phaseMs: 0,
      round: 0,
      players: this.state.players,
      hostId: this.state.hostId,
      currentPile: null,
      highBid: null,
      highBidder: null,
      highBidderName: null,
      timerEndsAt: 0,
      log: [],
      startedAt: 0,
    };
    for (const p of this.state.players.values()) {
      p.money = RULES.startMoney;
      p.won = [];
      p.spent = 0;
      p.burned = 0;
      p.ready = false;
      p.connected = true;
    }
    this.log('Реванш: лоты перемешаны заново, деньги сброшены.');
    this.onChange();
  }

  log(line) {
    this.state.log.push(`[${new Date().toISOString().slice(11, 16)}] ${line}`);
    if (this.state.log.length > 200) this.state.log.shift();
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy() {
    this.clearTimer();
    this.state.players.clear();
  }
}
