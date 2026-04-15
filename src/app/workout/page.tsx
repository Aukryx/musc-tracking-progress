'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import WorkoutSession from '@/components/workout/WorkoutSession';
import { db } from '@/lib/db';
import { generateId, loadActiveWorkout, type ActiveWorkout } from '@/lib/workout-store';

function WorkoutPageInner() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null);

  useEffect(() => {
    async function init() {
      // Reprendre une séance en cours si elle existe
      const active = loadActiveWorkout();
      if (active && active.exercises.length > 0) {
        setWorkout(active);
        return;
      }

      // Charger un template si fourni
      if (templateId) {
        const tmpl = await db.templates.get(parseInt(templateId));
        if (tmpl) {
          await db.templates.update(parseInt(templateId), { lastUsedAt: new Date() });
          const newWorkout: ActiveWorkout = {
            workoutId: null,
            name: tmpl.name,
            startedAt: new Date(),
            exercises: tmpl.exercises.map((te) => ({
              id: generateId(),
              name: te.name,
              order: te.order,
              sets: Array.from({ length: te.defaultSets }, () => ({
                id: generateId(),
                weight: te.defaultWeight?.toString() ?? '',
                reps: te.defaultReps?.toString() ?? '',
                completed: false,
                oneRepMax: 0,
              })),
            })),
          };
          setWorkout(newWorkout);
          return;
        }
      }

      // Séance vide
      const now = new Date();
      const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now);
      const name = `Séance du ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
      setWorkout({
        workoutId: null,
        name,
        startedAt: now,
        exercises: [],
      });
    }

    init();
  }, [templateId]);

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <WorkoutSession initial={workout} />;
}

export default function WorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkoutPageInner />
    </Suspense>
  );
}
