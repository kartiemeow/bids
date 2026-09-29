// Каталог из 100 предметов-превью.
// 60 дешёвых / 30 средних / 10 дорогих. Ни одна картинка не повторяется.
//
// t — тир (cheap | mid | rich). Только он решает, как рисуется картинка.
// Настоящую ценность лота тир картинки НЕ определяет: дорогой лот специально
// может быть показан под дешёвой картинкой (см. game.js — маскировка).
//
// s — ключ функции отрисовки в tools/art/shapes-*.js

export const CATALOG = [
  // ── ДЕШЁВЫЙ ЛУТ (60) ────────────────────────────────────────────────
  { n: 'Ваза с трещиной',        t: 'cheap', s: 'vase' },
  { n: 'Стул с отбитой спинкой', t: 'cheap', s: 'chair' },
  { n: 'Стопка покрышек',        t: 'cheap', s: 'tires' },
  { n: 'Картонные коробки',      t: 'cheap', s: 'boxes' },
  { n: 'Мешки с мусором',        t: 'cheap', s: 'trashbags' },
  { n: 'Пустая жестянка',        t: 'cheap', s: 'can' },
  { n: 'Погнутая миска',         t: 'cheap', s: 'bowl' },
  { n: 'Сломанная лампа',        t: 'cheap', s: 'lampBroken' },
  { n: 'Старые ботинки',         t: 'cheap', s: 'boots' },
  { n: 'Стопка книг',            t: 'cheap', s: 'books' },
  { n: 'Пустые бутылки',         t: 'cheap', s: 'bottle' },
  { n: 'Моток проволоки',        t: 'cheap', s: 'wire' },
  { n: 'Тазик с дырой',          t: 'cheap', s: 'bucket' },
  { n: 'Часы без стрелок',       t: 'cheap', s: 'clockBroken' },
  { n: 'Чугунная кастрюля',      t: 'cheap', s: 'pot' },
  { n: 'Гирлянда без лампочек',  t: 'cheap', s: 'garland' },
  { n: 'Ржавый велосипед',       t: 'cheap', s: 'bicycle' },
  { n: 'Старое радио',           t: 'cheap', s: 'radio' },
  { n: 'Сломанный зонт',         t: 'cheap', s: 'umbrella' },
  { n: 'Детская игрушка',        t: 'cheap', s: 'toy' },
  { n: 'Газовая плита',          t: 'cheap', s: 'stove' },
  { n: 'Старый матрас',          t: 'cheap', s: 'mattress' },
  { n: 'Смятая подушка',         t: 'cheap', s: 'pillow' },
  { n: 'Чугунная ванна',         t: 'cheap', s: 'bath' },
  { n: 'Куча труб',              t: 'cheap', s: 'pipes' },
  { n: 'Старый диван',           t: 'cheap', s: 'sofa' },
  { n: 'Пустой стеллаж',         t: 'cheap', s: 'shelf' },
  { n: 'Битый чемодан',          t: 'cheap', s: 'suitcase' },
  { n: 'Тумбочка',               t: 'cheap', s: 'nightstand' },
  { n: 'Канистра',               t: 'cheap', s: 'jerrycan' },
  { n: 'Ключи на кольце',        t: 'cheap', s: 'keys' },
  { n: 'Папка с бумагами',       t: 'cheap', s: 'folder' },
  { n: 'Статуэтка без руки',     t: 'cheap', s: 'statuetteBroken' },
  { n: 'Рама без картины',       t: 'cheap', s: 'frameEmpty' },
  { n: 'Чугунная сковорода',     t: 'cheap', s: 'pan' },
  { n: 'Гиря',                   t: 'cheap', s: 'castiron' },
  { n: 'Стопка журналов',        t: 'cheap', s: 'magazines' },
  { n: 'Треснувшее зеркало',     t: 'cheap', s: 'mirror' },
  { n: 'Маслёнка',               t: 'cheap', s: 'oilcan' },
  { n: 'Электрообогреватель',    t: 'cheap', s: 'heater' },
  { n: 'Старый пылесос',         t: 'cheap', s: 'vacuum' },
  { n: 'Табурет',                t: 'cheap', s: 'stool' },
  { n: 'Стремянка',              t: 'cheap', s: 'ladder' },
  { n: 'Бидон',                  t: 'cheap', s: 'bidon' },
  { n: 'Детская коляска',        t: 'cheap', s: 'stroller' },
  { n: 'Лыжи',                   t: 'cheap', s: 'skis' },
  { n: 'Санки',                  t: 'cheap', s: 'sled' },
  { n: 'Плетёная корзина',       t: 'cheap', s: 'basket' },
  { n: 'Самовар',                t: 'cheap', s: 'samovar' },
  { n: 'Катушка ниток',          t: 'cheap', s: 'spool' },
  { n: 'Чайник со свистом',      t: 'cheap', s: 'kettle' },
  { n: 'Стиральная машина',      t: 'cheap', s: 'washer' },
  { n: 'Вентилятор',             t: 'cheap', s: 'fan' },
  { n: 'Швейная машинка',        t: 'cheap', s: 'sewingmachine' },
  { n: 'Бухта кабеля',           t: 'cheap', s: 'cable' },
  { n: 'Набор ключей',           t: 'cheap', s: 'wrenches' },
  { n: 'Мягкое кресло',          t: 'cheap', s: 'armchair' },
  { n: 'Шкаф',                   t: 'cheap', s: 'cabinet' },
  { n: 'Ржавая сетка',           t: 'cheap', s: 'mesh' },
  { n: 'Пустой аквариум',        t: 'cheap', s: 'aquarium' },

  // ── СРЕДНИЙ ЛУТ (30) ────────────────────────────────────────────────
  { n: 'Удочка',                 t: 'mid',   s: 'fishingrod' },
  { n: 'Гитара',                 t: 'mid',   s: 'guitar' },
  { n: 'Бинокль',                t: 'mid',   s: 'binoculars' },
  { n: 'Фотоаппарат',            t: 'mid',   s: 'camera' },
  { n: 'Телескоп',               t: 'mid',   s: 'telescope' },
  { n: 'Коллекционная фигурка',  t: 'mid',   s: 'figure' },
  { n: 'Серебряный сервиз',      t: 'mid',   s: 'silverware' },
  { n: 'Старинная монета',       t: 'mid',   s: 'coin' },
  { n: 'Ламповый радиоприёмник', t: 'mid',   s: 'radioreceiver' },
  { n: 'Печатная машинка',       t: 'mid',   s: 'typewriter' },
  { n: 'Микроскоп',              t: 'mid',   s: 'microscope' },
  { n: 'Аккордеон',              t: 'mid',   s: 'accordion' },
  { n: 'Скрипка',                t: 'mid',   s: 'violin' },
  { n: 'Антикварные часы',       t: 'mid',   s: 'antiqueclock' },
  { n: 'Каменная статуэтка',     t: 'mid',   s: 'stonefigure' },
  { n: 'Массовая двустволка',    t: 'mid',   s: 'shotgun' },
  { n: 'Счётная машина',         t: 'mid',   s: 'addingmachine' },
  { n: 'Меховая шуба',           t: 'mid',   s: 'furcoat' },
  { n: 'Кожаные сапоги',         t: 'mid',   s: 'leathboots' },
  { n: 'Мотоцикл',               t: 'mid',   s: 'motorcycle' },
  { n: 'Кинокамера',             t: 'mid',   s: 'filmcamera' },
  { n: 'Кинопроектор',           t: 'mid',   s: 'projector' },
  { n: 'Слесарный набор',        t: 'mid',   s: 'toolbox' },
  { n: 'Альбом с монетами',      t: 'mid',   s: 'coinalbum' },
  { n: 'Фарфоровый сервиз',      t: 'mid',   s: 'porcelain' },
  { n: 'Латунные подсвечники',   t: 'mid',   s: 'candlesticks' },
  { n: 'Гравюра в раме',         t: 'mid',   s: 'engraving' },
  { n: 'Старинный глобус',       t: 'mid',   s: 'globe' },
  { n: 'Сундук с замком',        t: 'mid',   s: 'chest' },
  { n: 'Шахматные фигуры',       t: 'mid',   s: 'chess' },

  // ── ДОРОГОЙ ЛУТ (10) ────────────────────────────────────────────────
  { n: 'Золотой слиток',         t: 'rich',  s: 'goldbar' },
  { n: 'Нефритовый лев',         t: 'rich',  s: 'jade' },
  { n: 'Метеорит',               t: 'rich',  s: 'meteorite' },
  { n: 'Аммонит',                t: 'rich',  s: 'ammonite' },
  { n: 'Матрёшка с золотом',     t: 'rich',  s: 'matryoshka' },
  { n: 'Старинная картина',      t: 'rich',  s: 'painting' },
  { n: 'Кинжал в серебряных ножнах', t: 'rich', s: 'dagger' },
  { n: 'Золотые карманные часы', t: 'rich',  s: 'goldwatch' },
  { n: 'Окаменелость динозавра', t: 'rich',  s: 'dino' },
  { n: 'Императорская шкатулка', t: 'rich',  s: 'imperialbox' },
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
