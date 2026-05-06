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
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions?: string[];
  equipments?: string[];
  gifUrl?: string;
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

// ── Nutrition ──────────────────────────────────────────────────────────────────

export interface Food {
  id?: number;
  name: string;
  kcalPer100: number;
  protein: number;
  carbs: number;
  fats: number;
  fibers: number;
}

export interface MealItem {
  foodId: number;
  qty: number;
}

export interface Meal {
  id?: number;
  date: string;
  time: string;
  name: string;
  items: MealItem[];
  done: boolean;
}

export interface NutritionGoal {
  id?: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fibersG: number;
}

export interface WaterLog {
  id?: number;
  date: string;
  doses: number;
}

// ──────────────────────────────────────────────────────────────────────────────

class MuscloDB extends Dexie {
  exercises!: Table<Exercise>;
  workouts!: Table<Workout>;
  workoutSets!: Table<WorkoutSet>;
  templates!: Table<Template>;
  foods!: Table<Food>;
  meals!: Table<Meal>;
  nutritionGoals!: Table<NutritionGoal>;
  waterLogs!: Table<WaterLog>;

  constructor() {
    super('MuscloDB');

    this.version(1).stores({
      exercises: '++id, name, category, muscleGroup',
      workouts: '++id, startedAt, finishedAt, templateId',
      workoutSets: '++id, workoutId, exerciseName, exerciseOrder, completedAt',
      templates: '++id, name, createdAt, lastUsedAt',
    });

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

    this.version(3).stores({
      exercises: '++id, name, category, muscleGroup',
    }).upgrade(async (trans) => {
      await trans.table('exercises').toCollection().modify((ex) => {
        if (!ex.instructions) ex.instructions = [];
        if (!ex.equipments) ex.equipments = [];
      });
    });

    this.version(4).stores({
      exercises: '++id, name, category, muscleGroup',
      workouts: '++id, startedAt, finishedAt, templateId',
      workoutSets: '++id, workoutId, exerciseName, exerciseOrder, completedAt',
      templates: '++id, name, createdAt, lastUsedAt',
      foods: '++id, name',
      meals: '++id, date, name',
      nutritionGoals: '++id',
      waterLogs: '++id, date',
    });
  }
}

export const db = new MuscloDB();

const SEED_VERSION = 'free-exercise-db-v2';

export function needsExerciseDBSeed(): boolean {
  try {
    return localStorage.getItem('exerciseSeedVersion') !== SEED_VERSION;
  } catch {
    return true;
  }
}

export function markExerciseDBSeeded(): void {
  try {
    localStorage.setItem('exerciseSeedVersion', SEED_VERSION);
  } catch { /* ignore */ }
}
