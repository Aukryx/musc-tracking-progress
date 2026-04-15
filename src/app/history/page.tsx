'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Dumbbell, Clock, Plus } from 'lucide-react';
import { db, type Workout } from '@/lib/db';
import { formatDate, sessionDuration } from '@/lib/calculations';

interface WorkoutSummary extends Workout {
  exerciseCount: number;
  setCount: number;
}

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ws = await db.workouts.orderBy('startedAt').reverse().toArray();
      const summaries = await Promise.all(
        ws.map(async (w) => {
          const sets = await db.workoutSets.where('workoutId').equals(w.id!).toArray();
          const names = [...new Set(sets.map((s) => s.exerciseName))];
          return { ...w, exerciseCount: names.length, setCount: sets.length };
        })
      );
      setWorkouts(summaries);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-white">Historique</h1>
        <Link
          href="/workout"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          <Plus size={16} />
          Nouvelle
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <Dumbbell size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium text-zinc-500">Aucune séance</p>
          <p className="text-sm mt-1">Vos séances apparaîtront ici</p>
          <Link
            href="/workout"
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Démarrer une séance
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <Link
              key={w.id}
              href={`/history/${w.id}`}
              className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-colors active:scale-[0.98] touch-manipulation"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                <Dumbbell size={18} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold truncate">{w.name}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(w.startedAt)}
                  </span>
                </div>
                <div className="flex gap-3 mt-1.5 text-xs text-zinc-500">
                  <span>{w.exerciseCount} exercices</span>
                  <span>·</span>
                  <span>{w.setCount} séries</span>
                  {w.finishedAt && (
                    <>
                      <span>·</span>
                      <span>{sessionDuration(w.startedAt, w.finishedAt)} min</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-600 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
