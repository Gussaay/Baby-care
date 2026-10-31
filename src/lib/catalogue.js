// Built-in catalogue: skill domains, skills and toy types with suggested skills.
// Every name has an English (en) and Arabic (ar) version.
export const domains = [
  { id: 'fine',     icon: '✋', color: '#e07a5f', name: { en: 'Fine motor',       ar: 'المهارات الحركية الدقيقة' } },
  { id: 'gross',    icon: '🏃', color: '#3d8b7d', name: { en: 'Gross motor',      ar: 'المهارات الحركية الكبرى' } },
  { id: 'language', icon: '💬', color: '#5b7fd1', name: { en: 'Language',         ar: 'اللغة' } },
  { id: 'thinking', icon: '🧩', color: '#9b6bc9', name: { en: 'Thinking',         ar: 'التفكير' } },
  { id: 'social',   icon: '🤝', color: '#d4a017', name: { en: 'Social-emotional', ar: 'المهارات الاجتماعية والعاطفية' } },
  { id: 'senses',   icon: '🌈', color: '#d9667b', name: { en: 'Senses',           ar: 'الحواس' } },
  { id: 'create',   icon: '🎨', color: '#4fa3c7', name: { en: 'Creativity',       ar: 'الإبداع' } },
  { id: 'numbers',  icon: '🔢', color: '#7a9a3a', name: { en: 'Numbers & shapes', ar: 'الأرقام والأشكال' } },
];

export const skills = [
  { id: 'grasp',        domain: 'fine',     name: { en: 'Grasping & pinching',        ar: 'الإمساك والالتقاط' } },
  { id: 'handeye',      domain: 'fine',     name: { en: 'Hand-eye coordination',      ar: 'التآزر بين اليد والعين' } },
  { id: 'pencil',       domain: 'fine',     name: { en: 'Pencil grip & drawing',      ar: 'مسك القلم والرسم' } },
  { id: 'balance',      domain: 'gross',    name: { en: 'Balance',                    ar: 'التوازن' } },
  { id: 'throwcatch',   domain: 'gross',    name: { en: 'Throwing & catching',        ar: 'الرمي والالتقاط' } },
  { id: 'crawlwalk',    domain: 'gross',    name: { en: 'Crawling, walking, running', ar: 'الحبو والمشي والجري' } },
  { id: 'vocab',        domain: 'language', name: { en: 'New words',                  ar: 'كلمات جديدة' } },
  { id: 'listening',    domain: 'language', name: { en: 'Listening',                  ar: 'الاستماع' } },
  { id: 'storytelling', domain: 'language', name: { en: 'Storytelling',               ar: 'رواية القصص' } },
  { id: 'problem',      domain: 'thinking', name: { en: 'Problem solving',            ar: 'حل المشكلات' } },
  { id: 'causeeffect',  domain: 'thinking', name: { en: 'Cause & effect',             ar: 'السبب والنتيجة' } },
  { id: 'memory',       domain: 'thinking', name: { en: 'Memory & focus',             ar: 'الذاكرة والتركيز' } },
  { id: 'sharing',      domain: 'social',   name: { en: 'Sharing & turn-taking',      ar: 'المشاركة وتبادل الأدوار' } },
  { id: 'emotions',     domain: 'social',   name: { en: 'Naming feelings',            ar: 'التعبير عن المشاعر' } },
  { id: 'pretend',      domain: 'social',   name: { en: 'Pretend & role play',        ar: 'اللعب التخيلي وتقمص الأدوار' } },
  { id: 'touch',        domain: 'senses',   name: { en: 'Touch & texture',            ar: 'اللمس والملمس' } },
  { id: 'sound',        domain: 'senses',   name: { en: 'Sound & rhythm',             ar: 'الأصوات والإيقاع' } },
  { id: 'colours',      domain: 'senses',   name: { en: 'Colours',                    ar: 'الألوان' } },
  { id: 'imagination',  domain: 'create',   name: { en: 'Imagination',                ar: 'الخيال' } },
  { id: 'building',     domain: 'create',   name: { en: 'Building & designing',       ar: 'البناء والتصميم' } },
  { id: 'art',          domain: 'create',   name: { en: 'Art & making',               ar: 'الفن والصناعة اليدوية' } },
  { id: 'counting',     domain: 'numbers',  name: { en: 'Counting',                   ar: 'العدّ' } },
  { id: 'shapes',       domain: 'numbers',  name: { en: 'Shapes',                     ar: 'الأشكال' } },
  { id: 'sorting',      domain: 'numbers',  name: { en: 'Sorting & matching',         ar: 'التصنيف والمطابقة' } },
];

export const toyTypes = [
  { id: 'blocks',   emoji: '🧱', age: [12, 72],  skills: ['building', 'handeye', 'problem', 'counting', 'shapes'], name: { en: 'Blocks', ar: 'مكعبات' } },
  { id: 'puzzle',   emoji: '🧩', age: [18, 96],  skills: ['problem', 'shapes', 'grasp', 'memory'], name: { en: 'Puzzle', ar: 'بازل (أحجية)' } },
  { id: 'ball',     emoji: '⚽', age: [6, 120],  skills: ['throwcatch', 'crawlwalk', 'sharing', 'handeye'], name: { en: 'Ball', ar: 'كرة' } },
  { id: 'book',     emoji: '📚', age: [0, 96],   skills: ['vocab', 'listening', 'storytelling', 'emotions'], name: { en: 'Picture book', ar: 'كتاب مصوّر' } },
  { id: 'sorter',   emoji: '🔷', age: [9, 36],   skills: ['shapes', 'sorting', 'grasp', 'problem'], name: { en: 'Shape sorter', ar: 'صندوق الأشكال' } },
  { id: 'stacking', emoji: '🥤', age: [6, 36],   skills: ['handeye', 'sorting', 'counting', 'causeeffect'], name: { en: 'Stacking cups', ar: 'أكواب التكديس' } },
  { id: 'crayons',  emoji: '🖍️', age: [18, 120], skills: ['pencil', 'art', 'colours', 'imagination'], name: { en: 'Crayons & paper', ar: 'ألوان شمعية وورق' } },
  { id: 'dough',    emoji: '🟣', age: [24, 96],  skills: ['touch', 'grasp', 'art', 'imagination'], name: { en: 'Play dough', ar: 'صلصال' } },
  { id: 'doll',     emoji: '🧸', age: [0, 96],   skills: ['pretend', 'emotions', 'vocab', 'touch'], name: { en: 'Doll / soft toy', ar: 'دمية / لعبة محشوة' } },
  { id: 'car',      emoji: '🚗', age: [12, 96],  skills: ['pretend', 'causeeffect', 'crawlwalk', 'imagination'], name: { en: 'Car / vehicle', ar: 'سيارة / مركبة' } },
  { id: 'music',    emoji: '🥁', age: [6, 96],   skills: ['sound', 'causeeffect', 'listening'], name: { en: 'Musical toy', ar: 'لعبة موسيقية' } },
  { id: 'kitchen',  emoji: '🍳', age: [24, 96],  skills: ['pretend', 'sharing', 'vocab', 'sorting'], name: { en: 'Play kitchen', ar: 'مطبخ ألعاب' } },
  { id: 'beads',    emoji: '📿', age: [30, 96],  skills: ['grasp', 'handeye', 'counting', 'colours'], name: { en: 'Threading beads', ar: 'خرز للضمّ' } },
  { id: 'rattle',   emoji: '🪇', age: [0, 12],   skills: ['sound', 'grasp', 'touch', 'causeeffect'], name: { en: 'Rattle / sensory', ar: 'خشخيشة / لعبة حسية' } },
  { id: 'bike',     emoji: '🚲', age: [18, 120], skills: ['balance', 'crawlwalk'], name: { en: 'Ride-on / bike', ar: 'دراجة / لعبة ركوب' } },
  { id: 'game',     emoji: '🎲', age: [36, 144], skills: ['sharing', 'counting', 'memory', 'emotions'], name: { en: 'Board / card game', ar: 'لعبة لوحية / ورق' } },
  { id: 'other',    emoji: '🎁', age: [0, 144],  skills: [], name: { en: 'Other', ar: 'أخرى' } },
];

export const domainById = Object.fromEntries(domains.map((d) => [d.id, d]));
export const skillById = Object.fromEntries(skills.map((s) => [s.id, s]));
export const typeById = Object.fromEntries(toyTypes.map((t) => [t.id, t]));
