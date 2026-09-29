// Каталог из 100 предметов-превью.
// 60 дешёвых / 30 средних / 10 дорогих. Ни одна картинка не повторяется.
//
// t — тир картинки (cheap | mid | rich). Только он решает, как рисуется картинка.
// v — НАСТОЯЩАЯ цена предмета, фиксированная навсегда. Золотой слиток всегда
// стоит 700, погнутая миска всегда 6. Цена не бросается каждый раунд заново:
// это единственный способ, при котором игрок может со временем выучить каталог
// и начать оценивать кладовку по картинке.
//
// Связи между v и t нет: внутри каждого тира цены разбросаны, а часть дорогих
// вещей стоит недорого (метеорит — 320 при золотом слитке в 700). Поэтому
// «богатая картинка» остаётся намёком, но не ответом.
//
// s — ключ функции отрисовки в tools/art/shapes-*.js

export const CATALOG = [
  // ── ДЕШЁВЫЙ ЛУТ (60) ────────────────────────────────────────────────
  { n: 'Ваза с трещиной',        t: 'cheap', v: 6,   s: 'vase' },
  { n: 'Стул с отбитой спинкой', t: 'cheap', v: 5,   s: 'chair' },
  { n: 'Стопка покрышек',        t: 'cheap', v: 8,   s: 'tires' },
  { n: 'Картонные коробки',      t: 'cheap', v: 5,   s: 'boxes' },
  { n: 'Мешки с мусором',        t: 'cheap', v: 7,   s: 'trashbags' },
  { n: 'Пустая жестянка',        t: 'cheap', v: 5,   s: 'can' },
  { n: 'Погнутая миска',         t: 'cheap', v: 6,   s: 'bowl' },
  { n: 'Сломанная лампа',        t: 'cheap', v: 9,   s: 'lampBroken' },
  { n: 'Старые ботинки',         t: 'cheap', v: 7,   s: 'boots' },
  { n: 'Стопка книг',            t: 'cheap', v: 11,  s: 'books' },
  { n: 'Пустые бутылки',         t: 'cheap', v: 6,   s: 'bottle' },
  { n: 'Моток проволоки',        t: 'cheap', v: 9,   s: 'wire' },
  { n: 'Тазик с дырой',          t: 'cheap', v: 5,   s: 'bucket' },
  { n: 'Часы без стрелок',       t: 'cheap', v: 12,  s: 'clockBroken' },
  { n: 'Чугунная кастрюля',      t: 'cheap', v: 14,  s: 'pot' },
  { n: 'Гирлянда без лампочек',  t: 'cheap', v: 6,   s: 'garland' },
  { n: 'Ржавый велосипед',       t: 'cheap', v: 22,  s: 'bicycle' },
  { n: 'Старое радио',           t: 'cheap', v: 18,  s: 'radio' },
  { n: 'Сломанный зонт',         t: 'cheap', v: 8,   s: 'umbrella' },
  { n: 'Детская игрушка',        t: 'cheap', v: 9,   s: 'toy' },
  { n: 'Газовая плита',          t: 'cheap', v: 24,  s: 'stove' },
  { n: 'Старый матрас',          t: 'cheap', v: 15,  s: 'mattress' },
  { n: 'Смятая подушка',         t: 'cheap', v: 6,   s: 'pillow' },
  { n: 'Чугунная ванна',         t: 'cheap', v: 20,  s: 'bath' },
  { n: 'Куча труб',              t: 'cheap', v: 13,  s: 'pipes' },
  { n: 'Старый диван',           t: 'cheap', v: 26,  s: 'sofa' },
  { n: 'Пустой стеллаж',         t: 'cheap', v: 16,  s: 'shelf' },
  { n: 'Битый чемодан',          t: 'cheap', v: 13,  s: 'suitcase' },
  { n: 'Тумбочка',               t: 'cheap', v: 19,  s: 'nightstand' },
  { n: 'Канистра',               t: 'cheap', v: 12,  s: 'jerrycan' },
  { n: 'Ключи на кольце',        t: 'cheap', v: 10,  s: 'keys' },
  { n: 'Папка с бумагами',       t: 'cheap', v: 5,   s: 'folder' },
  { n: 'Статуэтка без руки',     t: 'cheap', v: 17,  s: 'statuetteBroken' },
  { n: 'Рама без картины',       t: 'cheap', v: 8,   s: 'frameEmpty' },
  { n: 'Чугунная сковорода',     t: 'cheap', v: 13,  s: 'pan' },
  { n: 'Гиря',                   t: 'cheap', v: 21,  s: 'castiron' },
  { n: 'Стопка журналов',        t: 'cheap', v: 7,   s: 'magazines' },
  { n: 'Треснувшее зеркало',     t: 'cheap', v: 9,   s: 'mirror' },
  { n: 'Маслёнка',               t: 'cheap', v: 12,  s: 'oilcan' },
  { n: 'Электрообогреватель',    t: 'cheap', v: 23,  s: 'heater' },
  { n: 'Старый пылесос',         t: 'cheap', v: 25,  s: 'vacuum' },
  { n: 'Табурет',                t: 'cheap', v: 11,  s: 'stool' },
  { n: 'Стремянка',              t: 'cheap', v: 12,  s: 'ladder' },
  { n: 'Бидон',                  t: 'cheap', v: 15,  s: 'bidon' },
  { n: 'Детская коляска',        t: 'cheap', v: 28,  s: 'stroller' },
  { n: 'Лыжи',                   t: 'cheap', v: 18,  s: 'skis' },
  { n: 'Санки',                  t: 'cheap', v: 16,  s: 'sled' },
  { n: 'Плетёная корзина',       t: 'cheap', v: 9,   s: 'basket' },
  { n: 'Самовар',                t: 'cheap', v: 27,  s: 'samovar' },
  { n: 'Катушка ниток',          t: 'cheap', v: 5,   s: 'spool' },
  { n: 'Чайник со свистом',      t: 'cheap', v: 14,  s: 'kettle' },
  { n: 'Стиральная машина',      t: 'cheap', v: 26,  s: 'washer' },
  { n: 'Вентилятор',             t: 'cheap', v: 12,  s: 'fan' },
  { n: 'Швейная машинка',        t: 'cheap', v: 24,  s: 'sewingmachine' },
  { n: 'Бухта кабеля',           t: 'cheap', v: 10,  s: 'cable' },
  { n: 'Набор ключей',           t: 'cheap', v: 15,  s: 'wrenches' },
  { n: 'Мягкое кресло',          t: 'cheap', v: 30,  s: 'armchair' },
  { n: 'Шкаф',                   t: 'cheap', v: 29,  s: 'cabinet' },
  { n: 'Ржавая сетка',           t: 'cheap', v: 8,   s: 'mesh' },
  { n: 'Пустой аквариум',        t: 'cheap', v: 20,  s: 'aquarium' },

  // ── СРЕДНИЙ ЛУТ (30) ────────────────────────────────────────────────
  { n: 'Удочка',                 t: 'mid',   v: 42,  s: 'fishingrod' },
  { n: 'Гитара',                 t: 'mid',   v: 95,  s: 'guitar' },
  { n: 'Бинокль',                t: 'mid',   v: 68,  s: 'binoculars' },
  { n: 'Фотоаппарат',            t: 'mid',   v: 72,  s: 'camera' },
  { n: 'Телескоп',               t: 'mid',   v: 120, s: 'telescope' },
  { n: 'Коллекционная фигурка',  t: 'mid',   v: 88,  s: 'figure' },
  { n: 'Серебряный сервиз',      t: 'mid',   v: 110, s: 'silverware' },
  { n: 'Старинная монета',       t: 'mid',   v: 45,  s: 'coin' },
  { n: 'Ламповый радиоприёмник', t: 'mid',   v: 38,  s: 'radioreceiver' },
  { n: 'Печатная машинка',       t: 'mid',   v: 78,  s: 'typewriter' },
  { n: 'Микроскоп',              t: 'mid',   v: 130, s: 'microscope' },
  { n: 'Аккордеон',              t: 'mid',   v: 92,  s: 'accordion' },
  { n: 'Скрипка',                t: 'mid',   v: 125, s: 'violin' },
  { n: 'Антикварные часы',       t: 'mid',   v: 105, s: 'antiqueclock' },
  { n: 'Каменная статуэтка',     t: 'mid',   v: 48,  s: 'stonefigure' },
  { n: 'Массовая двустволка',    t: 'mid',   v: 60,  s: 'shotgun' },
  { n: 'Счётная машина',         t: 'mid',   v: 55,  s: 'addingmachine' },
  { n: 'Меховая шуба',           t: 'mid',   v: 138, s: 'furcoat' },
  { n: 'Кожаные сапоги',         t: 'mid',   v: 52,  s: 'leathboots' },
  { n: 'Мотоцикл',               t: 'mid',   v: 128, s: 'motorcycle' },
  { n: 'Кинокамера',             t: 'mid',   v: 84,  s: 'filmcamera' },
  { n: 'Кинопроектор',           t: 'mid',   v: 66,  s: 'projector' },
  { n: 'Слесарный набор',        t: 'mid',   v: 40,  s: 'toolbox' },
  { n: 'Альбом с монетами',      t: 'mid',   v: 90,  s: 'coinalbum' },
  { n: 'Фарфоровый сервиз',      t: 'mid',   v: 118, s: 'porcelain' },
  { n: 'Латунные подсвечники',   t: 'mid',   v: 46,  s: 'candlesticks' },
  { n: 'Гравюра в раме',         t: 'mid',   v: 58,  s: 'engraving' },
  { n: 'Старинный глобус',       t: 'mid',   v: 74,  s: 'globe' },
  { n: 'Сундук с замком',        t: 'mid',   v: 100, s: 'chest' },
  { n: 'Шахматные фигуры',       t: 'mid',   v: 62,  s: 'chess' },

  // ── ДОРОГОЙ ЛУТ (10) ────────────────────────────────────────────────
  { n: 'Золотой слиток',         t: 'rich',  v: 700, s: 'goldbar' },
  { n: 'Нефритовый лев',         t: 'rich',  v: 520, s: 'jade' },
  { n: 'Метеорит',               t: 'rich',  v: 320, s: 'meteorite' },
  { n: 'Аммонит',                t: 'rich',  v: 260, s: 'ammonite' },
  { n: 'Матрёшка с золотом',     t: 'rich',  v: 430, s: 'matryoshka' },
  { n: 'Старинная картина',      t: 'rich',  v: 480, s: 'painting' },
  { n: 'Кинжал в серебряных ножнах', t: 'rich', v: 350, s: 'dagger' },
  { n: 'Золотые карманные часы', t: 'rich',  v: 560, s: 'goldwatch' },
  { n: 'Окаменелость динозавра', t: 'rich',  v: 620, s: 'dino' },
  { n: 'Императорская шкатулка', t: 'rich',  v: 390, s: 'imperialbox' },
];

// Раздаём id и сид. id стабильный — по нему игра ссылается на картинку.
CATALOG.forEach((item, i) => {
  item.id = `lot-${String(i + 1).padStart(3, '0')}`;
  item.seed = `lotsgame/${item.id}/${item.n}`;
});

export const TIER_LABEL = {
  cheap: 'Дешёвый лот',
  mid: 'Средний лот',
  rich: 'Дорогой лот',
};

export function byTier(tier) {
  return CATALOG.filter((i) => i.t === tier);
}
