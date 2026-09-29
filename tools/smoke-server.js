// Сетевой smoke-тест: поднимаем настоящий server.js, заходим двумя клиентами
// через HTTP long-polling (socket.io-client в зависимостях нет) и проверяем
// лобби, старт и раздачу состояния.
//
//   node tools/smoke-server.js

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;
const URL_BASE = `${BASE}/socket.io/?EIO=4&transport=polling`;

let failures = 0;
function check(name, cond, extra = '') {
  if (cond) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// Разбор длинного ответа long-polling. В engine.io v4 пакеты склеены
// разделителем-record \x1e; префикс <длина>: встречается в v3, поддерживаем.
function parsePackets(text) {
  if (/^\d+:/.test(text)) {
    const out = [];
    let i = 0;
    while (i < text.length) {
      const colon = text.indexOf(':', i);
      if (colon < 0) break;
      const len = Number(text.slice(i, colon));
      if (!Number.isFinite(len)) break;
      out.push(text.slice(colon + 1, colon + 1 + len));
      i = colon + 1 + len;
    }
    return out;
  }
  return text.split('\x1e').filter((p) => p.length);
}

class Client {
  constructor(name) {
    this.name = name;
    this.sid = null;
    this.ackId = 0;
    this.state = null;
    this.states = [];
  }

  async open() {
    this.open = true;
    const res = await fetch(`${URL_BASE}&t=${Date.now()}`);
    const packets = parsePackets(await res.text());
    const open = packets.map((p) => JSON.parse(p.slice(1))).find((x) => x.sid);
    if (!open) throw new Error('нет open-пакета: ' + JSON.stringify(packets));
    this.sid = open.sid;
    await this.post('40'); // CONNECT к пространству имён по умолчанию
    this.pump();
  }

  post(body) {
    return fetch(`${URL_BASE}&sid=${this.sid}&t=${Date.now()}`, { method: 'POST', body });
  }

  async emit(event, data = {}) {
    const id = ++this.ackId;
    // Слушаем ack ДО отправки, иначе быстрый ответ можно проспать.
    const ack = this.wait((_d, ackId) => ackId === id);
    // Протокол v4: ack-идентификатор стоит сразу после типа пакета,
    // перед JSON-массивом: 42<id>["event",{...}]
    await this.post(`42${id}${JSON.stringify([event, data])}`);
    return ack;
  }

  // Разбираем входящие пакеты: 2 -> ping, 42 -> событие, 43 -> ack.
  async pump() {
    if (this.busy) return;
    this.busy = true;
    try {
      const res = await fetch(`${URL_BASE}&sid=${this.sid}&t=${Date.now()}`);
      for (const p of parsePackets(await res.text())) {
        if (p === '2') { await this.post('3'); continue; }
        if (p === '0') continue;
        if (p.startsWith('42')) {
          const [event, payload] = JSON.parse(p.slice(2));
          if (event === 'state') { this.state = payload; this.states.push(payload); }
          this.wake(event, payload);
        } else if (p.startsWith('43')) {
          // Ответ: 43<id>[<аргументы>] — id префиксом, полезный ответ args[0].
          const m = /^(\d*)([\s\S]*)$/.exec(p.slice(2));
          const args = JSON.parse(m[2]);
          this.wake(null, Array.isArray(args) ? args[0] : args, m[1] ? Number(m[1]) : undefined);
        }
      }
    } catch { /* сервер мог закрыться в конце теста */ }
    this.busy = false;
    if (this.open) setTimeout(() => this.pump(), 60);
  }

  // Простой примитив ожидания: кто первый поднял руку, того и слушаем.
  wait(pred, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const h = setTimeout(() => { this.listeners = this.listeners.filter((l) => l !== entry); reject(new Error('таймаут ожидания')); }, timeout);
      const entry = (event, data, id) => {
        if (!pred(data, id, event)) return;
        clearTimeout(h);
        this.listeners = this.listeners.filter((l) => l !== entry);
        resolve(data);
      };
      this.listeners = this.listeners || [];
      this.listeners.push(entry);
      if (this.state) setTimeout(() => this.pump(), 10);
    });
  }

  wake(event, data, id) {
    for (const l of this.listeners || []) l(event, data, id);
  }

  waitState(pred, timeout = 6000) {
    // Состояние могло прийти до того, как мы начали ждать.
    if (this.state && pred(this.state)) return Promise.resolve(this.state);
    return this.wait((_d, _i, event) => event === 'state' && pred(this.state), timeout);
  }

  close() {
    this.open = false;
    this.post('41').catch(() => {});
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Поднимаем сервер ─────────────────────────────────────────────────

console.log('\n[1] Сервер поднимается');
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let out = '';
srv.stdout.on('data', (d) => { out += d; });
srv.stderr.on('data', (d) => { out += d; process.stderr.write(d); });

const deadline = Date.now() + 8000;
while (!out.includes('http://localhost') && Date.now() < deadline) await sleep(100);
check('процесс поднялся', out.includes(`:${PORT}`), out.slice(0, 200));

// ── Статика ──────────────────────────────────────────────────────────

console.log('\n[2] Статика отдаётся');
const home = await fetch(`${BASE}/`);
const homeBody = await home.text();
check('главная 200', home.status === 200, String(home.status));
check('в html есть заголовок', homeBody.includes('Аукцион'));
const img = await fetch(`${BASE}/img/lot-001.svg`);
check('картинка лота 200', img.status === 200, String(img.status));
check('картинка — svg', (img.headers.get('content-type') || '').includes('svg'));

// Без клиентской библиотеки socket.io в app.js падает io() и кнопки не работают.
const lib = await fetch(`${BASE}/socket.io/socket.io.js`);
const libBody = await lib.text();
check('клиент socket.io отдаётся', lib.status === 200, String(lib.status));
check('это действительно клиент', /Socket\.IO v4/.test(libBody), libBody.slice(0, 40));
check('скрипт подключён в html', homeBody.includes('/socket.io/socket.io.js'));

// ── Два клиента: комната, старт ───────────────────────────────────────

console.log('\n[3] Два клиента в комнате');
const a = new Client('Аня');
const b = new Client('Борис');
await a.open();
await b.open();

const created = await a.emit('create', { name: 'Аня' });
check('комната создана', created && created.ok, JSON.stringify(created));

// Код комнаты берём из присланного состояния.
await a.waitState((s) => s && s.phase === 'lobby');
const code = a.state.code;
check('код из 4 символов', /^[A-Z0-9]{4}$/.test(code), code);

const joined = await b.emit('join', { name: 'Борис', code });
check('второй вошёл', joined && joined.ok, JSON.stringify(joined));
await b.waitState((s) => s && s.players.length === 2);

const bad = await b.emit('join', { name: 'В', code: 'ZZZZ' });
check('несуществующая комната отклонена', !!(bad && bad.error), JSON.stringify(bad));

check('у обоих по 2 игрока', a.state.players.length === 2 && b.state.players.length === 2);
check('в снимке нет secret', !JSON.stringify(a.state).includes('secret'));
check('в снимке нет поля bid', a.state.players.every((p) => !('bid' in p)));
check('в лобби кладовки нет', a.state.pile === null);

// ── Старт ────────────────────────────────────────────────────────────

console.log('\n[4] Старт игры');
const early = await b.emit('start', {});
check('не-хост не может стартовать', !!(early && early.error), JSON.stringify(early));

const started = await a.emit('start', {});
check('хост стартовал', started && started.ok, JSON.stringify(started));
await a.waitState((s) => s.phase === 'bid');
await b.waitState((s) => s.phase === 'bid');
check('игра сразу пошла на торги', a.state.phase === 'bid' && b.state.phase === 'bid');
check('раунд 1', a.state.round === 1);
check('после старта кладовка есть', !!a.state.pile);
check('есть таймер фазы', a.state.phaseMs > 0, String(a.state.phaseMs));
check('таймер торгов — 20 секунд', a.state.phaseMs === 20000, String(a.state.phaseMs));
check('у обоих одинаковая кладовка',
  JSON.stringify(a.state.pile.items) === JSON.stringify(b.state.pile.items));
check('доход начислен', a.state.players.every((p) => p.money === 1000 + 50));
check('таймер в будущем', a.state.timerEndsAt > Date.now());

// Человек со второй вкладкой не должен вскакивать в партию на середине:
// новое место приходит со стартовыми 1000 монетами и без выигрышей.
const latecomer = new Client('Латекомер');
await latecomer.open();
const late = await latecomer.emit('join', { name: 'Латекомер', code });
check('вход в начавшуюся игру отклонён', !!(late && late.error), JSON.stringify(late));
await sleep(200);
check('посторонний не попал в партию', a.state.players.length === 2, `игроков: ${a.state.players.length}`);
check('у лишнего нет снимка игры', !latecomer.state || latecomer.state.code !== code);
latecomer.close();

// ── Кладовка ────────────────────────────────────────────────────────

console.log('\n[6] Картинка кладовки');
const pile = a.state.pile;
check('кладовка в снимке', !!pile, JSON.stringify(pile));
check('в кладовке несколько предметов', pile.count >= 2, `предметов: ${pile.count}`);
check('состав виден игроку', pile.items.length === pile.count);
check('цена скрыта в торгах', pile.value === null);
check('цены вещей скрыты в торгах', pile.items.every((i) => !('value' in i)));
check('нет служебных полей', !JSON.stringify(pile).includes('_value'));

const pileRes = await fetch(`${BASE}${pile.img}`);
const pileSvg = await pileRes.text();
check('картинка кладовки 200', pileRes.status === 200, String(pileRes.status));
check('это svg', (pileRes.headers.get('content-type') || '').includes('svg'));
check('svg непустой', pileSvg.length > 2000, `${pileSvg.length} байт`);
check('svg корректно начинается', pileSvg.startsWith('<svg'));
// Предметов нарисованных должно быть не меньше, чем в составе: иначе часть
// фигур не нашлась по ключу и кладовка выглядит пустой. Считаем группы по
// data-layer: у предметов этот атрибут стоит первым, поэтому поиск по
// "<g transform" после его появления перестал бы находить фигуры.
const drawn = (pileSvg.match(/data-layer="(front|back)"/g) || []).length;
check('нарисованы все предметы', drawn >= pile.count, `групп: ${drawn}, предметов: ${pile.count}`);
check('есть передний план', (pileSvg.match(/data-layer="front"/g) || []).length >= 3,
  `передних: ${(pileSvg.match(/data-layer="front"/g) || []).length}`);
check('обе версии кладовки совпадают', await (await fetch(`${BASE}${b.state.pile.img}`)).text() === pileSvg);

const badPile = await fetch(`${BASE}/img/pile.svg?code=ZZZZ&r=1`);
check('чужая комната не отдаёт кладовку', badPile.status === 404, String(badPile.status));

// ── Открытый аукцион ──────────────────────────────────────────────────

console.log('\n[5] Открытый аукцион: перебития');
// Первая ставка открывает торги и сгорает сразу.
const r1 = await a.emit('raise', { amount: 100 });
check('первая ставка принята', !!(r1 && r1.ok), JSON.stringify(r1));
await b.waitState((s) => s && s.highBid === 100);
check('ставка видна сопернику сразу', b.state.highBid === 100, String(b.state.highBid));
check('лидер виден сопернику', b.state.highBidderName === 'Аня', b.state.highBidderName);
const moneyA0 = a.state.players.find((p) => p.name === 'Аня').money;
check('ставка списана с лидера', moneyA0 === 1050 - 100, String(moneyA0));

// Шаг в 10 монет: меньше нельзя, ровно шаг — можно.
const tiny = await b.emit('raise', { amount: 105 });
check('перебитие меньше шага отклонено', !!(tiny && tiny.error), JSON.stringify(tiny));
const r2 = await b.emit('raise', { amount: 110 });
check('перебитие на шаг принято', !!(r2 && r2.ok), JSON.stringify(r2));
await a.waitState((s) => s && s.highBid === 110);
check('окно на перебитие — 10 секунд', a.state.phaseMs === 10000, String(a.state.phaseMs));
const moneyB0 = b.state.players.find((p) => p.name === 'Борис').money;
check('ставка перебитого не вернулась', moneyB0 === 1050 - 110, String(moneyB0));

// Аня возвращается и перебивает обратно: теперь лот её.
const r3 = await a.emit('raise', { amount: 120 });
check('прежний лидер перебил обратно', !!(r3 && r3.ok), JSON.stringify(r3));
await b.waitState((s) => s && s.highBid === 120 && s.highBidderName === 'Аня');

// Дальше никто не перебивает, поэтому лот уходит лидеру по таймеру окна.
await a.waitState((s) => s.phase === 'reveal', 20000);
await b.waitState((s) => s.phase === 'reveal', 20000);
check('лот ушёл лидеру последней ставки', a.state.pile.winner === 'Аня', String(a.state.pile.winner));
check('победил по ставке 120', a.state.pile.winnerBid === 120, String(a.state.pile.winnerBid));
check('в разборе видны цены вещей', a.state.pile.items.every((i) => typeof i.value === 'number'));
check('разбор отсортирован по убыванию',
  a.state.pile.items.every((i, k, arr) => k === 0 || arr[k - 1].value >= i.value));
check('сумма вещей равна цене кладовки',
  a.state.pile.items.reduce((t, i) => t + i.value, 0) === a.state.pile.value);

// Ставка 120 сгорела у обоих: у Ани 100, потом 120, у Бориса 110.
const finalA = a.state.players.find((p) => p.name === 'Аня');
const finalB = b.state.players.find((p) => p.name === 'Борис');
check('все ставки сгорели', finalA.spent === 220 && finalB.spent === 110,
  `Аня ${finalA.spent}, Борис ${finalB.spent}`);

// ── Выход из комнаты ──────────────────────────────────────────────────

console.log('\n[7] Выход из комнаты');
const x = new Client('Уходящий');
const y = new Client('Оставшийся');
await x.open();
await y.open();
await x.emit('create', { name: 'Уходящий' });
await x.waitState((s) => s && s.phase === 'lobby');
const leaveCode = x.state.code;
await y.emit('join', { name: 'Оставшийся', code: leaveCode });
await y.waitState((s) => s && s.players.length === 2);

const leaveAck = await Promise.race([x.emit('leave'), sleep(1500).then(() => 'НЕТ ACK')]);
await sleep(600);
check('выход подтверждён сервером', !!(leaveAck && leaveAck.ok), JSON.stringify(leaveAck));
// Вышедшего не удаляют, а помечают отключённым: в идущей партии у него
// остаются деньги и история выигрышей, которые видно в финале.
// Ищем по имени: рукописный клиент этого теста знает только Engine.IO sid,
// а не socket.id, которым сервер метит игроков.
const gone = y.state.players.find((p) => p.name === 'Уходящий');
check('вышедший помечен отключённым', !!gone && gone.connected === false);
check('оставшийся всё ещё в комнате', !!y.state.players.find((p) => p.name === 'Оставшийся' && p.connected));
check('у оставшегося всё ещё есть игра', y.state.code === leaveCode && !!y.state.rules);

// Вышедшему снимки больше не летят, поэтому клиент обязан переключить экран
// сам — иначе он навсегда замирает на последнем виде (кнопка «выйти»).
const seenBefore = x.state;
await y.emit('ready', { ready: true });
await sleep(300);
check('вышедшему больше не шлют состояние', x.state === seenBefore);

// Кнопка «я готов» шлёт `ready` без флага — сервер обязан переключать состояние,
// иначе игрок не может снять готовность.
const readyOf = (p) => p.state.players.find((q) => q.name === 'Оставшийся');
check('готовность выставляется', readyOf(y).ready === true);
await y.emit('ready');
await sleep(200);
check('повторное нажатие снимает готовность', readyOf(y).ready === false);
await y.emit('ready', { ready: true });
await sleep(200);
check('явный флаг по-прежнему работает', readyOf(y).ready === true);
y.close(); x.close();

a.close(); b.close();
await sleep(100);
srv.kill();
await sleep(200);

console.log(failures === 0 ? '\nСетевой smoke-тест пройден.\n' : `\nПровалено проверок: ${failures}\n`);
process.exit(failures === 0 ? 0 : 1);
