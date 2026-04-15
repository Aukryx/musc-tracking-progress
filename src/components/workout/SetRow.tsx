'use client';

import { useState, useRef } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { calculate1RM, format1RM } from '@/lib/calculations';
import type { ActiveSet } from '@/lib/workout-store';

interface SetRowProps {
  set: ActiveSet;
  setNumber: number;
  previousBest?: { weight: number; reps: number; oneRepMax: number } | null;
  onChange: (updated: Partial<ActiveSet>) => void;
  onComplete: () => void;
  onDelete: () => void;
}

export default function SetRow({
  set,
  setNumber,
  previousBest,
  onChange,
  onComplete,
  onDelete,
}: SetRowProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  const weight = parseFloat(set.weight) || 0;
  const reps = parseInt(set.reps) || 0;
  const currentOneRM = calculate1RM(weight, reps);
  const isPR = previousBest && currentOneRM > previousBest.oneRepMax && currentOneRM > 0;

  function handleComplete() {
    if (!set.completed && weight > 0 && reps > 0) {
      setJustCompleted(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(80);
      }
      setTimeout(() => setJustCompleted(false), 1500);
      onChange({ oneRepMax: currentOneRM });
      onComplete();
    }
  }

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-all duration-300 ${
        set.completed
          ? justCompleted
            ? 'bg-green-900/40 border border-green-500/50'
            : 'bg-zinc-900/50 opacity-70'
          : 'bg-zinc-900'
      }`}
    >
      {/* Numéro de série */}
      <span className="text-zinc-500 text-sm w-5 text-center font-mono shrink-0">
        {setNumber}
      </span>

      {/* Poids */}
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <input
            ref={weightRef}
            type="number"
            inputMode="decimal"
            value={set.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            placeholder={previousBest ? String(previousBest.weight) : '0'}
            disabled={set.completed}
            className="w-full bg-zinc-800 disabled:bg-transparent border border-zinc-700 disabled:border-transparent rounded-lg px-2 py-2 text-white text-center text-lg font-bold placeholder-zinc-600 focus:outline-none focus:border-blue-500 min-w-0"
            onFocus={(e) => e.target.select()}
          />
          <span className="text-zinc-500 text-xs shrink-0">kg</span>
        </div>
      </div>

      <span className="text-zinc-600 text-sm shrink-0">×</span>

      {/* Reps */}
      <div className="flex-1">
        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => onChange({ reps: e.target.value })}
          placeholder={previousBest ? String(previousBest.reps) : '0'}
          disabled={set.completed}
          className="w-full bg-zinc-800 disabled:bg-transparent border border-zinc-700 disabled:border-transparent rounded-lg px-2 py-2 text-white text-center text-lg font-bold placeholder-zinc-600 focus:outline-none focus:border-blue-500"
          onFocus={(e) => e.target.select()}
        />
      </div>

      {/* 1RM */}
      <div className="w-16 text-right shrink-0">
        {currentOneRM > 0 && !set.completed && (
          <div className={`text-xs font-medium ${isPR ? 'text-yellow-400' : 'text-zinc-400'}`}>
            {isPR && <span className="text-yellow-400">★ </span>}
            {format1RM(currentOneRM)}
          </div>
        )}
        {set.completed && set.oneRepMax > 0 && (
          <div className={`text-xs font-medium ${isPR ? 'text-yellow-400' : 'text-zinc-500'}`}>
            {format1RM(set.oneRepMax)}
          </div>
        )}
      </div>

      {/* Bouton valider / supprimer */}
      {!set.completed ? (
        <button
          onClick={handleComplete}
          disabled={weight <= 0 || reps <= 0}
          className="shrink-0 w-11 h-11 flex items-center justify-center bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl transition-all active:scale-95 touch-manipulation"
        >
          <Check size={18} />
        </button>
      ) : (
        <button
          onClick={onDelete}
          className="shrink-0 w-11 h-11 flex items-center justify-center text-zinc-600 hover:text-red-500 rounded-xl transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
