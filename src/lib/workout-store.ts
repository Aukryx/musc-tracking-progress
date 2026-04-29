export interface ActiveSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  oneRepMax: number;
  completedAt?: Date;
}

export interface ActiveExercise {
  id: string;
  name: string;
  order: number;
  sets: ActiveSet[];
}

export interface ActiveWorkout {
  workoutId: number | null;
  name: string;
  startedAt: Date;
  exercises: ActiveExercise[];
}

export interface PreviousBest {
  weight: number;
  reps: number;
  oneRepMax: number;
}

const STORAGE_KEY = 'active_workout';

export function saveActiveWorkout(workout: ActiveWorkout) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(workout));
}

export function loadActiveWorkout(): ActiveWorkout | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.startedAt = new Date(parsed.startedAt);
    for (const ex of parsed.exercises ?? []) {
      for (const set of ex.sets ?? []) {
        if (set.completedAt) set.completedAt = new Date(set.completedAt);
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearActiveWorkout() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return crypto.randomUUID();
}
