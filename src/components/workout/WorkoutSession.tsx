'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Clock, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExerciseCard from './ExerciseCard';
import ExercisePicker from '@/components/ui/ExercisePicker';
import RestTimer from '@/components/ui/RestTimer';
import {
  type ActiveWorkout,
  type ActiveExercise,
  generateId,
  saveActiveWorkout,
  clearActiveWorkout,
} from '@/lib/workout-store';
import { db, type WorkoutSet } from '@/lib/db';
import { sessionDuration, formatDuration } from '@/lib/calculations';

interface PreviousBest {
  weight: number;
  reps: number;
  oneRepMax: number;
}

interface WorkoutSessionProps {
  initial: ActiveWorkout;
}

export default function WorkoutSession({ initial }: WorkoutSessionProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<ActiveWorkout>(initial);
  const [showPicker, setShowPicker] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previousBests, setPreviousBests] = useState<Record<string, PreviousBest>>({});
  const [saving, setSaving] = useState(false);

  // Chrono de séance
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(sessionDuration(workout.startedAt));
    }, 10000);
    setElapsed(sessionDuration(workout.startedAt));
    return () => clearInterval(interval);
  }, [workout.startedAt]);

  // Persist en session storage à chaque changement
  useEffect(() => {
    saveActiveWorkout(workout);
  }, [workout]);

  // Charger les bests précédents pour chaque exercice
  useEffect(() => {
    const names = workout.exercises.map((e) => e.name);
    if (names.length === 0) return;

    Promise.all(
      names.map(async (name) => {
        const sets = await db.workoutSets
          .where('exerciseName')
          .equals(name)
          .reverse()
          .sortBy('completedAt');
        if (sets.length === 0) return [name, null] as const;
        const best = sets.reduce((a, b) => (a.oneRepMax >= b.oneRepMax ? a : b));
        return [
          name,
          { weight: best.weight, reps: best.reps, oneRepMax: best.oneRepMax },
        ] as const;
      })
    ).then((entries) => {
      const map: Record<string, PreviousBest> = {};
      for (const [name, val] of entries) {
        if (name && val) map[name] = val;
      }
      setPreviousBests(map);
    });
  }, [workout.exercises.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function addExercise(name: string) {
    const newExercise: ActiveExercise = {
      id: generateId(),
      name,
      order: workout.exercises.length,
      sets: [
        {
          id: generateId(),
          weight: '',
          reps: '',
          completed: false,
          oneRepMax: 0,
        },
      ],
    };
    setWorkout((w) => ({ ...w, exercises: [...w.exercises, newExercise] }));
    setShowPicker(false);
  }

  function updateExercise(updated: ActiveExercise) {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((e) => (e.id === updated.id ? updated : e)),
    }));
  }

  function deleteExercise(id: string) {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.filter((e) => e.id !== id),
    }));
  }

  function handleSetCompleted() {
    setShowTimer(true);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const finishedAt = new Date();

      // Créer ou récupérer le workout en DB
      let workoutId: number = workout.workoutId ?? 0;
      if (!workout.workoutId) {
        workoutId = await db.workouts.add({
          name: workout.name,
          startedAt: workout.startedAt,
          finishedAt,
        });
      } else {
        await db.workouts.update(workoutId, { finishedAt });
      }

      // Sauvegarder toutes les séries complétées
      const setsToSave: Omit<WorkoutSet, 'id'>[] = [];
      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          if (set.completed && (parseFloat(set.weight) > 0) && (parseInt(set.reps) > 0)) {
            setsToSave.push({
              workoutId,
              exerciseName: exercise.name,
              exerciseOrder: exercise.order,
              setIndex: exercise.sets.filter((s) => s.completed).indexOf(set),
              weight: parseFloat(set.weight),
              reps: parseInt(set.reps),
              oneRepMax: set.oneRepMax,
              completedAt: finishedAt,
            });
          }
        }
      }

      await db.workoutSets.bulkAdd(setsToSave);
      clearActiveWorkout();
      router.push('/history');
    } catch (err) {
      console.error('Erreur de sauvegarde:', err);
      setSaving(false);
    }
  }, [workout, router]);

  const totalSets = workout.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSets = workout.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header sticky */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-zinc-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <h1 className="text-base font-bold text-white truncate">{workout.name}</h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatDuration(elapsed * 60)}
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell size={11} />
                {completedSets}/{totalSets} séries
              </span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || completedSets === 0}
            className="bg-green-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors active:scale-95"
          >
            <Save size={15} />
            {saving ? 'Sauvegarde...' : 'Terminer'}
          </button>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div className="h-0.5 bg-zinc-900">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="px-4 py-4 space-y-4 pb-32">
        {workout.exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Dumbbell size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun exercice</p>
            <p className="text-sm mt-1">Ajoutez votre premier exercice ci-dessous</p>
          </div>
        )}

        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            previousBests={previousBests}
            onChange={updateExercise}
            onDelete={() => deleteExercise(exercise.id)}
            onSetCompleted={handleSetCompleted}
          />
        ))}
      </div>

      {/* FAB Ajouter exercice */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-2xl shadow-blue-900/50 transition-all touch-manipulation"
        >
          <Plus size={22} />
          Ajouter un exercice
        </button>
      </div>

      {/* Modals */}
      {showPicker && (
        <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />
      )}

      {showTimer && (
        <RestTimer
          duration={90}
          onDone={() => setShowTimer(false)}
          onClose={() => setShowTimer(false)}
        />
      )}
    </div>
  );
}
