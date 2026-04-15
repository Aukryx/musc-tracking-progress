import Dexie, { type Table } from 'dexie';

export type MuscleKey =
  | 'pectoraux' | 'deltoide_ant' | 'deltoide_lat' | 'deltoide_post'
  | 'biceps' | 'triceps' | 'avant_bras'
  | 'grand_dorsal' | 'trapeze' | 'lombaires' | 'rhomboides'
  | 'quadriceps' | 'ischio' | 'fessiers' | 'mollets'
  | 'abdominaux';

export interface Exercise {
  id?: number;
  name: string;
  category: string;
  muscleGroup: string;
  primaryMuscles: MuscleKey[];
  secondaryMuscles: MuscleKey[];
  description: string;
  tips: string[];
}

export interface WorkoutSet {
  id?: number;
  workoutId: number;
  exerciseName: string;
  exerciseOrder: number;
  setIndex: number;
  weight: number;
  reps: number;
  oneRepMax: number;
  completedAt: Date;
}

export interface Workout {
  id?: number;
  name: string;
  startedAt: Date;
  finishedAt?: Date;
  templateId?: number;
  notes?: string;
}

export interface TemplateExercise {
  name: string;
  order: number;
  defaultSets: number;
  defaultWeight?: number;
  defaultReps?: number;
}

export interface Template {
  id?: number;
  name: string;
  exercises: TemplateExercise[];
  createdAt: Date;
  lastUsedAt?: Date;
}

class MuscloDB extends Dexie {
  exercises!: Table<Exercise>;
  workouts!: Table<Workout>;
  workoutSets!: Table<WorkoutSet>;
  templates!: Table<Template>;

  constructor() {
    super('MuscloDB');

    this.version(1).stores({
      exercises: '++id, name, category, muscleGroup',
      workouts: '++id, startedAt, finishedAt, templateId',
      workoutSets: '++id, workoutId, exerciseName, exerciseOrder, completedAt',
      templates: '++id, name, createdAt, lastUsedAt',
    });

    // Migration v2 : ajout des champs description/muscles
    this.version(2).stores({
      exercises: '++id, name, category, muscleGroup',
    }).upgrade(async (trans) => {
      await trans.table('exercises').toCollection().modify((ex) => {
        if (!ex.primaryMuscles) ex.primaryMuscles = [];
        if (!ex.secondaryMuscles) ex.secondaryMuscles = [];
        if (!ex.description) ex.description = '';
        if (!ex.tips) ex.tips = [];
      });
    });
  }
}

export const db = new MuscloDB();

const defaultExercises: Omit<Exercise, 'id'>[] = [
  // ── POITRINE ──────────────────────────────────────────────────
  {
    name: 'Développé couché',
    category: 'Compound',
    muscleGroup: 'Poitrine',
    primaryMuscles: ['pectoraux'],
    secondaryMuscles: ['deltoide_ant', 'triceps'],
    description:
      'Allongé sur le banc, saisissez la barre à largeur d\'épaules. Descendez lentement la barre vers le bas du sternum, coudes à 45-75° du corps, puis poussez jusqu\'à extension quasi-complète.',
    tips: [
      'Pieds à plat sur le sol, fesses sur le banc',
      'Omoplate serrées et rétractées contre le banc',
      'Descente contrôlée en 2-3 secondes',
      'Ne verrouillez pas les coudes en haut',
      'Barre au niveau du bas du sternum, pas de la gorge',
    ],
  },
  {
    name: 'Développé incliné',
    category: 'Compound',
    muscleGroup: 'Poitrine',
    primaryMuscles: ['pectoraux', 'deltoide_ant'],
    secondaryMuscles: ['triceps'],
    description:
      'Banc incliné à 30-45°. Saisir la barre légèrement plus large que les épaules. Descendre vers le haut du pectoral, poussez en arc. Cible le faisceau claviculaire du grand pectoral.',
    tips: [
      'Inclinaison entre 30° et 45° max (au-delà les épaules dominent)',
      'Contact de la barre avec le haut de la poitrine',
      'Éviter l\'antépulsion des épaules en haut du mouvement',
      'Garder les lombaires légèrement arquées naturellement',
    ],
  },
  {
    name: 'Écarté poulie',
    category: 'Isolation',
    muscleGroup: 'Poitrine',
    primaryMuscles: ['pectoraux'],
    secondaryMuscles: ['deltoide_ant'],
    description:
      'Poulies hautes face à face. Saisir les poignées, légèrement penché en avant, bras légèrement fléchis. Joindre les mains devant la poitrine en contractant fort les pectoraux.',
    tips: [
      'Coudes légèrement fléchis en permanence (protection articulaire)',
      'Mouvement de "serrage" : imaginez enlacer un arbre',
      'Contraction maximale en fin de course, tenir 1 seconde',
      'Étirement complet en ouvrant les bras, sans aller trop loin',
    ],
  },
  {
    name: 'Dips',
    category: 'Compound',
    muscleGroup: 'Poitrine',
    primaryMuscles: ['pectoraux', 'triceps'],
    secondaryMuscles: ['deltoide_ant'],
    description:
      'Aux barres parallèles, descendez en penchant légèrement le buste vers l\'avant pour cibler les pectoraux. Descendez jusqu\'à ce que les bras soient à 90°, remontez sans verrouiller les coudes.',
    tips: [
      'Incliner le buste vers l\'avant pour cibler la poitrine (droit = triceps)',
      'Descente lente et contrôlée, ne pas rebondir en bas',
      'Épaules stables, ne pas les laisser monter vers les oreilles',
      'Croiser les chevilles pour stabiliser',
    ],
  },

  // ── DOS ───────────────────────────────────────────────────────
  {
    name: 'Soulevé de terre',
    category: 'Compound',
    muscleGroup: 'Dos',
    primaryMuscles: ['grand_dorsal', 'lombaires', 'ischio', 'fessiers'],
    secondaryMuscles: ['trapeze', 'quadriceps', 'avant_bras'],
    description:
      'Pieds écartés largeur hanches, barre sur les métatarses. Hanches en arrière, dos plat, saisir la barre en double pronation ou crochet. Pousser le sol du pied tout en redressant le dos. Descente contrôlée.',
    tips: [
      'Dos plat et neutre du début à la fin — aucune flexion lombaire',
      'Barre contre les tibias et les cuisses sur toute la remontée',
      'Inspirer avant de tirer, bloquer le souffle (Valsalva)',
      'Épaules légèrement devant la barre en position basse',
      'Verrouiller les genoux et les hanches en haut, pas d\'hyperextension',
    ],
  },
  {
    name: 'Rowing barre',
    category: 'Compound',
    muscleGroup: 'Dos',
    primaryMuscles: ['grand_dorsal', 'rhomboides', 'trapeze'],
    secondaryMuscles: ['biceps', 'lombaires'],
    description:
      'Penché en avant à 45°, dos plat, barre en pronation. Tirer la barre vers le nombril en écartant les coudes et en contractant les omoplates ensemble.',
    tips: [
      'Ne pas cambrer excessivement pour prendre plus lourd',
      'Tirer les coudes vers l\'arrière, pas vers le haut',
      'Contraction des omoplates à chaque répétition',
      'Contrôle de la descente, ne pas laisser tomber la barre',
      'Regarder devant soi, cou dans l\'axe de la colonne',
    ],
  },
  {
    name: 'Traction',
    category: 'Compound',
    muscleGroup: 'Dos',
    primaryMuscles: ['grand_dorsal', 'rhomboides'],
    secondaryMuscles: ['biceps', 'trapeze', 'deltoide_post'],
    description:
      'Suspendu à la barre, prise pronation légèrement plus large que les épaules. Tirer en amenant la poitrine vers la barre, coudes vers les hanches. Descente lente et complète.',
    tips: [
      'Initier le mouvement en rétractant les omoplates, pas en fléchissant les bras',
      'Poitrine vers la barre, pas le menton',
      'Extension complète des bras en bas pour l\'étirement',
      'Éviter le balancement du corps',
      'Croiser les chevilles et fléchir les genoux pour se stabiliser',
    ],
  },
  {
    name: 'Tirage poulie',
    category: 'Compound',
    muscleGroup: 'Dos',
    primaryMuscles: ['grand_dorsal'],
    secondaryMuscles: ['biceps', 'rhomboides', 'trapeze'],
    description:
      'Assis face à la poulie haute, prise large pronation. Tirer la barre vers le haut du sternum en descendant les coudes vers les hanches. Contrôler la remontée.',
    tips: [
      'Légèrement penché en arrière (15°), pas couché',
      'Tirer les coudes vers le sol et l\'arrière simultanément',
      'Contracter fort le dorsal en bas du mouvement',
      'Extension quasi-complète des bras en haut',
    ],
  },

  // ── ÉPAULES ───────────────────────────────────────────────────
  {
    name: 'Développé militaire',
    category: 'Compound',
    muscleGroup: 'Épaules',
    primaryMuscles: ['deltoide_ant', 'deltoide_lat'],
    secondaryMuscles: ['triceps', 'trapeze'],
    description:
      'Debout ou assis, barre au niveau de la clavicule en pronation. Pousser la barre verticalement au-dessus de la tête, légèrement en arrière du milieu du crâne. Descente contrôlée.',
    tips: [
      'Gainage abdominal strict pour protéger les lombaires',
      'Prise légèrement plus large que les épaules',
      'La barre passe devant le visage (pas derrière la nuque)',
      'Ne pas pousser les hanches en avant pour compenser',
      'Serrer les fessiers pour verrouiller le bas du corps',
    ],
  },
  {
    name: 'Élévations latérales',
    category: 'Isolation',
    muscleGroup: 'Épaules',
    primaryMuscles: ['deltoide_lat'],
    secondaryMuscles: ['deltoide_ant', 'trapeze'],
    description:
      'Debout, haltères le long du corps. Lever les bras sur les côtés jusqu\'à hauteur des épaules, légèrement fléchis, le petit doigt légèrement en hausse (comme vider un verre).',
    tips: [
      'Mouvement lent et contrôlé, surtout en descente',
      'Ne pas monter au-dessus de l\'horizontale',
      'Légère flexion du coude (10-15°), fixe tout au long',
      'Éviter de hisser les épaules vers les oreilles',
      'Pencher légèrement en avant pour mieux cibler le deltoïde latéral',
    ],
  },
  {
    name: 'Face pull',
    category: 'Isolation',
    muscleGroup: 'Épaules',
    primaryMuscles: ['deltoide_post', 'rhomboides'],
    secondaryMuscles: ['trapeze', 'avant_bras'],
    description:
      'Poulie haute avec corde. Tirer vers le visage en écartant les mains de part et d\'autre de la tête, coudes à hauteur des épaules. Excellent pour la santé des épaules.',
    tips: [
      'Coudes à la hauteur des épaules ou légèrement au-dessus',
      'Finir avec les mains de chaque côté du visage, paumes vers l\'avant',
      'Contraction forte des rhomboïdes et du deltoïde postérieur',
      'Mouvement lent, ne pas utiliser l\'élan',
    ],
  },

  // ── JAMBES ────────────────────────────────────────────────────
  {
    name: 'Squat',
    category: 'Compound',
    muscleGroup: 'Jambes',
    primaryMuscles: ['quadriceps', 'fessiers'],
    secondaryMuscles: ['ischio', 'lombaires', 'mollets'],
    description:
      'Barre en position haute (trapèzes) ou basse (arrière des deltoïdes). Pieds largeur épaules, pointes légèrement tournées. Descendre en poussant les genoux dans l\'axe des orteils, dos droit, jusqu\'à ce que les cuisses soient parallèles au sol.',
    tips: [
      'Descente en poussant les hanches en arrière et en bas simultanément',
      'Genoux dans l\'axe des orteils, ne pas rentrer en dedans',
      'Dos droit, regard horizontal ou légèrement vers le haut',
      'Remonter en poussant le sol du pied, pas en sortant les fesses en premier',
      'Inspirer en bas, expirer sur la poussée',
    ],
  },
  {
    name: 'Presse à cuisses',
    category: 'Compound',
    muscleGroup: 'Jambes',
    primaryMuscles: ['quadriceps', 'fessiers'],
    secondaryMuscles: ['ischio'],
    description:
      'Assis dans la machine, pieds écartés largeur hanches au centre de la plateforme. Descendre le plateau jusqu\'à 90° de flexion de genou, pousser sans verrouiller les genoux.',
    tips: [
      'Dos plaqué contre le dossier en permanence',
      'Plus les pieds sont hauts, plus les fessiers/ischios travaillent',
      'Plus les pieds sont bas, plus les quadriceps dominent',
      'Ne jamais verrouiller les genoux en extension',
      'Amplitude complète de mouvement sauf douleur',
    ],
  },
  {
    name: 'Leg curl',
    category: 'Isolation',
    muscleGroup: 'Jambes',
    primaryMuscles: ['ischio'],
    secondaryMuscles: ['mollets'],
    description:
      'Allongé sur le banc, cheville sous le coussin. Fléchir les genoux en ramenant les talons vers les fessiers, contracter fort en haut, redescendre lentement.',
    tips: [
      'Hanches plaquées contre le banc, ne pas les soulever',
      'Contraction maximale en haut, tenir 1 seconde',
      'Descente très lente (2-3 secondes) pour plus d\'efficacité',
      'Pointes de pieds légèrement fléchies vers les tibias pour plus de tension',
    ],
  },
  {
    name: 'Leg extension',
    category: 'Isolation',
    muscleGroup: 'Jambes',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: [],
    description:
      'Assis dans la machine, dos droit, cheville derrière le coussin. Étendre les jambes jusqu\'à l\'horizontale, contracter les quadriceps, redescendre lentement.',
    tips: [
      'Dos plaqué contre le dossier',
      'Extension complète pour contraction maximale du quad',
      'Descente lente et contrôlée, ne pas laisser tomber',
      'Utiliser un poids modéré : l\'articulation du genou est sollicitée',
    ],
  },
  {
    name: 'Fentes',
    category: 'Compound',
    muscleGroup: 'Jambes',
    primaryMuscles: ['quadriceps', 'fessiers'],
    secondaryMuscles: ['ischio', 'mollets'],
    description:
      'Debout, un grand pas en avant. Descendre le genou arrière vers le sol sans le toucher, genou avant dans l\'axe du pied. Remonter en poussant sur la jambe avant.',
    tips: [
      'Grand pas pour que le genou ne dépasse pas le pied',
      'Torse vertical, ne pas se pencher en avant',
      'Genou arrière à 1-2 cm du sol',
      'Pousser sur le talon de la jambe avant pour remonter',
      'Alterner les jambes ou faire toutes les reps d\'un côté',
    ],
  },

  // ── BRAS ──────────────────────────────────────────────────────
  {
    name: 'Curl biceps barre',
    category: 'Isolation',
    muscleGroup: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['avant_bras'],
    description:
      'Debout, barre en supination prise légèrement plus large que les épaules. Fléchir les coudes en gardant les bras le long du corps jusqu\'à ce que la barre arrive au niveau des épaules.',
    tips: [
      'Coudes fixes le long du corps, ne pas les envoyer en avant',
      'Pas de balancement du buste pour prendre de l\'élan',
      'Supination maximale au sommet (tourner les poignets vers l\'extérieur)',
      'Descente complète pour un étirement total du biceps',
    ],
  },
  {
    name: 'Curl haltères',
    category: 'Isolation',
    muscleGroup: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['avant_bras'],
    description:
      'Debout ou assis, haltères en supination. Fléchir alternativement ou simultanément les coudes. La supination (rotation du poignet) tout au long du mouvement maximise le travail du biceps.',
    tips: [
      'Supiner (tourner la paume vers le haut) dès le début du mouvement',
      'Coudes bien fixes contre les flancs',
      'Contraction maximale en haut, serrer fort',
      'Alterner les bras pour plus de concentration sur chaque côté',
    ],
  },
  {
    name: 'Extension triceps poulie',
    category: 'Isolation',
    muscleGroup: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    description:
      'Face à la poulie haute avec barre droite ou corde. Coudes fixés le long du corps. Étendre les bras vers le bas jusqu\'à extension complète, contracter les triceps.',
    tips: [
      'Coudes collés au corps et fixes, seuls les avant-bras bougent',
      'Extension complète en bas pour la contraction maximale',
      'Descente lente et contrôlée',
      'Avec la corde : écarter les mains en bas de chaque côté du corps',
    ],
  },
  {
    name: 'Barre front',
    category: 'Isolation',
    muscleGroup: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    description:
      'Allongé sur un banc, barre EZ tenue au-dessus de la tête bras tendus. Fléchir les coudes pour descendre la barre vers le front (d\'où le nom), puis étendre les bras.',
    tips: [
      'Coudes pointés vers le plafond, ne pas les laisser s\'écarter',
      'Amplitude complète : descendre jusqu\'au front ou légèrement derrière',
      'Peut aussi être fait avec haltères pour réduire le stress au poignet',
      'Mouvement lent pour éviter de prendre la barre dans le visage',
    ],
  },
];

export async function seedExercises() {
  const count = await db.exercises.count();
  if (count > 0) return;
  await db.exercises.bulkAdd(defaultExercises);
}

// Reseed forcé pour mettre à jour les exercices existants (après migration)
export async function reseedExercises() {
  await db.exercises.clear();
  await db.exercises.bulkAdd(defaultExercises);
}
