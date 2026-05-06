'use client';

import Image from 'next/image';
import { ArrowLeft, Star } from 'lucide-react';
import { db, type Exercise } from '@/lib/db';
import { useEffect, useState } from 'react';
import { calculate1RM } from '@/lib/calculations';

interface ExerciseDetailSheetProps {
  exercise: Exercise;
  onClose: () => void;
  onSelect?: () => void;
}

interface PersonalBest {
  weight: number;
  reps: number;
  oneRepMax: number;
  daysAgo: number;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ExerciseDetailSheet({ exercise, onClose, onSelect }: ExerciseDetailSheetProps) {
  const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);

  useEffect(() => {
    db.workoutSets.where('exerciseName').equals(exercise.name).toArray().then(sets => {
      if (!sets.length) return;
      const best = sets.reduce((a, b) => a.oneRepMax >= b.oneRepMax ? a : b);
      const daysAgo = Math.floor((Date.now() - new Date(best.completedAt).getTime()) / 86400000);
      setPersonalBest({ weight: best.weight, reps: best.reps, oneRepMax: best.oneRepMax, daysAgo });
    });
  }, [exercise.name]);

  const primaryMuscles = exercise.primaryMuscles ?? [];
  const secondaryMuscles = exercise.secondaryMuscles ?? [];
  const allMuscles = [...primaryMuscles, ...secondaryMuscles];
  const instructions = exercise.instructions ?? [];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--color-line)', flexShrink: 0 }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--color-bg-2)', border: '1px solid var(--color-line)',
          display: 'grid', placeItems: 'center', color: 'var(--color-ink-2)', cursor: 'pointer',
        }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exercise.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 1 }}>
            {primaryMuscles.slice(0, 2).map(capitalize).join(', ')}
            {exercise.equipments?.length ? ` · ${capitalize(exercise.equipments[0])}` : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: onSelect ? 80 : 20 }} className="no-scrollbar">
        {/* GIF */}
        {exercise.gifUrl ? (
          <div style={{ margin: 16 }}>
            <Image
              src={exercise.gifUrl}
              alt={exercise.name}
              width={361}
              height={200}
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 18, background: 'var(--color-bg-2)' }}
            />
          </div>
        ) : (
          <div style={{
            margin: 16, height: 200, borderRadius: 18,
            background: `repeating-linear-gradient(135deg, var(--color-bg-1) 0 12px, var(--color-bg-2) 12px 24px)`,
            border: '1px solid var(--color-line)', display: 'grid', placeItems: 'center',
            color: 'var(--color-ink-3)', fontSize: 12, fontFamily: 'var(--font-mono)',
          }}>
            [Démonstration]
          </div>
        )}

        {/* Personal best */}
        {personalBest && (
          <div style={{ padding: '0 16px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 8 }}>Ton record</div>
            <div style={{
              background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 16,
              padding: 16, display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'var(--color-accent-soft)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Star size={22} color="var(--color-accent)" fill="var(--color-accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {personalBest.weight}<span style={{ fontSize: 13, color: 'var(--color-ink-3)', marginLeft: 2 }}>kg</span>
                  <span style={{ color: 'var(--color-ink-3)', margin: '0 6px' }}>×</span>
                  {personalBest.reps}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
                  1RM estimé · {personalBest.oneRepMax.toFixed(1)}kg
                  {personalBest.daysAgo === 0 ? " · Aujourd'hui" : personalBest.daysAgo === 1 ? ' · Hier' : ` · Il y a ${personalBest.daysAgo} jours`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Muscles */}
        {allMuscles.length > 0 && (
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 10 }}>Muscles ciblés</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {primaryMuscles.map(m => (
                <span key={m} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: 'var(--color-accent-soft)', color: 'var(--color-accent)',
                }}>{capitalize(m)}</span>
              ))}
              {secondaryMuscles.map(m => (
                <span key={m} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: 'var(--color-bg-1)', color: 'var(--color-ink-2)', border: '1px solid var(--color-line)',
                }}>{capitalize(m)}</span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {instructions.length > 0 && (
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 10 }}>Exécution</div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {instructions.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', width: 22, height: 22, borderRadius: 999,
                    background: 'var(--color-bg-2)', color: 'var(--color-ink-2)',
                    display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.45 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Add to workout */}
      {onSelect && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-line)', flexShrink: 0 }}>
          <button onClick={onSelect} style={{
            width: '100%', background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
            border: 'none', borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            Ajouter à la séance
          </button>
        </div>
      )}
    </div>
  );
}
