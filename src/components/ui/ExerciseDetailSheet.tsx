'use client';

import { X, CheckCircle2 } from 'lucide-react';
import MuscleMap, { MuscleLegend } from './MuscleMap';
import type { Exercise } from '@/lib/db';

interface ExerciseDetailSheetProps {
  exercise: Exercise;
  onClose: () => void;
  onSelect?: () => void;
}

const MUSCLE_LABELS: Record<string, string> = {
  pectoraux: 'Pectoraux',
  deltoide_ant: 'Deltoïde antérieur',
  deltoide_lat: 'Deltoïde latéral',
  deltoide_post: 'Deltoïde postérieur',
  biceps: 'Biceps',
  triceps: 'Triceps',
  avant_bras: 'Avant-bras',
  grand_dorsal: 'Grand dorsal',
  trapeze: 'Trapèze',
  lombaires: 'Lombaires',
  rhomboides: 'Rhomboïdes',
  quadriceps: 'Quadriceps',
  ischio: 'Ischio-jambiers',
  fessiers: 'Fessiers',
  mollets: 'Mollets',
  abdominaux: 'Abdominaux',
};

export default function ExerciseDetailSheet({ exercise, onClose, onSelect }: ExerciseDetailSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 shrink-0">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-lg truncate">{exercise.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
              {exercise.muscleGroup}
            </span>
            <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
              {exercise.category}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Schéma musculaire */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-4">
            Muscles sollicités
          </p>
          <div className="flex flex-col items-center gap-3">
            <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} size={240} />
            <MuscleLegend />
          </div>

          {/* Tags muscles */}
          <div className="mt-4 space-y-2">
            {exercise.primaryMuscles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {exercise.primaryMuscles.map((m) => (
                  <span key={m} className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2.5 py-1 rounded-full">
                    {MUSCLE_LABELS[m] ?? m}
                  </span>
                ))}
              </div>
            )}
            {exercise.secondaryMuscles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map((m) => (
                  <span key={m} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full">
                    {MUSCLE_LABELS[m] ?? m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-zinc-900 mx-4" />

        {/* Description */}
        {exercise.description && (
          <div className="px-4 py-5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">
              Exécution
            </p>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {exercise.description}
            </p>
          </div>
        )}

        {/* Tips technique */}
        {exercise.tips?.length > 0 && (
          <>
            <div className="h-px bg-zinc-900 mx-4" />
            <div className="px-4 py-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">
                Points clés
              </p>
              <ul className="space-y-3">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300 text-sm leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="h-6" />
      </div>

      {/* Bouton ajouter à la séance */}
      {onSelect && (
        <div className="px-4 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={onSelect}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-base transition-colors active:scale-[0.98] touch-manipulation"
          >
            Ajouter à la séance
          </button>
        </div>
      )}
    </div>
  );
}
