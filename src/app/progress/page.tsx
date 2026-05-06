'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { db, type Workout, type WorkoutSet } from '@/lib/db';
import { calculate1RM } from '@/lib/calculations';

type Tab = 'stats' | 'history';

interface WorkoutWithStats extends Workout {
  setCount: number;
  volume: number;
  duration: number | null;
}

interface ExerciseOption { name: string; best: number; delta: string; points: number[] }

function formatRelative(date: Date): string {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(date));
}

function getWeekDayLabels(): string[] {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const todayDow = (new Date().getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => days[(todayDow - 6 + i + 7) % 7]);
}

function Sparkline({ points }: { points: number[] }) {
  if (points.every(p => p === 0)) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 300;
  const h = 80;
  const pts = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / range) * (h - 8),
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = path + ` L ${pts[pts.length - 1].x} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} style={{ width: '100%', height: 90, marginTop: 14 }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.86 0.20 130)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.86 0.20 130)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="oklch(0.86 0.20 130)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4" fill="oklch(0.86 0.20 130)" />
    </svg>
  );
}

export default function ProgressPage() {
  const [tab, setTab] = useState<Tab>('stats');
  const [history, setHistory] = useState<WorkoutWithStats[]>([]);
  const [weekVolume, setWeekVolume] = useState<number[]>(new Array(7).fill(0));
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [exIdx, setExIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(getWeekDayLabels, []);

  useEffect(() => {
    async function load() {
      const [workouts, allSets] = await Promise.all([
        db.workouts.orderBy('startedAt').reverse().limit(50).toArray(),
        db.workoutSets.toArray(),
      ]);

      // History with stats
      const withStats: WorkoutWithStats[] = await Promise.all(workouts.map(async w => {
        const sets = allSets.filter(s => s.workoutId === w.id);
        const volume = sets.reduce((a, s) => a + s.weight * s.reps, 0);
        const duration = w.finishedAt
          ? Math.round((new Date(w.finishedAt as Date).getTime() - new Date(w.startedAt).getTime()) / 60000)
          : null;
        return { ...w, setCount: sets.length, volume, duration };
      }));
      setHistory(withStats);

      // Week volume (last 7 days, index 0 = 6 days ago, 6 = today)
      const now = new Date();
      const vol = new Array(7).fill(0);
      for (const s of allSets) {
        const d = new Date(s.completedAt);
        const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (daysAgo >= 0 && daysAgo < 7) {
          vol[6 - daysAgo] += s.weight * s.reps;
        }
      }
      setWeekVolume(vol);

      // Top exercises with 1RM sparkline (last 12 months)
      const exerciseNames = [...new Set(allSets.map(s => s.exerciseName))].slice(0, 8);
      const exOptions = exerciseNames.map(name => {
        const exSets = allSets.filter(s => s.exerciseName === name);
        // Monthly 1RM for last 12 months
        const monthlyMax = new Array(12).fill(0);
        for (const s of exSets) {
          const d = new Date(s.completedAt);
          const mAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
          if (mAgo >= 0 && mAgo < 12) {
            monthlyMax[11 - mAgo] = Math.max(monthlyMax[11 - mAgo], s.oneRepMax || calculate1RM(s.weight, s.reps));
          }
        }
        const best = Math.max(...exSets.map(s => s.oneRepMax || calculate1RM(s.weight, s.reps)));
        const prevBest = Math.max(...exSets.filter(s => {
          const d = new Date(s.completedAt);
          return (now.getTime() - d.getTime()) / 86400000 > 7;
        }).map(s => s.oneRepMax || calculate1RM(s.weight, s.reps)), 0);
        const delta = prevBest > 0 ? ((best - prevBest) / prevBest * 100).toFixed(0) : '—';
        return { name, best: Math.round(best), delta: delta !== '—' ? `+${delta}%` : '—', points: monthlyMax };
      });
      setExercises(exOptions);
      setLoading(false);
    }
    load();
  }, []);

  const totalWeekVolume = weekVolume.reduce((a, b) => a + b, 0);
  const maxVol = Math.max(...weekVolume, 1);
  const currentEx = exercises[exIdx];

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100dvh', paddingBottom: 110 }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Progression</div>
      </div>

      {/* Segmented toggle */}
      <div style={{ padding: '12px 20px 4px' }}>
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--color-bg-1)', borderRadius: 12, border: '1px solid var(--color-line)' }}>
          {(['stats', 'history'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: tab === t ? 'var(--color-bg-3)' : 'transparent',
              color: tab === t ? 'var(--color-ink)' : 'var(--color-ink-3)',
              border: 'none', cursor: 'pointer',
            }}>
              {t === 'stats' ? 'Stats' : 'Historique'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats tab */}
      {tab === 'stats' && (
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Week volume card */}
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>Volume cette semaine</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>
                  {(totalWeekVolume / 1000).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--color-ink-3)', marginLeft: 3 }}>tonnes</span>
                </div>
              </div>
              {totalWeekVolume > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-accent)', fontSize: 12, fontWeight: 700,
                  background: 'var(--color-accent-soft)', padding: '5px 10px', borderRadius: 999,
                }}>
                  <TrendingUp size={12} /> cette sem.
                </div>
              )}
            </div>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginTop: 18 }}>
              {weekVolume.map((v, i) => {
                const barH = (v / maxVol) * 80;
                const isToday = i === 6;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', height: `${barH}px`, minHeight: v > 0 ? 4 : 0,
                      background: isToday ? 'var(--color-accent)' : 'var(--color-bg-3)', borderRadius: 6,
                    }} />
                    <span style={{ fontSize: 10, color: isToday ? 'var(--color-ink-2)' : 'var(--color-ink-3)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {weekDays[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercise selector */}
          {exercises.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
                {exercises.map((e, i) => (
                  <button key={e.name} onClick={() => setExIdx(i)} style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 12,
                    background: exIdx === i ? 'var(--color-bg-3)' : 'var(--color-bg-1)',
                    border: `1px solid ${exIdx === i ? 'var(--color-line-2)' : 'var(--color-line)'}`,
                    color: exIdx === i ? 'var(--color-ink)' : 'var(--color-ink-2)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160,
                  }}>{e.name}</button>
                ))}
              </div>

              {/* 1RM card */}
              {currentEx && (
                <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>1RM estimé</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>
                        {currentEx.best}<span style={{ fontSize: 14, color: 'var(--color-ink-3)', marginLeft: 3 }}>kg</span>
                      </div>
                    </div>
                    {currentEx.delta !== '—' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-accent)', fontSize: 12, fontWeight: 700,
                        background: 'var(--color-accent-soft)', padding: '5px 10px', borderRadius: 999,
                      }}>
                        <TrendingUp size={12} /> {currentEx.delta}
                      </div>
                    )}
                  </div>
                  <Sparkline points={currentEx.points} />
                </div>
              )}
            </>
          )}

          {exercises.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-ink-4)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
              <p style={{ fontSize: 14, color: 'var(--color-ink-3)' }}>Lance ta première séance pour voir tes stats</p>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏋️</div>
              <p style={{ fontSize: 14, color: 'var(--color-ink-3)' }}>Aucune séance enregistrée</p>
            </div>
          ) : (
            history.map(w => (
              <Link key={w.id} href={`/history/${w.id}`} style={{
                background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 16,
                padding: 14, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--color-ink)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', marginTop: 3 }}>
                    {formatRelative(w.startedAt)}
                    {w.duration ? ` · ${w.duration}min` : ''}
                    {w.setCount > 0 ? ` · ${w.setCount} séries` : ''}
                    {w.volume > 0 ? ` · ${(w.volume / 1000).toFixed(1)}t` : ''}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-ink-4)" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
