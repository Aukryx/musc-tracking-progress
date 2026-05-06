'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, Plus, Timer, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExercisePicker from '@/components/ui/ExercisePicker';
import ExerciseDetailSheet from '@/components/ui/ExerciseDetailSheet';
import RestTimer from '@/components/ui/RestTimer';
import {
  type ActiveWorkout,
  type ActiveExercise,
  type ActiveSet,
  type PreviousBest,
  generateId,
  saveActiveWorkout,
  clearActiveWorkout,
} from '@/lib/workout-store';
import { db, type Exercise, type WorkoutSet } from '@/lib/db';
import { calculate1RM, sessionDuration, formatDuration } from '@/lib/calculations';

interface WorkoutSessionProps {
  initial: ActiveWorkout;
}

export default function WorkoutSession({ initial }: WorkoutSessionProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<ActiveWorkout>(initial);
  const [exIdx, setExIdx] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [elapsed, setElapsed] = useState(() => sessionDuration(initial.startedAt));
  const [previousBests, setPreviousBests] = useState<Record<string, PreviousBest>>({});
  const [saving, setSaving] = useState(false);

  // Hold-to-validate state
  const [holding, setHolding] = useState<number | null>(null);
  const [holdProg, setHoldProg] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef(0);
  const exIdxRef = useRef(exIdx);
  useEffect(() => { exIdxRef.current = exIdx; }, [exIdx]);

  const [showHint, setShowHint] = useState(() => {
    try { return !localStorage.getItem('hint_seen'); } catch { return true; }
  });

  // Chrono
  useEffect(() => {
    const interval = setInterval(() => setElapsed(sessionDuration(workout.startedAt)), 10000);
    return () => clearInterval(interval);
  }, [workout.startedAt]);

  // Persist
  useEffect(() => { saveActiveWorkout(workout); }, [workout]);

  // Previous bests
  useEffect(() => {
    const names = workout.exercises.map(e => e.name);
    if (!names.length) return;
    Promise.all(names.map(async name => {
      const sets = await db.workoutSets.where('exerciseName').equals(name).reverse().sortBy('completedAt');
      if (!sets.length) return [name, null] as const;
      const best = sets.reduce((a, b) => a.oneRepMax >= b.oneRepMax ? a : b);
      return [name, { weight: best.weight, reps: best.reps, oneRepMax: best.oneRepMax }] as const;
    })).then(entries => {
      const map: Record<string, PreviousBest> = {};
      for (const [name, val] of entries) { if (name && val) map[name] = val; }
      setPreviousBests(map);
    });
  }, [workout.exercises.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentExercise = workout.exercises[exIdx] ?? null;
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = workout.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);

  function addExercise(name: string) {
    setWorkout(w => {
      const newEx: ActiveExercise = {
        id: generateId(), name, order: w.exercises.length,
        sets: [{ id: generateId(), weight: '', reps: '', completed: false, oneRepMax: 0 }],
      };
      setExIdx(w.exercises.length);
      return { ...w, exercises: [...w.exercises, newEx] };
    });
    setShowPicker(false);
  }

  function deleteExercise(id: string) {
    setWorkout(w => {
      const filtered = w.exercises.filter(e => e.id !== id);
      setExIdx(prev => Math.min(prev, Math.max(0, filtered.length - 1)));
      return { ...w, exercises: filtered };
    });
  }

  function addSet() {
    if (!currentExercise) return;
    const last = [...currentExercise.sets].reverse().find(s => s.completed);
    const best = previousBests[currentExercise.name];
    const newSet: ActiveSet = {
      id: generateId(),
      weight: last?.weight ?? best?.weight?.toString() ?? '',
      reps: last?.reps ?? best?.reps?.toString() ?? '',
      completed: false, oneRepMax: 0,
    };
    setWorkout(w => ({
      ...w,
      exercises: w.exercises.map((e, i) => i === exIdxRef.current ? { ...e, sets: [...e.sets, newSet] } : e),
    }));
  }

  function updateSet(setIdx: number, partial: Partial<ActiveSet>) {
    setWorkout(w => ({
      ...w,
      exercises: w.exercises.map((e, i) => i === exIdxRef.current
        ? { ...e, sets: e.sets.map((s, si) => si === setIdx ? { ...s, ...partial } : s) }
        : e
      ),
    }));
  }

  function updateSetInput(setIdx: number, field: 'weight' | 'reps', value: string) {
    const currentIdx = exIdxRef.current;
    setWorkout(w => ({
      ...w,
      exercises: w.exercises.map((e, i) => i === currentIdx
        ? { ...e, sets: e.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
        : e
      ),
    }));
  }

  // Hold-to-validate
  function startHold(setIdx: number) {
    const ex = workout.exercises[exIdx];
    const set = ex?.sets[setIdx];
    if (!set || set.completed) return;
    const w = parseFloat(set.weight) || 0;
    const r = parseInt(set.reps) || 0;
    if (!w || !r) return;

    setHolding(setIdx);
    setHoldProg(0);
    holdStartRef.current = Date.now();

    holdTimerRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - holdStartRef.current) / 600);
      setHoldProg(p);
      if (p >= 1) {
        clearInterval(holdTimerRef.current!);
        setHolding(null);
        setHoldProg(0);
        const currentIdx = exIdxRef.current;
        setWorkout(prev => ({
          ...prev,
          exercises: prev.exercises.map((e, ei) => {
            if (ei !== currentIdx) return e;
            return {
              ...e,
              sets: e.sets.map((s, si) => {
                if (si !== setIdx) return s;
                const sw = parseFloat(s.weight) || 0;
                const sr = parseInt(s.reps) || 0;
                return { ...s, completed: true, oneRepMax: calculate1RM(sw, sr), completedAt: new Date() };
              }),
            };
          }),
        }));
        setShowTimer(true);
        if (typeof navigator !== 'undefined') navigator.vibrate?.(15);
      }
    }, 16);
  }

  function endHold() {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setHolding(null);
    setHoldProg(0);
  }

  async function openDetail() {
    if (!currentExercise) return;
    const ex = await db.exercises.where('name').equals(currentExercise.name).first();
    if (ex) setDetailExercise(ex);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const finishedAt = new Date();
      let workoutId: number;
      if (workout.workoutId === null) {
        workoutId = await db.workouts.add({ name: workout.name, startedAt: workout.startedAt, finishedAt });
      } else {
        workoutId = workout.workoutId;
        await db.workouts.update(workoutId, { finishedAt });
      }
      const setsToSave: Omit<WorkoutSet, 'id'>[] = [];
      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          if (set.completed && parseFloat(set.weight) > 0 && parseInt(set.reps) > 0) {
            setsToSave.push({
              workoutId,
              exerciseName: exercise.name,
              exerciseOrder: exercise.order,
              setIndex: exercise.sets.indexOf(set),
              weight: parseFloat(set.weight),
              reps: parseInt(set.reps),
              oneRepMax: set.oneRepMax,
              completedAt: set.completedAt ?? finishedAt,
            });
          }
        }
      }
      await db.workoutSets.bulkAdd(setsToSave);
      clearActiveWorkout();
      router.push('/progress');
    } catch (err) {
      console.error('Save error:', err);
      setSaving(false);
    }
  }, [workout, router]);

  const bg: React.CSSProperties = {
    background: 'var(--color-bg)',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={bg}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--color-line)', flexShrink: 0 }}>
        <button
          onClick={() => {
            if (completedSets > 0 && !confirm('Abandonner cette séance ?')) return;
            clearActiveWorkout();
            router.push('/');
          }}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-bg-2)', border: '1px solid var(--color-line)',
            display: 'grid', placeItems: 'center', color: 'var(--color-ink-2)', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workout.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', display: 'flex', gap: 10, marginTop: 1 }}>
            <span style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} /> {formatDuration(elapsed)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{completedSets}/{totalSets} séries</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || completedSets === 0}
          style={{
            background: completedSets > 0 ? 'var(--color-accent)' : 'var(--color-bg-2)',
            color: completedSets > 0 ? 'var(--color-accent-ink)' : 'var(--color-ink-4)',
            border: 'none', borderRadius: 12, padding: '8px 14px',
            fontSize: 13, fontWeight: 700, cursor: completedSets > 0 ? 'pointer' : 'default',
            flexShrink: 0,
          }}
        >
          {saving ? '…' : 'Terminer'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--color-bg-2)', flexShrink: 0 }}>
        {totalSets > 0 && (
          <div style={{ height: '100%', background: 'var(--color-accent)', width: `${(completedSets / totalSets) * 100}%`, transition: 'width 0.4s' }} />
        )}
      </div>

      {/* Exercise carousel tabs */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }} className="no-scrollbar">
        {workout.exercises.map((e, i) => {
          const done = e.sets.filter(s => s.completed).length;
          const all = e.sets.length;
          const active = i === exIdx;
          return (
            <button key={e.id} onClick={() => setExIdx(i)} style={{
              flexShrink: 0,
              background: active ? 'var(--color-bg-2)' : 'transparent',
              border: `1px solid ${active ? 'var(--color-line-2)' : 'var(--color-line)'}`,
              borderRadius: 10, padding: '7px 12px', cursor: 'pointer',
              color: active ? 'var(--color-ink)' : 'var(--color-ink-3)',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>{i + 1}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: done === all && all > 0 ? 'var(--color-accent)' : 'var(--color-ink-3)',
              }}>{done}/{all}</span>
            </button>
          );
        })}
        <button onClick={() => setShowPicker(true)} style={{
          flexShrink: 0, background: 'transparent', border: '1px dashed var(--color-line-2)',
          borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: 'var(--color-ink-3)', display: 'grid', placeItems: 'center',
        }}>
          <Plus size={14} />
        </button>
      </div>

      {/* Scrollable exercise area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }} className="no-scrollbar">
        {!currentExercise ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--color-ink-4)', gap: 8 }}>
            <div style={{ fontSize: 40 }}>🏋️</div>
            <p style={{ fontSize: 15, color: 'var(--color-ink-3)' }}>Ajoute ton premier exercice</p>
            <button
              onClick={() => setShowPicker(true)}
              style={{
                background: 'var(--color-accent)', color: 'var(--color-accent-ink)', border: 'none',
                borderRadius: 14, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8,
              }}
            >
              <Plus size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Ajouter un exercice
            </button>
          </div>
        ) : (
          <>
            {/* Exercise header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{currentExercise.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={openDetail} style={{
                  background: 'var(--color-bg-2)', border: '1px solid var(--color-line)', borderRadius: 10,
                  padding: '6px 10px', fontSize: 11, color: 'var(--color-ink-2)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}>
                  Détails <ChevronRight size={12} />
                </button>
                <button onClick={() => deleteExercise(currentExercise.id)} style={{
                  background: 'var(--color-bg-2)', border: '1px solid var(--color-line)',
                  borderRadius: 10, padding: '6px 8px', color: 'var(--color-ink-3)', cursor: 'pointer', fontSize: 15, lineHeight: 1,
                }}>✕</button>
              </div>
            </div>

            {/* Previous best */}
            {previousBests[currentExercise.name] && (() => {
              const best = previousBests[currentExercise.name];
              return (
                <div style={{
                  marginTop: 14, padding: '10px 12px', background: 'var(--color-bg-1)',
                  border: '1px solid var(--color-line)', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', flexShrink: 0 }}>
                    Dernier best
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>
                    {best.weight}<span style={{ color: 'var(--color-ink-3)', fontSize: 11 }}>kg</span>
                    <span style={{ color: 'var(--color-ink-3)', margin: '0 6px' }}>×</span>
                    {best.reps}
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    1RM <span style={{ color: 'var(--color-ink-2)' }}>{best.oneRepMax.toFixed(1)}kg</span>
                  </div>
                </div>
              );
            })()}

            {/* Sets */}
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Column headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: '24px 1fr 1fr 60px', gap: 10, padding: '0 8px',
                fontSize: 10, color: 'var(--color-ink-4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <span>#</span>
                <span style={{ textAlign: 'center' }}>Poids · kg</span>
                <span style={{ textAlign: 'center' }}>Reps</span>
                <span style={{ textAlign: 'right' }}>1RM</span>
              </div>

              {currentExercise.sets.map((set, i) => {
                const isHolding = holding === i;
                const w = parseFloat(set.weight) || 0;
                const r = parseInt(set.reps) || 0;
                const oneRM = calculate1RM(w, r);
                const best = previousBests[currentExercise.name];
                const isPR = best && oneRM > best.oneRepMax && oneRM > 0;

                return (
                  <div
                    key={set.id}
                    onPointerDown={set.completed ? undefined : () => startHold(i)}
                    onPointerUp={endHold}
                    onPointerLeave={endHold}
                    onPointerCancel={endHold}
                    style={{
                      position: 'relative', overflow: 'hidden',
                      display: 'grid', gridTemplateColumns: '24px 1fr 1fr 60px', gap: 10, alignItems: 'center',
                      padding: '12px 12px',
                      background: set.completed ? 'oklch(0.86 0.20 130 / 0.08)' : 'var(--color-bg-1)',
                      border: `1px solid ${set.completed ? 'oklch(0.86 0.20 130 / 0.35)' : 'var(--color-line)'}`,
                      borderRadius: 14, transition: 'background 0.3s, border 0.3s',
                      userSelect: 'none', touchAction: 'none',
                      cursor: set.completed ? 'default' : 'pointer',
                    }}
                  >
                    {/* Hold progress overlay */}
                    {isHolding && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'var(--color-accent)', opacity: 0.12,
                        width: `${holdProg * 100}%`, transition: 'width 0.05s linear', pointerEvents: 'none',
                      }} />
                    )}

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink-3)', fontWeight: 700, position: 'relative' }}>{i + 1}</span>

                    <div style={{ position: 'relative' }}>
                      <input
                        value={set.weight}
                        onChange={e => updateSetInput(i, 'weight', e.target.value)}
                        disabled={set.completed}
                        inputMode="decimal"
                        placeholder="—"
                        onPointerDown={e => e.stopPropagation()}
                        style={{
                          width: '100%', textAlign: 'center',
                          background: set.completed ? 'transparent' : 'var(--color-bg-2)',
                          border: `1px solid ${set.completed ? 'transparent' : 'var(--color-line-2)'}`,
                          color: 'var(--color-ink)', borderRadius: 10, padding: '8px 4px',
                          fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-mono)', outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        value={set.reps}
                        onChange={e => updateSetInput(i, 'reps', e.target.value)}
                        disabled={set.completed}
                        inputMode="numeric"
                        placeholder="—"
                        onPointerDown={e => e.stopPropagation()}
                        style={{
                          width: '100%', textAlign: 'center',
                          background: set.completed ? 'transparent' : 'var(--color-bg-2)',
                          border: `1px solid ${set.completed ? 'transparent' : 'var(--color-line-2)'}`,
                          color: 'var(--color-ink)', borderRadius: 10, padding: '8px 4px',
                          fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-mono)', outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', position: 'relative' }}>
                      {isPR && <span style={{ color: 'var(--color-pr)', fontSize: 11, marginRight: 2 }}>★</span>}
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: set.completed
                          ? (isPR ? 'var(--color-pr)' : 'var(--color-ink-2)')
                          : (oneRM > 0 ? 'var(--color-ink-2)' : 'var(--color-ink-4)'),
                      }}>
                        {oneRM > 0 ? Math.round(oneRM) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}

              <button onClick={addSet} style={{
                marginTop: 4, padding: 12, background: 'transparent',
                border: '1px dashed var(--color-line-2)', borderRadius: 14, color: 'var(--color-ink-3)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Plus size={14} /> Ajouter une série
              </button>
            </div>

            {/* Hint */}
            {showHint && (
              <div style={{
                marginTop: 18, padding: '12px 14px', background: 'var(--color-bg-1)',
                border: '1px solid var(--color-line)', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999, border: '2px solid var(--color-accent)',
                  display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--color-accent)', fontSize: 14,
                }}>✓</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-2)', lineHeight: 1.45, flex: 1 }}>
                  <strong style={{ color: 'var(--color-ink)' }}>Maintiens</strong> sur une série pour la valider.
                </div>
                <button onClick={() => {
                  setShowHint(false);
                  try { localStorage.setItem('hint_seen', '1'); } catch {}
                }} style={{ background: 'none', border: 'none', color: 'var(--color-ink-4)', cursor: 'pointer', fontSize: 18 }}>
                  ×
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB Rest timer */}
      <div style={{ position: 'absolute', bottom: 30, right: 16 }}>
        <button onClick={() => setShowTimer(true)} style={{
          width: 52, height: 52, borderRadius: 16, background: 'var(--color-bg-2)',
          border: '1px solid var(--color-line-2)', color: 'var(--color-ink)',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: '0 10px 24px -8px rgba(0,0,0,0.6)',
        }}>
          <Timer size={20} />
        </button>
      </div>

      {/* Overlays */}
      {showPicker && (
        <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />
      )}
      {detailExercise && (
        <ExerciseDetailSheet exercise={detailExercise} onClose={() => setDetailExercise(null)} />
      )}
      {showTimer && (
        <RestTimer duration={90} onDone={() => setShowTimer(false)} onClose={() => setShowTimer(false)} />
      )}
    </div>
  );
}
