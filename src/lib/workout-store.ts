/**
 * Store de séance en cours — conservé en mémoire/sessionStorage
 * pour survivre aux re-renders sans persister en IndexedDB avant la fin.
 */

export interface ActiveSet {
  id: string; // uuid temporaire
  weight: string;
  reps: string;
  completed: boolean;
  oneRepMax: number;
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
    return parsed;
  } catch {
    return null;
  }
}

export function clearActiveWorkout() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
