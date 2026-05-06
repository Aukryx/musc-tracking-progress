'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Flame, Zap, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { db, type Template, type Workout, needsExerciseDBSeed, markExerciseDBSeeded } from '@/lib/db';
import { seedFromExerciseDB } from '@/lib/exercisedb';
import { sessionDuration } from '@/lib/calculations';

function computeStreak(workouts: Workout[]): number {
  if (!workouts.length) return 0;
  const dateKeys = new Set(
    workouts.map(w => {
      const d = new Date(w.startedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (dateKeys.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function sessionsThisWeek(workouts: Workout[]): number {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return workouts.filter(w => new Date(w.startedAt) >= monday).length;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(date));
}

function todayLabel(): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date());
}

export default function DashboardPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [lastWorkout, setLastWorkout] = useState<(Workout & { setCount: number; volume: number }) | null>(null);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalSets: 0, streak: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncPct, setSyncPct] = useState(0);

  useEffect(() => {
    async function init() {
      if (needsExerciseDBSeed()) {
        setSyncing(true);
        await seedFromExerciseDB((loaded, total) => setSyncPct(Math.round((loaded / total) * 100)));
        markExerciseDBSeeded();
        setSyncing(false);
      }
      await load();
    }

    async function load() {
      const [workouts, tmpl, totalSets] = await Promise.all([
        db.workouts.orderBy('startedAt').reverse().toArray(),
        db.templates.orderBy('lastUsedAt').reverse().limit(3).toArray(),
        db.workoutSets.count(),
      ]);

      const streak = computeStreak(workouts);
      const thisWeek = sessionsThisWeek(workouts);

      if (workouts.length > 0) {
        const w = workouts[0];
        const sets = await db.workoutSets.where('workoutId').equals(w.id!).toArray();
        setLastWorkout({
          ...w,
          setCount: sets.length,
          volume: sets.reduce((a, s) => a + s.weight * s.reps, 0),
        });
      }

      setTemplates(tmpl);
      setStats({ totalWorkouts: workouts.length, totalSets, streak, thisWeek });
      setLoading(false);
    }

    init();
  }, []);

  if (syncing) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '0 32px', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Chargement des exercices</div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>{syncPct}%</div>
        </div>
        <div style={{ width: '100%', maxWidth: 260, height: 4, background: 'var(--color-bg-2)', borderRadius: 999 }}>
          <div style={{ height: '100%', background: 'var(--color-accent)', borderRadius: 999, width: `${syncPct}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>Premier lancement seulement</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100dvh', paddingBottom: 110 }} className="no-scrollbar">

      {/* Header */}
      <div style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-3)', fontWeight: 500, textTransform: 'capitalize' }}>{todayLabel()}</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>Salut.</div>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 12, border: '1px solid var(--color-line)',
          background: 'transparent', display: 'grid', placeItems: 'center', color: 'var(--color-ink-2)', cursor: 'pointer',
        }}>
          <Settings size={18} />
        </button>
      </div>

      {/* Streak banner */}
      {stats.streak > 0 && (
        <div style={{
          margin: '8px 20px 18px',
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(180,255,80,0.1), rgba(180,255,80,0.02))',
          border: '1px solid rgba(180,255,80,0.2)',
          borderRadius: 14, padding: '10px 14px',
        }}>
          <Flame size={18} color="var(--color-accent)" />
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', fontWeight: 500 }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 700 }}>{stats.streak} jour{stats.streak > 1 ? 's' : ''}</span> de série
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
            {stats.thisWeek}/5 cette semaine
          </div>
        </div>
      )}

      {/* Section démarrer */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 10 }}>Démarrer</div>

        {templates.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => router.push(`/workout?template=${t.id}`)}
                style={{
                  background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18,
                  padding: '14px 12px', textAlign: 'left', color: 'var(--color-ink)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 9, background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
                }}>
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {t.exercises.length} ex.
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push('/workout')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            background: 'var(--color-accent)', color: 'var(--color-accent-ink)', border: 'none',
            borderRadius: 18, padding: '16px 18px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 10px 30px -10px oklch(0.86 0.20 130 / 0.5)',
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,0,0,0.18)', display: 'grid', placeItems: 'center' }}>
            <Zap size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div>Séance vide</div>
            <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>Tu choisis tes exercices</div>
          </div>
          <ArrowRight size={20} style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      {/* Dernière séance */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>Dernière séance</div>
          <Link href="/progress" style={{
            color: 'var(--color-ink-3)', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none',
          }}>Tout voir <ChevronRight size={12} /></Link>
        </div>

        {lastWorkout ? (
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{lastWorkout.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>{formatRelativeDate(lastWorkout.startedAt)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-line)' }}>
              {lastWorkout.finishedAt && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>
                    {sessionDuration(lastWorkout.startedAt, lastWorkout.finishedAt as Date)}
                    <span style={{ fontSize: 11, color: 'var(--color-ink-3)', marginLeft: 2 }}>min</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-3)', marginTop: 2 }}>Durée</div>
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{lastWorkout.setCount}</div>
                <div style={{ fontSize: 10, color: 'var(--color-ink-3)', marginTop: 2 }}>Séries</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>
                  {(lastWorkout.volume / 1000).toFixed(1)}
                  <span style={{ fontSize: 11, color: 'var(--color-ink-3)', marginLeft: 2 }}>t</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-ink-3)', marginTop: 2 }}>Volume</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 20, padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Aucune séance pour l&apos;instant</div>
          </div>
        )}
      </div>

      {/* Stats globales */}
      <div style={{ padding: '18px 20px 0', display: 'flex', gap: 8 }}>
        <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 14, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {stats.totalWorkouts}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 6, fontWeight: 500 }}>Séances</div>
        </div>
        <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 14, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--color-accent)' }}>
            {stats.totalSets}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 6, fontWeight: 500 }}>Séries</div>
        </div>
      </div>
    </div>
  );
}
