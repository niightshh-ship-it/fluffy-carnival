export interface Quest {
  tag: string;
  text: string;
  time: string;
  diff: string;
  coin: number;
  hype: number;
}

export interface FeedPost {
  name: string;
  time: string;
  caption: string;
  hype: number;
  cmt: number;
  hot: boolean;
}

export interface PetStage {
  id: number;
  name: string;
  mood: string;
  badge: string;
}

export const QUESTS: Quest[] = [
  {
    tag: 'СОЦИАЛКА',
    text: 'Подойди к незнакомцу и сделай искренний комплимент. Сними его реакцию.',
    time: '15 мин',
    diff: 'Норм',
    coin: 60,
    hype: 140,
  },
  {
    tag: 'КРИНЖ',
    text: 'Изобрази пингвина в очереди и держись 10 секунд. Без объяснений.',
    time: '5 мин',
    diff: 'Изи',
    coin: 40,
    hype: 90,
  },
  {
    tag: 'ТВОРЧЕСТВО',
    text: 'Сними 7-секундный клип, где предмет в комнате внезапно «оживает».',
    time: '20 мин',
    diff: 'Хард',
    coin: 90,
    hype: 220,
  },
  {
    tag: 'УЛИЦА',
    text: 'Найди самую странную вывеску в районе и придумай ей новый слоган.',
    time: '30 мин',
    diff: 'Норм',
    coin: 70,
    hype: 160,
  },
  {
    tag: 'ДВИЖ',
    text: 'Устрой 15-секундный танец там, где танцевать вообще не принято.',
    time: '10 мин',
    diff: 'Хард',
    coin: 80,
    hype: 200,
  },
];

export const FEED_POSTS: FeedPost[] = [
  {
    name: 'кирилл_не_спит',
    time: '2 мин · КРИНЖ',
    caption: 'пингвин-челлендж в пятёрочке, охрана в шоке',
    hype: 1284,
    cmt: 56,
    hot: true,
  },
  {
    name: 'masha.exe',
    time: '11 мин · ТВОРЧЕСТВО',
    caption: 'мой чайник официально живой теперь',
    hype: 842,
    cmt: 31,
    hot: false,
  },
  {
    name: 'дэн',
    time: '24 мин · УЛИЦА',
    caption: '«шиномонтаж» теперь «центр духовного баланса колёс»',
    hype: 503,
    cmt: 19,
    hot: false,
  },
  {
    name: 'soph_va',
    time: '41 мин · СОЦИАЛКА',
    caption: 'сделала комплимент бариста — он покраснел',
    hype: 376,
    cmt: 12,
    hot: false,
  },
];

export const PET_STAGES: PetStage[] = [
  {
    id: 0,
    name: 'Капелюшка',
    mood: 'только вылупился и уже голодный',
    badge: 'Стадия 1 · Капля',
  },
  {
    id: 1,
    name: 'Хайпожорик',
    mood: 'жуёт хайп и довольно булькает',
    badge: 'Стадия 2 · Клякса',
  },
  {
    id: 2,
    name: 'Хаосожор',
    mood: 'сытый, дерзкий, требует ещё движа',
    badge: 'Стадия 3 · Хаос',
  },
];
