// Mock data for the prototype

const MOCK_STATS = {
  totalWorkouts: 47,
  totalSets: 412,
  thisWeek: 4,
  streak: 12,
};

const MOCK_TEMPLATES = [
  { id: 1, name: 'Push',  emoji: 'P', count: 6, last: 'Il y a 2 jours', muscles: ['Pecs', 'Triceps', 'Épaules'], tone: 'push' },
  { id: 2, name: 'Pull',  emoji: 'L', count: 5, last: 'Il y a 4 jours', muscles: ['Dos', 'Biceps'], tone: 'pull' },
  { id: 3, name: 'Legs',  emoji: 'J', count: 7, last: 'Il y a 6 jours', muscles: ['Quadri', 'Ischio', 'Fessiers'], tone: 'legs' },
];

const MOCK_LAST_SESSION = {
  name: 'Push',
  date: 'Hier · 18:42',
  duration: 58,
  exercises: 6,
  sets: 22,
  prs: 2,
  volume: 8420,
};

const MOCK_ACTIVE_WORKOUT = {
  name: 'Push',
  elapsed: 1452, // 24:12
  exercises: [
    {
      id: 'e1', name: 'Développé couché', muscles: 'Pectoraux',
      lastBest: { weight: 80, reps: 6, oneRM: 92.8 },
      sets: [
        { weight: 60, reps: 12, completed: true,  oneRM: 84.2 },
        { weight: 80, reps: 8,  completed: true,  oneRM: 99.0, isPR: true },
        { weight: 80, reps: 6,  completed: true,  oneRM: 92.8 },
        { weight: 80, reps: '', completed: false },
      ],
    },
    {
      id: 'e2', name: 'Développé incliné haltères', muscles: 'Pectoraux haut',
      lastBest: { weight: 30, reps: 10, oneRM: 40 },
      sets: [
        { weight: 30, reps: 10, completed: false },
        { weight: 32, reps: 8,  completed: false },
        { weight: 32, reps: 8,  completed: false },
      ],
    },
    {
      id: 'e3', name: 'Élévations latérales', muscles: 'Deltoïde latéral',
      lastBest: { weight: 12, reps: 12, oneRM: 16 },
      sets: [
        { weight: 12, reps: 12, completed: false },
        { weight: 12, reps: 12, completed: false },
        { weight: 14, reps: 10, completed: false },
      ],
    },
  ],
};

const MOCK_EXERCISE_LIBRARY = [
  { id: 1, name: 'Développé couché barre', group: 'Chest', muscles: 'Pectoraux', equip: 'Barre', primary: ['Pectoraux'], secondary: ['Triceps','Deltoïde ant.'], pinned: true },
  { id: 2, name: 'Développé incliné haltères', group: 'Chest', muscles: 'Pectoraux haut', equip: 'Haltères', primary: ['Pectoraux haut'], secondary: ['Triceps'], pinned: true },
  { id: 3, name: 'Écarté poulie haute', group: 'Chest', muscles: 'Pectoraux', equip: 'Poulie' },
  { id: 4, name: 'Pompes lestées', group: 'Chest', muscles: 'Pectoraux', equip: 'Poids du corps' },
  { id: 5, name: 'Tractions pronation', group: 'Back', muscles: 'Grand dorsal', equip: 'Barre fixe', primary: ['Grand dorsal'], secondary: ['Biceps'] },
  { id: 6, name: 'Rowing barre', group: 'Back', muscles: 'Dos', equip: 'Barre' },
  { id: 7, name: 'Tirage horizontal', group: 'Back', muscles: 'Dos', equip: 'Poulie' },
  { id: 8, name: 'Squat barre', group: 'Legs', muscles: 'Quadriceps', equip: 'Barre' },
  { id: 9, name: 'Soulevé de terre', group: 'Legs', muscles: 'Chaîne post.', equip: 'Barre' },
  { id: 10, name: 'Curl barre', group: 'Arms', muscles: 'Biceps', equip: 'Barre' },
];

const MOCK_HISTORY = [
  { id: 'h1', name: 'Push',  date: 'Hier',           when: '18:42', dur: 58, sets: 22, vol: 8420, prs: 2, type: 'push' },
  { id: 'h2', name: 'Legs',  date: 'Mar. 23 avr.',   when: '07:15', dur: 71, sets: 18, vol: 12300, prs: 1, type: 'legs' },
  { id: 'h3', name: 'Pull',  date: 'Lun. 22 avr.',   when: '19:05', dur: 62, sets: 19, vol: 7890, prs: 0, type: 'pull' },
  { id: 'h4', name: 'Push',  date: 'Sam. 20 avr.',   when: '11:30', dur: 55, sets: 21, vol: 8120, prs: 1, type: 'push' },
  { id: 'h5', name: 'Legs',  date: 'Jeu. 18 avr.',   when: '07:42', dur: 68, sets: 17, vol: 11600, prs: 0, type: 'legs' },
];

const MOCK_PROGRESS = {
  exercises: [
    { name: 'Développé couché', best: 99, latest: 99, delta: '+12%', points: [78,80,82,80,84,86,88,86,90,92,95,99] },
    { name: 'Squat',            best: 140, latest: 138, delta: '+8%',  points: [120,122,125,123,128,130,132,135,135,138,138,138] },
    { name: 'Soulevé de terre', best: 165, latest: 165, delta: '+5%',  points: [150,152,154,156,158,160,160,162,162,164,164,165] },
    { name: 'Tractions',        best: 38, latest: 38, delta: '+15%', points: [22,24,25,28,28,30,32,33,34,35,36,38] },
    { name: 'Curl barre',       best: 42, latest: 42, delta: '+10%', points: [32,33,35,35,37,38,38,40,40,41,42,42] },
  ],
  weekVolume: [3200, 4800, 5400, 6100, 5900, 7200, 8420],
  weekDays:   ['L','M','M','J','V','S','D'],
};

const MOCK_NUTRITION = {
  target: 3400,
  current: 2240,
  burned: 540,
  protein: { current: 142, target: 200 },
  carbs:   { current: 280, target: 415 },
  fats:    { current: 64,  target: 104 },
  fiber:   { current: 22,  target: 35 },
  water:   { current: 1.8, target: 3.0 }, // litres
  meals: [
    { id: 'm1', name: 'Petit-déj.', kcal: 750, time: '07:30', done: true,
      macros: { p: 48, c: 92, f: 18 },
      items: [
        { name: 'Avoine', qty: '100g', kcal: 380, p: 13, c: 60, f: 7 },
        { name: 'Whey vanille', qty: '30g', kcal: 120, p: 25, c: 3, f: 1 },
        { name: 'Banane', qty: '120g', kcal: 105, p: 1, c: 27, f: 0 },
        { name: 'Beurre de cacahuète', qty: '15g', kcal: 95, p: 4, c: 3, f: 8 },
        { name: 'Lait demi-écrémé', qty: '200ml', kcal: 50, p: 5, c: 9, f: 2 },
      ],
    },
    { id: 'm2', name: 'Collation',  kcal: 290, time: '10:30', done: true,
      macros: { p: 22, c: 18, f: 14 },
      items: [
        { name: 'Skyr nature', qty: '170g', kcal: 110, p: 17, c: 7, f: 0 },
        { name: 'Amandes', qty: '25g', kcal: 145, p: 5, c: 5, f: 13 },
        { name: 'Miel', qty: '10g', kcal: 35, p: 0, c: 9, f: 0 },
      ],
    },
    { id: 'm3', name: 'Déjeuner',   kcal: 850, time: '13:15', done: true,
      macros: { p: 65, c: 95, f: 22 },
      items: [
        { name: 'Poulet (filet)', qty: '220g', kcal: 360, p: 60, c: 0, f: 12 },
        { name: 'Riz basmati cuit', qty: '250g', kcal: 320, p: 6, c: 70, f: 1 },
        { name: 'Brocolis', qty: '200g', kcal: 70, p: 5, c: 14, f: 1 },
        { name: 'Huile d\'olive', qty: '10g', kcal: 90, p: 0, c: 0, f: 10 },
      ],
    },
    { id: 'm4', name: 'Pré-séance', kcal: 350, time: '17:00', done: false,
      macros: { p: 22, c: 45, f: 8 },
      items: [
        { name: 'Pain complet', qty: '80g', kcal: 200, p: 7, c: 38, f: 2 },
        { name: 'Œufs entiers', qty: '2 unités', kcal: 145, p: 13, c: 1, f: 10 },
        { name: 'Pomme', qty: '150g', kcal: 80, p: 0, c: 21, f: 0 },
      ],
    },
    { id: 'm5', name: 'Post-séance',kcal: 250, time: '19:30', done: false,
      macros: { p: 28, c: 28, f: 2 },
      items: [
        { name: 'Whey vanille', qty: '30g', kcal: 120, p: 25, c: 3, f: 1 },
        { name: 'Banane', qty: '120g', kcal: 105, p: 1, c: 27, f: 0 },
        { name: 'Eau', qty: '400ml', kcal: 0, p: 0, c: 0, f: 0 },
      ],
    },
    { id: 'm6', name: 'Dîner',      kcal: 950, time: '20:30', done: false,
      macros: { p: 55, c: 75, f: 35 },
      items: [
        { name: 'Saumon', qty: '200g', kcal: 415, p: 42, c: 0, f: 27 },
        { name: 'Patate douce', qty: '300g', kcal: 260, p: 5, c: 60, f: 0 },
        { name: 'Épinards', qty: '150g', kcal: 35, p: 4, c: 5, f: 0 },
        { name: 'Avocat', qty: '60g', kcal: 100, p: 1, c: 5, f: 9 },
        { name: 'Huile d\'olive', qty: '10g', kcal: 90, p: 0, c: 0, f: 10 },
      ],
    },
  ],
  context: { day: 'Lundi', activity: 'Jour de jambes' },
  weekKcal: [2890, 3280, 3120, 3410, 2950, 3520, 2240], // last 7 days
  weekDays: ['L','M','M','J','V','S','D'],
  insights: [
    { kind: 'good',   icon: 'check', title: 'Protéines régulières', text: '7 jours d\'affilée au-dessus de 1.8g/kg.' },
    { kind: 'warn',   icon: 'flame', title: 'Glucides bas avant séance', text: 'Tu manques 80g pour ton objectif pré-workout.' },
    { kind: 'info',   icon: 'drop',  title: 'Hydratation', text: 'Plus que 1.2L à boire — vise 3L les jours de squat.' },
  ],
  foodSearch: [
    { name: 'Poulet (filet, cuit)', cat: 'Viande', kcal: 165, p: 31, c: 0, f: 4 },
    { name: 'Riz basmati cuit', cat: 'Féculent', kcal: 130, p: 3, c: 28, f: 0 },
    { name: 'Avoine', cat: 'Céréale', kcal: 380, p: 13, c: 67, f: 7 },
    { name: 'Whey vanille', cat: 'Supplément', kcal: 400, p: 80, c: 8, f: 5 },
    { name: 'Banane', cat: 'Fruit', kcal: 89, p: 1, c: 23, f: 0 },
    { name: 'Œufs entiers', cat: 'Protéine', kcal: 155, p: 13, c: 1, f: 11 },
    { name: 'Saumon', cat: 'Poisson', kcal: 208, p: 20, c: 0, f: 13 },
    { name: 'Patate douce', cat: 'Féculent', kcal: 86, p: 2, c: 20, f: 0 },
  ],
};

window.MOCK = {
  STATS: MOCK_STATS,
  TEMPLATES: MOCK_TEMPLATES,
  LAST_SESSION: MOCK_LAST_SESSION,
  ACTIVE_WORKOUT: MOCK_ACTIVE_WORKOUT,
  EXERCISE_LIBRARY: MOCK_EXERCISE_LIBRARY,
  HISTORY: MOCK_HISTORY,
  PROGRESS: MOCK_PROGRESS,
  NUTRITION: MOCK_NUTRITION,
};
