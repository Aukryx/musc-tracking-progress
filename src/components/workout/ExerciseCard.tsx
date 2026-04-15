'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import SetRow from './SetRow';
import type { ActiveExercise, ActiveSet } from '@/lib/workout-store';
import { generateId } from '@/lib/workout-store';

interface PreviousBest {
  weight: number;
  reps: number;
  oneRepMax: number;
}

interface ExerciseCardProps {
  exercise: ActiveExercise;
  previousBests: Record<string, PreviousBest>;
  onChange: (updated: ActiveExercise) => void;
  onDelete: () => void;
  onSetCompleted: () => void;
}

export default function ExerciseCard({
  exercise,
  previousBests,
  onChange,
  onDelete,
  onSetCompleted,
}: ExerciseCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const best = previousBests[exercise.name] ?? null;
  const completedCount = exercise.sets.filter((s) => s.completed).length;

  function addSet() {
    const lastCompleted = [...exercise.sets].reverse().find((s) => s.completed);
    const newSet: ActiveSet = {
      id: generateId(),
      weight: lastCompleted?.weight ?? best?.weight?.toString() ?? '',
      reps: lastCompleted?.reps ?? best?.reps?.toString() ?? '',
      completed: false,
      oneRepMax: 0,
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  }

  function updateSet(index: number, partial: Partial<ActiveSet>) {
    const sets = exercise.sets.map((s, i) => (i === index ? { ...s, ...partial } : s));
    onChange({ ...exercise, sets });
  }

  function deleteSet(index: number) {
    const sets = exercise.sets.filter((_, i) => i !== index);
    onChange({ ...exercise, sets });
  }

  function completeSet(index: number) {
    updateSet(index, { completed: true });
    onSetCompleted();
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-zinc-900/50">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <div className="flex-1">
            <h3 className="text-white font-bold text-base leading-tight">{exercise.name}</h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              {completedCount}/{exercise.sets.length} séries
              {best && (
                <span className="ml-2 text-zinc-600">
                  • Dernier best: {best.weight}kg × {best.reps}
                </span>
              )}
            </p>
          </div>
          <span className="text-zinc-500">
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </span>
        </button>

        <button
          onClick={onDelete}
          className="text-zinc-600 hover:text-red-500 p-1 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-3 pb-1">
            <span className="w-5" />
            <span className="flex-1 text-center text-xs text-zinc-600 uppercase tracking-wider">
              Poids
            </span>
            <span className="w-4" />
            <span className="flex-1 text-center text-xs text-zinc-600 uppercase tracking-wider">
              Reps
            </span>
            <span className="w-16 text-right text-xs text-zinc-600 uppercase tracking-wider">
              1RM
            </span>
            <span className="w-11" />
          </div>

          {exercise.sets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              setNumber={i + 1}
              previousBest={best}
              onChange={(partial) => updateSet(i, partial)}
              onComplete={() => completeSet(i)}
              onDelete={() => deleteSet(i)}
            />
          ))}

          <button
            onClick={addSet}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-700 hover:border-blue-500 text-zinc-500 hover:text-blue-400 rounded-xl transition-colors text-sm font-medium mt-1"
          >
            <Plus size={16} />
            Ajouter une série
          </button>
        </div>
      )}
    </div>
  );
}
