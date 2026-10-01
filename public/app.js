// Клиент: тонкий слой над состоянием с сервера. Сервер — источник правды,
// клиент только рисует его снимки и отправляет намерения.

const $ = (id) => document.getElementById(id);
const socket = io();

let me = null;        // наш id
let state = null;     // последний снимок
let raf = null;
let minBid = 1;       // минимальная ставка, которую сейчас принимает сервер

// ── Экраны ───────────────────────────────────────────────────────────

const SCREENS = ['scr-auth', 'scr-lobby', 'scr-game', 'scr-over'];
function show(id) {
  for (const s of SCREENS) $(s).classList.toggle('active', s === id);
  window.scrollTo(0, 0);
}

function toast(msg, ms = 2200) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), ms);
}

// ── Игра ─────────────────────────────────────────────────────────────

const PHASE_NAME = {
  lobby: 'ожидание',
  bid: 'торги',
  reveal: 'разбор',
  finished: 'финиш',
};

function render() {
  if (!state) return;
  const st = state;

  if (st.phase === 'lobby') return renderLobby(st);
  if (st.phase === 'finished') return renderOver(st);
  renderRound(st);
  tick();
}

function renderLobby(st) {
  show('scr-lobby');
  $('lobby-code').textContent = st.code;
  $('lobby-max').textContent = st.rules.maxPlayers;
  $('r-rounds').textContent = st.rules.totalRounds;
  $('r-start').textContent = st.rules.startMoney;
  $('r-income').textContent = '+' + st.rules.incomePerRound;

  const ul = $('lobby-players');
  ul.innerHTML = '';
  for (const p of st.players) {
    const li = document.createElement('li');
    li.className = 'player' + (p.ready ? ' ready' : '') + (p.connected ? '' : ' gone');
    li.innerHTML = `<span>${esc(p.name)}${p.id === st.hostId ? ' <i class="crown">хост</i>' : ''}</span>
      <span class="pip">${p.connected ? (p.ready ? 'готов' : 'ждёт') : 'вышел'}</span>`;
    ul.appendChild(li);
  }

  const iAmHost = st.hostId === me;
  const btn = $('b-start');
  const online = st.players.filter((p) => p.connected).length;
  btn.style.display = iAmHost ? '' : 'none';
  btn.disabled = online < st.rules.minPlayers;
  btn.textContent = iAmHost ? `Начать игру (${online})` : 'Ждём хоста';

  const rdy = $('b-ready');
  const mine = st.players.find((p) => p.id === me);
  rdy.classList.toggle('on', !!(mine && mine.ready));
  rdy.textContent = mine && mine.ready ? 'не готов' : 'я готов';
}

function renderRound(st) {
  show('scr-game');
  $('g-round').textContent = `${st.round}/${st.totalRounds}`;
  $('g-phase').textContent = PHASE_NAME[st.phase] || st.phase;

  if (st.pile) {
    if ($('g-img').getAttribute('src') !== st.pile.img) $('g-img').setAttribute('src', st.pile.img);
    $('g-name').textContent = 'кладовка';
    $('g-tier').textContent = st.pile.revealed ? (st.pile.bandLabel || '') : 'цена скрыта';
    $('q-count').textContent = st.pile.count;

    // Список вещей виден только в разборе: раньше он стоял в карточке и
    // раскрывал состав ещё в статусе «осмотр», которого теперь нет. Показываем
    // его как «картинка — цена», от самой дорогой, чтобы было видно, откуда
    // взялась сумма кладовки.
    const ul = $('g-items');
    ul.innerHTML = '';
    const revealed = !!st.pile.revealed;
    ul.style.display = revealed ? '' : 'none';
    $('g-items-hint').hidden = !revealed;
    if (revealed) {
      const rows = st.pile.items.slice().sort((a, b) => (b.value || 0) - (a.value || 0));
      for (const it of rows) {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = `/img/${it.lotId}.svg`;
        img.alt = '';
        img.loading = 'lazy';
        const nm = document.createElement('span');
        nm.className = 'nm';
        nm.textContent = it.name;
        const pr = document.createElement('span');
        pr.className = 'pr';
        pr.innerHTML = `${it.value || 0} <i class="coin"></i>`;
        li.append(img, nm, pr);
        ul.appendChild(li);
      }
    }
  } else {
    $('g-img').removeAttribute('src');
    $('g-items').innerHTML = '';
    $('g-items').style.display = 'none';
    $('g-items-hint').hidden = true;
    $('g-name').textContent = '—';
    $('g-tier').textContent = '';
    $('q-count').textContent = '—';
  }

  $('g-bid').style.display = st.phase === 'bid' ? '' : 'none';
  $('g-reveal').style.display = st.phase === 'reveal' ? '' : 'none';

  const my = st.players.find((p) => p.id === me);
  $('g-money').textContent = my ? my.money : 0;

  if (st.phase === 'bid') {
    const meIsLeader = !!st.highBidder && st.highBidder === me;
    $('g-leader').textContent = st.highBidderName || 'никто';
    $('g-highbid').textContent = st.highBid === null ? '—' : st.highBid;
    $('g-bidhint').textContent = st.highBid === null
      ? 'кто первый поставит — тот лидер'
      : (meIsLeader ? 'вы лидер. ждём, пока перебьют' : 'перебей, пока не истекло окно');

    // Потолок берём из снимка: сервер считает его как 90% капитала, но не выше
    // общей крыши комнаты. Считать здесь заново нельзя — правило перестало быть
    // «90% от денег», и клиент рано или поздно разойдётся с сервером.
    const cap = my && typeof my.bidCap === 'number' ? my.bidCap : 0;
    $('q-max').textContent = cap;
    $('q-maxnote').textContent = cap < st.rules.bidCap
      ? 'потолок по деньгам'
      : `общий потолок ${st.rules.bidCap}`;
    const min = st.highBid === null ? 1 : st.highBid + (st.rules.minStep || 10);
    minBid = min;
    $('g-amount').min = min;

    // Лидеру перебивать нечего, и подставлять за него следующую ставку тоже
    // незачем — он и так держит лот.
    const locked = meIsLeader || (cap < min);
    $('b-bid').disabled = locked;
    $('g-amount').disabled = locked;
    for (const c of document.querySelectorAll('.chip')) {
      c.disabled = locked;
      c.textContent = '+' + c.dataset.step;
    }
    $('g-bidstate').style.display = meIsLeader ? '' : 'none';
    if (meIsLeader) $('g-bidstate').textContent = 'вы лидер';

    // Поле заполняем минимально допустимой ставкой, чтобы не вводить руками.
    if (!$('g-amount').matches(':focus')) $('g-amount').placeholder = String(min);
  }

  if (st.phase === 'reveal' && st.pile) {
    // Лот, лидер которого ушёл с игры, не разбираем: сумма неизвестна, а
    // показывать её незачем — никто за неё не заплатил.
    if (st.pile.void) {
      $('g-value').textContent = '—';
      $('g-valuesub').textContent = '';
      $('g-winner').textContent = 'Кладовка не выкуплена';
    } else {
      $('g-value').innerHTML = `${st.pile.value} <i class="coin"></i>`;
      $('g-valuesub').textContent = st.pile.bandLabel || '';
      $('g-winner').textContent = st.pile.winner
        ? `${st.pile.winner} — ставка ${st.pile.winnerBid}`
        : 'Кладовка ушла с молотка';
    }
  }

  const ul = $('g-players');
  ul.innerHTML = '';
  for (const p of st.standings) {
    const live = st.players.find((x) => x.id === p.id);
    const li = document.createElement('li');
    li.className = 'player' + (p.id === me ? ' me' : '') + (live && live.connected ? '' : ' gone');
    const marked = st.phase === 'bid' && live && st.highBidder === p.id;
    // Заложено показываем у лидера: его ставка сейчас заморожена, и по новым
    // правилам именно разница между ставками сгорает при перебитии. Без этой
    // подсказки счёт «потрачено» выглядит так, будто деньги уже сгорели.
    const held = marked && live.held ? ` <i class="hold">в лоте ${live.held}</i>` : '';
    // Перевес показываем у обоих концов: без отметки капитал лидера молча
    // уменьшается, и выглядит это как ошибка сервера, а не как правило.
    const levy = live.levyOut
      ? ` <i class="hold">перевёл ${live.levyOut}</i>`
      : (live.levyIn ? ` <i class="hold">получил ${live.levyIn}</i>` : '');
    li.innerHTML = `<span>${esc(p.name)}${marked ? ' <i class="crown">ставка</i>' : ''}${held}${levy}</span>
      <span class="nums"><b>${p.money}</b> <i class="coin"></i></span>`;
    ul.appendChild(li);
  }
}

function renderOver(st) {
  show('scr-over');
  const ol = $('o-table');
  ol.innerHTML = '';
  st.standings.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'row' + (p.id === me ? ' me' : '');
    li.innerHTML = `<span class="place">${i + 1}</span>
      <span class="nm">${esc(p.name)}</span>
      <span class="sc">${p.money} <i class="coin"></i></span>`;
    ol.appendChild(li);
  });
  $('b-again').style.display = st.hostId === me ? '' : 'none';
}

// ── Таймер: считаем от serverNow, чтобы не зависеть от дрейфа часов ────

function tick() {
  cancelAnimationFrame(raf);
  if (!state || state.phase === 'lobby' || state.phase === 'finished') return;
  const step = () => {
    if (!state) return;
    const left = Math.max(0, state.timerEndsAt - (Date.now() + (state.serverOffset || 0)));
    const sec = Math.ceil(left / 1000);
    $('g-timer').style.width = (left / (state.phaseMs || 1) * 100) + '%';
    $('g-timer-text').textContent = sec;
    $('g-secs').textContent = sec;
    raf = requestAnimationFrame(step);
  };
  step();
}

// ── Сеть ─────────────────────────────────────────────────────────────

socket.on('connect', () => { me = socket.id; });

socket.on('state', (st) => {
  state = st;
  state.serverOffset = st.serverNow - Date.now();
  render();
});

function join(action) {
  const name = $('f-name').value.trim() || 'Игрок';
  $('auth-err').textContent = '';
  socket.emit(action, action === 'create' ? { name } : { name, code: $('f-code').value.trim() }, (res) => {
    if (res && res.error) { $('auth-err').textContent = res.error; return; }
    rememberName(name);
  });
}

// Имя держим в localStorage: раньше оно жило только в поле ввода и пропадало
// при перезаходе на страницу, поэтому каждый раз приходилось вводить заново.
const NAME_KEY = 'lotsgame.name';
function rememberName(name) {
  try { localStorage.setItem(NAME_KEY, name); } catch (e) { /* приватный режим */ }
}
function savedName() {
  try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; }
}
$('f-name').value = savedName();

$('b-create').onclick = () => join('create');
$('b-join').onclick = () => join('join');
$('f-code').addEventListener('keydown', (e) => { if (e.key === 'Enter') join('join'); });
$('f-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') join('create'); });

function leaveRoom() {
  socket.emit('leave');
  // Сервер выводит сокета из комнаты и больше не шлёт ему снимки, поэтому
  // экран переключаем сами: иначе он навсегда замирает на последнем виде.
  // Имя не стираем — его подставит следующий вход, см. rememberName.
  state = null;
  $('f-code').value = '';
  $('auth-err').textContent = '';
  show('scr-auth');
}

$('b-start').onclick = () => socket.emit('start', {}, (r) => { if (r && r.error) toast(r.error); });
$('b-ready').onclick = () => socket.emit('ready', {}, (r) => { if (r && r.error) toast(r.error); });
$('b-leave').onclick = leaveRoom;
$('b-quit').onclick = leaveRoom;
$('b-out').onclick = leaveRoom;
$('b-again').onclick = () => socket.emit('rematch', {}, (r) => {
  if (r && r.error) return toast(r.error);
});

$('b-bid').onclick = () => {
  // Пустое поле — это «поставь минимальную», а не ноль. Раньше сюда уходила
  // единица, и нажатие «перебить» без ввода цифр отбивалось сервером.
  const typed = $('g-amount').value.trim();
  const want = typed === '' ? minBid : Math.round(Number(typed));
  const amount = Math.max(minBid, Number.isFinite(want) ? want : minBid);
  socket.emit('raise', { amount }, (r) => {
    if (r && r.error) { $('g-err').textContent = r.error; return; }
    $('g-err').textContent = '';
    $('g-amount').value = '';
  });
};

// Чипы прибавляют к уже введённому числу, а не подставляют своё: раньше
// повторное нажатие давало то же самое значение, и кнопка выглядела сломанной.
for (const chip of document.querySelectorAll('.chip')) {
  chip.onclick = () => {
    const typed = $('g-amount').value.trim();
    const base = typed === '' ? (state && state.highBid !== null ? state.highBid : 0) : Math.round(Number(typed));
    $('g-amount').value = Math.max(minBid, (Number.isFinite(base) ? base : 0) + Number(chip.dataset.step));
  };
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
