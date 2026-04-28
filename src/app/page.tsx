'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Clock, ChevronRight, Zap, Plus } from 'lucide-react';
import { db, type Workout, type Template, needsExerciseDBSeed, markExerciseDBSeeded } from '@/lib/db';
import { seedFromExerciseDB } from '@/lib/exercisedb';
import { formatDate, sessionDuration } from '@/lib/calculations';

interface WorkoutSummary extends Workout {
  exerciseCount: number;
  setCount: number;
}

export default function DashboardPage() {
  const [lastWorkout, setLastWorkout] = useState<WorkoutSummary | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalSets: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ loaded: 0, total: 873 });

  useEffect(() => {
    async function init() {
      if (needsExerciseDBSeed()) {
        setSyncing(true);
        await seedFromExerciseDB((loaded, total) =>
          setSyncProgress({ loaded, total })
        );
        markExerciseDBSeeded();
        setSyncing(false);
      }
      await load();
    }

    async function load() {
      const [workouts, allSets, tmpl] = await Promise.all([
        db.workouts.orderBy('startedAt').reverse().limit(1).toArray(),
        db.workoutSets.count(),
        db.templates.orderBy('lastUsedAt').reverse().limit(3).toArray(),
      ]);

      const totalWorkouts = await db.workouts.count();

      if (workouts.length > 0) {
        const w = workouts[0];
        const sets = await db.workoutSets.where('workoutId').equals(w.id!).toArray();
        const exerciseNames = [...new Set(sets.map((s) => s.exerciseName))];
        setLastWorkout({ ...w, exerciseCount: exerciseNames.length, setCount: sets.length });
      }

      setTemplates(tmpl);
      setStats({ totalWorkouts, totalSets: allSets });
      setLoading(false);
    }

    init();
  }, []);

  if (syncing) {
    const pct = Math.round((syncProgress.loaded / syncProgress.total) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-8 gap-6">
        <div className="text-center">
          <h2 className="text-white font-bold text-lg mb-1">Syncing exercise library</h2>
          <p className="text-zinc-500 text-sm">Loading {syncProgress.loaded} / {syncProgress.total} exercises…</p>
        </div>
        <div className="w-full max-w-xs bg-zinc-900 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-zinc-600 text-xs">First launch only — data is cached locally</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 space-y-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black text-white tracking-tight">
          <span className="text-blue-500">Muscle</span>Track
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date())}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="text-3xl font-black text-white">{stats.totalWorkouts}</div>
          <div className="text-zinc-500 text-sm mt-1">Séances totales</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="text-3xl font-black text-blue-400">{stats.totalSets}</div>
          <div className="text-zinc-500 text-sm mt-1">Séries validées</div>
        </div>
      </div>

      {/* Dernière séance */}
      {lastWorkout ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
              Dernière séance
            </span>
            <Link
              href={`/history/${lastWorkout.id}`}
              className="text-blue-400 text-xs flex items-center gap-1"
            >
              Voir <ChevronRight size={12} />
            </Link>
          </div>
          <h2 className="text-white font-bold text-lg">{lastWorkout.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {formatDate(lastWorkout.startedAt)}
            </span>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div>
              <span className="text-white font-bold">{lastWorkout.exerciseCount}</span>
              <span className="text-zinc-500 text-sm ml-1">exercices</span>
            </div>
            <div>
              <span className="text-white font-bold">{lastWorkout.setCount}</span>
              <span className="text-zinc-500 text-sm ml-1">séries</span>
            </div>
            {lastWorkout.finishedAt && (
              <div>
                <span className="text-white font-bold">
                  {sessionDuration(lastWorkout.startedAt, lastWorkout.finishedAt)}
                </span>
                <span className="text-zinc-500 text-sm ml-1">min</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center">
          <Dumbbell size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400">Pas encore de séance</p>
          <p className="text-zinc-600 text-sm mt-1">Commencez votre première séance !</p>
        </div>
      )}

      {/* Action principale */}
      <Link
        href="/workout"
        className="flex items-center gap-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white p-5 rounded-2xl font-bold text-lg transition-all touch-manipulation"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Zap size={20} />
        </div>
        <div>
          <div>Démarrer une séance</div>
          <div className="text-blue-200 text-sm font-normal">Séance vide</div>
        </div>
        <ChevronRight size={20} className="ml-auto" />
      </Link>

      {/* Templates */}
      {templates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
              Templates
            </span>
            <Link href="/templates" className="text-blue-400 text-xs flex items-center gap-1">
              Tous <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/workout?template=${t.id}`}
                className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 active:scale-[0.98] rounded-xl p-4 transition-all touch-manipulation"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Dumbbell size={16} className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{t.name}</div>
                  <div className="text-zinc-500 text-xs">{t.exercises.length} exercices</div>
                </div>
                <ChevronRight size={16} className="text-zinc-600" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {templates.length === 0 && (
        <Link
          href="/templates"
          className="flex items-center gap-3 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-colors"
        >
          <Plus size={18} className="text-zinc-600" />
          <span className="text-zinc-500 text-sm">Créer un template de séance</span>
        </Link>
      )}
    </div>
  );
}
