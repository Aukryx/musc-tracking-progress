import { db, type Exercise } from './db';

interface RawExercise {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  level: string;
  mechanic: string | null;
  force: string | null;
}

const MUSCLE_TO_GROUP: Record<string, string> = {
  chest: 'Chest',
  lats: 'Back',
  'middle back': 'Back',
  'lower back': 'Back',
  traps: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Arms',
  triceps: 'Arms',
  forearms: 'Arms',
  quadriceps: 'Legs',
  hamstrings: 'Legs',
  glutes: 'Legs',
  calves: 'Legs',
  abductors: 'Legs',
  adductors: 'Legs',
  abdominals: 'Core',
  neck: 'Neck',
};

const CATEGORY_MAP: Record<string, string> = {
  stretching: 'Stretching',
  plyometrics: 'Plyometrics',
  cardio: 'Cardio',
  strongman: 'Strength',
  powerlifting: 'Powerlifting',
  'olympic weightlifting': 'Olympic',
};

const EQUIPMENT_MAP: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  'body only': 'Bodyweight',
  bands: 'Bands',
  kettlebells: 'Kettlebell',
  'e-z curl bar': 'Barbell',
  'exercise ball': 'Other',
  'foam roll': 'Other',
  'medicine ball': 'Other',
  none: 'Bodyweight',
  other: 'Other',
};

function mapMuscleGroup(primaryMuscles: string[]): string {
  for (const m of primaryMuscles) {
    const g = MUSCLE_TO_GROUP[m];
    if (g) return g;
  }
  return 'Other';
}

function mapCategory(raw: RawExercise): string {
  if (raw.category !== 'strength') {
    return CATEGORY_MAP[raw.category] ?? raw.category;
  }
  return EQUIPMENT_MAP[raw.equipment ?? 'none'] ?? 'Other';
}

function mapRawToExercise(raw: RawExercise): Omit<Exercise, 'id'> {
  return {
    name: raw.name,
    category: mapCategory(raw),
    muscleGroup: mapMuscleGroup(raw.primaryMuscles),
    primaryMuscles: raw.primaryMuscles,
    secondaryMuscles: raw.secondaryMuscles,
    instructions: raw.instructions,
    equipments: raw.equipment ? [raw.equipment] : [],
  };
}

let _seeding = false;

export async function seedFromExerciseDB(
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  if (_seeding) return;
  _seeding = true;
  try {
    await _seed(onProgress);
  } finally {
    _seeding = false;
  }
}

async function _seed(onProgress?: (loaded: number, total: number) => void): Promise<void> {
  const res = await fetch('/exercises.json');
  if (!res.ok) throw new Error('Failed to load exercises.json');

  const raw: RawExercise[] = await res.json();
  const exercises = raw.map(mapRawToExercise);

  onProgress?.(0, exercises.length);

  await db.exercises.clear();

  const BATCH = 100;
  for (let i = 0; i < exercises.length; i += BATCH) {
    await db.exercises.bulkAdd(exercises.slice(i, i + BATCH));
    onProgress?.(Math.min(i + BATCH, exercises.length), exercises.length);
  }
}
