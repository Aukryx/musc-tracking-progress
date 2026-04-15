'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Dumbbell } from 'lucide-react';
import { db, type Workout, type WorkoutSet } from '@/lib/db';
import { formatDate, format1RM, sessionDuration } from '@/lib/calculations';

interface GroupedExercise {
  name: string;
  sets: WorkoutSet[];
  bestOneRM: number;
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<GroupedExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [w, sets] = await Promise.all([
        db.workouts.get(id),
        db.workoutSets.where('workoutId').equals(id).toArray(),
      ]);

      if (!w) {
        router.push('/history');
        return;
      }

      setWorkout(w);

      // Grouper par exercice
      const map = new Map<string, WorkoutSet[]>();
      for (const set of sets) {
        if (!map.has(set.exerciseName)) map.set(set.exerciseName, []);
        map.get(set.exerciseName)!.push(set);
      }

      const grouped: GroupedExercise[] = [];
      for (const [name, exSets] of map) {
        const bestOneRM = Math.max(...exSets.map((s) => s.oneRepMax));
        grouped.push({ name, sets: exSets.sort((a, b) => a.setIndex - b.setIndex), bestOneRM });
      }

      setExercises(grouped);
      setLoading(false);
    }

    load();
  }, [id, router]);

  async function handleDelete() {
    if (!confirm('Supprimer cette séance ?')) return;
    await db.workoutSets.where('workoutId').equals(id).delete();
    await db.workouts.delete(id);
    router.push('/history');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-zinc-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white truncate">{workout.name}</h1>
            <p className="text-xs text-zinc-500">{formatDate(workout.startedAt)}</p>
          </div>
          <button
            onClick={handleDelete}
            className="text-zinc-600 hover:text-red-500 p-2 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Résumé */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">{exercises.length}</div>
            <div className="text-xs text-zinc-500 mt-0.5">Exercices</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">
              {exercises.reduce((acc, e) => acc + e.sets.length, 0)}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Séries</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">
              {workout.finishedAt ? sessionDuration(workout.startedAt, workout.finishedAt) : '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Minutes</div>
          </div>
        </div>

        {/* Exercices */}
        {exercises.map((ex) => (
          <div key={ex.name} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-zinc-900/40">
              <Dumbbell size={16} className="text-zinc-500" />
              <div className="flex-1">
                <h3 className="text-white font-bold">{ex.name}</h3>
                <p className="text-xs text-zinc-500">
                  Best 1RM: <span className="text-yellow-400 font-medium">{format1RM(ex.bestOneRM)}</span>
                </p>
              </div>
            </div>

            <div className="p-3 space-y-2">
              {/* Headers */}
              <div className="flex items-center gap-3 px-2 pb-1">
                <span className="w-5 text-xs text-zinc-600 text-center">#</span>
                <span className="flex-1 text-xs text-zinc-600 text-center">Poids</span>
                <span className="flex-1 text-xs text-zinc-600 text-center">Reps</span>
                <span className="flex-1 text-xs text-zinc-600 text-right">1RM</span>
              </div>

              {ex.sets.map((set, i) => (
                <div
                  key={set.id}
                  className="flex items-center gap-3 bg-zinc-900 rounded-xl px-3 py-3"
                >
                  <span className="w-5 text-center text-zinc-500 text-sm font-mono">{i + 1}</span>
                  <span className="flex-1 text-center text-white font-bold">{set.weight} kg</span>
                  <span className="flex-1 text-center text-white font-bold">× {set.reps}</span>
                  <span className="flex-1 text-right text-zinc-400 text-sm">
                    {format1RM(set.oneRepMax)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
