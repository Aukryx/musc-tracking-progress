'use client';

import { X } from 'lucide-react';
import MuscleMap, { MuscleLegend } from './MuscleMap';
import type { Exercise } from '@/lib/db';

interface ExerciseDetailSheetProps {
  exercise: Exercise;
  onClose: () => void;
  onSelect?: () => void;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ExerciseDetailSheet({ exercise, onClose, onSelect }: ExerciseDetailSheetProps) {
  const hasMuscles = exercise.primaryMuscles.length > 0 || exercise.secondaryMuscles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 shrink-0">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-lg truncate">{exercise.name}</h2>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {exercise.muscleGroup}
            </span>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
              {exercise.category}
            </span>
            {exercise.equipments?.map((eq) => (
              <span key={eq} className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                {capitalize(eq)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* GIF */}
        {exercise.gifUrl && (
          <div className="flex justify-center items-center bg-zinc-900 py-6 px-4">
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="h-52 rounded-2xl object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* Muscle map */}
        {hasMuscles && (
          <div className="px-4 pt-5 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-4">
              Muscles
            </p>
            <div className="flex flex-col items-center gap-3">
              <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} size={220} />
              <MuscleLegend />
            </div>
            <div className="mt-4 space-y-2">
              {exercise.primaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exercise.primaryMuscles.map((m) => (
                    <span key={m} className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2.5 py-1 rounded-full">
                      {capitalize(m)}
                    </span>
                  ))}
                </div>
              )}
              {exercise.secondaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exercise.secondaryMuscles.map((m) => (
                    <span key={m} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full">
                      {capitalize(m)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {(exercise.instructions ?? exercise.tips)?.length > 0 && (
          <>
            <div className="h-px bg-zinc-900 mx-4" />
            <div className="px-4 py-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-4">
                Instructions
              </p>
              <ol className="space-y-3">
                {(exercise.instructions ?? exercise.tips).map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xs text-blue-400 font-bold bg-blue-600/20 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-zinc-300 text-sm leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        <div className="h-6" />
      </div>

      {/* Add to workout button */}
      {onSelect && (
        <div className="px-4 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={onSelect}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-base transition-colors active:scale-[0.98] touch-manipulation"
          >
            Add to workout
          </button>
        </div>
      )}
    </div>
  );
}
