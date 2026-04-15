import Dexie, { type Table } from 'dexie';

export interface Exercise {
  id?: number;
  name: string;
  category: string;
  muscleGroup: string;
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
  }
}

export const db = new MuscloDB();

// Seed default exercises
export async function seedExercises() {
  const count = await db.exercises.count();
  if (count > 0) return;

  const defaultExercises: Omit<Exercise, 'id'>[] = [
    // Poitrine
    { name: 'Développé couché', category: 'Compound', muscleGroup: 'Poitrine' },
    { name: 'Développé incliné', category: 'Compound', muscleGroup: 'Poitrine' },
    { name: 'Écarté poulie', category: 'Isolation', muscleGroup: 'Poitrine' },
    { name: 'Dips', category: 'Compound', muscleGroup: 'Poitrine' },
    // Dos
    { name: 'Soulevé de terre', category: 'Compound', muscleGroup: 'Dos' },
    { name: 'Rowing barre', category: 'Compound', muscleGroup: 'Dos' },
    { name: 'Traction', category: 'Compound', muscleGroup: 'Dos' },
    { name: 'Tirage poulie', category: 'Compound', muscleGroup: 'Dos' },
    // Épaules
    { name: 'Développé militaire', category: 'Compound', muscleGroup: 'Épaules' },
    { name: 'Élévations latérales', category: 'Isolation', muscleGroup: 'Épaules' },
    { name: 'Face pull', category: 'Isolation', muscleGroup: 'Épaules' },
    // Jambes
    { name: 'Squat', category: 'Compound', muscleGroup: 'Jambes' },
    { name: 'Presse à cuisses', category: 'Compound', muscleGroup: 'Jambes' },
    { name: 'Leg curl', category: 'Isolation', muscleGroup: 'Jambes' },
    { name: 'Leg extension', category: 'Isolation', muscleGroup: 'Jambes' },
    { name: 'Fentes', category: 'Compound', muscleGroup: 'Jambes' },
    // Bras
    { name: 'Curl biceps barre', category: 'Isolation', muscleGroup: 'Biceps' },
    { name: 'Curl haltères', category: 'Isolation', muscleGroup: 'Biceps' },
    { name: 'Extension triceps poulie', category: 'Isolation', muscleGroup: 'Triceps' },
    { name: 'Barre front', category: 'Isolation', muscleGroup: 'Triceps' },
  ];

  await db.exercises.bulkAdd(defaultExercises);
}
