// HTTP + Socket.IO. Сервер держит комнаты в памяти: без базы игра не
// переживает перезапуск, но для вечеринки в одном Wi-Fi этого достаточно.

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { Game, PHASES, RULES } from './src/game.js';
import { renderPile } from './tools/art/pile-art.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Оболочку и стили отдаём без кэша: иначе игрок, открывший страницу до
// правки, продолжает видеть старую вёрстку и не знает об этом. Картинки
// предметов и SVG кладовки кэшировать можно — они меняются по номеру раунда.
// Заголовок ставим через setHeaders: express.static перетирает всё, что
// выставлено до него.
const noCache = ['index.html', 'app.js', 'style.css'];
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (noCache.includes(path.basename(filePath))) res.setHeader('Cache-Control', 'no-cache');
  },
}));

// Картинка кладовки собирается на лету из состава, который сервер уже выдал
// игрокам. Отдельный файл на каждый раунд не нужен: раскладка детерминирована
// кодом комнаты и номером раунда, поэтому SVG кэшируется браузером.
app.get('/img/pile.svg', (req, res) => {
  const code = String(req.query.code || '').toUpperCase();
  const round = Number(req.query.r) || 0;
  const room = rooms.get(code);
  const pile = room && room.state.currentPile;

  if (!pile || (round && round !== room.state.round)) {
    return res.status(404).type('text/plain').send('Кладовка не найдена');
  }
  try {
    const svg = renderPile(pile, `${code}/${round}`);
    res.type('image/svg+xml');
    res.set('Cache-Control', 'private, max-age=60');
    res.send(svg);
  } catch (err) {
    res.status(500).type('text/plain').send(String(err && err.message));
  }
});

// Комнаты живут, пока в них есть хоть один подключённый сокет.
const rooms = new Map();

// onChange держим отдельно от broadcast: комната создаётся раньше, чем её
// увидит первый игрок, и колбэк всё равно должен быть на месте сразу.
function createRoom(code) {
  const room = new Game(code);
  room.onChange = () => {
    if (rooms.get(code) === room) broadcast(room);
  };
  rooms.set(code, room);
  return room;
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без похожих 0/O, 1/I
  let code = '';
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return rooms.has(code) ? makeCode() : code;
}

function getRoom(code) {
  return rooms.get(code);
}

function broadcast(room) {
  io.to(room.code).emit('state', room.publicState());
}

// Вход в существующую комнату. Комната обязана уже существовать: иначе
// опечатка в коде молча создавала бы новую пустую комнату.
function enterRoom(socket, room, name, cb) {
  // Заходить в начавшуюся игру нельзя. Новое место получает 1000 монет и пустую
  // историю выигрышей, так что вход на середине — это бесплатный сброс капитала
  // (и дубль игрока, если кто-то перезагрузил страницу посреди раунда).
  // Своего игрока опознаём по id сокета: переподключившийся без смены id
  // попадать обратно в партию должен.
  const mine = room.state.players.get(socket.data.pid);
  if (!mine && room.state.phase !== PHASES.LOBBY) {
    return cb && cb({ error: 'Игра уже началась — дождись её конца' });
  }
  if (room.players.length >= RULES.maxPlayers && !mine) {
    return cb && cb({ error: 'Комната заполнена' });
  }
  // Смена комнаты: из прежней надо выйти, иначе игрок остаётся в чужой игре.
  if (socket.data.room && socket.data.room !== room.code) leaveRoom(socket);

  const p = room.addPlayer(socket.data.pid, name);
  socket.join(room.code);
  socket.data.room = room.code;
  room.log(`${p.name} в комнате.`);
  broadcast(room);
  // Наружу отдаём только факт успеха: сам Game содержит secret, по которому
  // считаются цены всех лотов, отдавать его клиенту нельзя.
  return cb && cb({ ok: true });
}

function leaveRoom(socket) {
  const code = socket.data.room;
  if (!code) return;
  const room = rooms.get(code);
  socket.leave(code);
  socket.data.room = null;
  if (!room) return;

  const p = room.state.players.get(socket.data.pid);
  room.removePlayer(socket.data.pid);
  if (p) room.log(`${p.name} вышел.`);
  // Пустая комната — выбрасываем, иначе память растёт бесконечно.
  if (room.players.every((x) => !x.connected)) {
    room.destroy();
    rooms.delete(code);
    return;
  }
  // Если хост ушёл, а игра уже идёт — просто отдаём права следующему.
  if (room.state.hostId === socket.data.pid) {
    const next = room.players.find((x) => x.connected);
    room.state.hostId = next ? next.id : null;
  }
  broadcast(room);
}

io.on('connection', (socket) => {
  socket.data.pid = socket.id;

  socket.on('create', ({ name } = {}, cb) => {
    const code = makeCode();
    const room = createRoom(code);
    enterRoom(socket, room, name, cb);
  });

  socket.on('join', ({ code, name } = {}, cb) => {
    const clean = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(clean)) {
      return cb && cb({ error: 'Код комнаты — 4 символа' });
    }
    const room = getRoom(clean);
    if (!room) return cb && cb({ error: 'Комната не найдена' });
    enterRoom(socket, room, name, cb);
  });

  // Без явного флага переключаем текущее состояние — кнопка в лобби шлёт
  // `ready` без аргументов. С явным флагом поведение остаётся прежним.
  socket.on('ready', ({ ready } = {}, cb) => {
    const room = rooms.get(socket.data.room);
    if (!room) return cb && cb({ error: 'Комната не найдена' });
    const next = typeof ready === 'boolean' ? ready : !room.isReady(socket.data.pid);
    room.setReady(socket.data.pid, next);
    broadcast(room);
    if (typeof cb === 'function') cb({ ok: true });
  });

  socket.on('start', (_ = {}, cb) => {
    const room = rooms.get(socket.data.room);
    if (!room) return;
    if (room.state.hostId !== socket.data.pid) return cb && cb({ error: 'Стартует только хост' });
    if (room.state.phase !== PHASES.LOBBY) return cb && cb({ error: 'Игра уже идёт' });
    if (!room.start()) return cb && cb({ error: `Нужно минимум ${RULES.minPlayers} игрока` });
    broadcast(room);
    if (cb) cb({ ok: true });
  });

  // Ставка или перебитие. Имя события не 'bid', потому что теперь это не
  // закрытая ставка, а открытый аукцион: перебить можно сколько угодно раз.
  socket.on('raise', ({ amount } = {}, cb) => {
    const room = rooms.get(socket.data.room);
    if (!room) return cb && cb({ error: 'Комната не найдена' });
    const res = room.raise(socket.data.pid, amount);
    broadcast(room);
    if (typeof cb === 'function') cb(res);
  });

  socket.on('rematch', (_ = {}, cb) => {
    const room = rooms.get(socket.data.room);
    if (!room) return;
    if (room.state.hostId !== socket.data.pid) return cb && cb({ error: 'Реванш запрашивает хост' });
    room.resetToLobby();
    broadcast(room);
    if (cb) cb({ ok: true });
  });

  // Ack, если клиент его запросил, приходит последним аргументом; без ack
  // на его месте может оказаться объект-полезная нагрузка, и он не функция.
  socket.on('leave', (_payload, cb) => {
    leaveRoom(socket);
    if (typeof cb === 'function') cb({ ok: true });
  });
  socket.on('disconnect', () => leaveRoom(socket));
});

server.listen(PORT, () => {
  console.log(`Аукцион кладовок: http://localhost:${PORT}`);
});
