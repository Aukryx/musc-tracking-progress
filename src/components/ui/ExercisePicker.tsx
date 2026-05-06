'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, X, Plus, Pin, Dumbbell } from 'lucide-react';
import { db, type Exercise } from '@/lib/db';
import ExerciseDetailSheet from './ExerciseDetailSheet';

interface ExercisePickerProps {
  onSelect: (name: string) => void;
  onClose: () => void;
}

const GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];
const GROUP_ORDER = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [recentNames, setRecentNames] = useState<string[]>([]);

  useEffect(() => {
    db.exercises.orderBy('name').toArray().then(setExercises);

    // Top 5 recently used exercises
    db.workoutSets
      .orderBy('completedAt')
      .reverse()
      .limit(100)
      .toArray()
      .then(sets => {
        const seen = new Set<string>();
        const recent: string[] = [];
        for (const s of sets) {
          if (!seen.has(s.exerciseName) && recent.length < 5) {
            seen.add(s.exerciseName);
            recent.push(s.exerciseName);
          }
        }
        setRecentNames(recent);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return exercises.filter(e => {
      const matchQ = !q || e.name.toLowerCase().includes(q);
      const matchG = activeGroup === 'All' || e.muscleGroup === activeGroup;
      return matchQ && matchG;
    });
  }, [exercises, query, activeGroup]);

  const recent = useMemo(() =>
    recentNames.flatMap(name => exercises.filter(e => e.name === name)).slice(0, 5),
    [exercises, recentNames]
  );
  const others = useMemo(() =>
    query ? filtered : filtered.filter(e => !recentNames.includes(e.name)),
    [filtered, recentNames, query]
  );

  if (detail) {
    return (
      <ExerciseDetailSheet
        exercise={detail}
        onClose={() => setDetail(null)}
        onSelect={() => { onSelect(detail.name); setDetail(null); }}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--color-line)', flexShrink: 0 }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--color-bg-2)', border: '1px solid var(--color-line)',
          display: 'grid', placeItems: 'center', color: 'var(--color-ink-2)', cursor: 'pointer',
        }}>
          <X size={16} />
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Choisir un exercice</div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 4px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--color-ink-3)" style={{ position: 'absolute', left: 12, top: 11, pointerEvents: 'none' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Rechercher dans ${exercises.length} exercices…`}
            autoFocus
            style={{
              width: '100%', background: 'var(--color-bg-1)', border: '1px solid var(--color-line)',
              borderRadius: 12, padding: '10px 14px 10px 36px', color: 'var(--color-ink)',
              fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Group chips */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }} className="no-scrollbar">
        {GROUPS.map(g => {
          const active = activeGroup === g;
          return (
            <button key={g} onClick={() => setActiveGroup(g)} style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 999,
              background: active ? 'var(--color-accent)' : 'var(--color-bg-1)',
              border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-line)'}`,
              color: active ? 'var(--color-accent-ink)' : 'var(--color-ink-2)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{g}</button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
        {/* Récents */}
        {!query && recent.length > 0 && (
          <>
            <div style={{ padding: '8px 20px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pin size={11} color="var(--color-ink-3)" />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>Récents</div>
            </div>
            {recent.map(ex => <ExerciseRow key={`r-${ex.id}`} ex={ex} onPick={() => onSelect(ex.name)} onDetail={() => setDetail(ex)} />)}
            <div style={{ height: 1, background: 'var(--color-line)', margin: '8px 16px' }} />
          </>
        )}

        {/* All */}
        <div style={{ padding: '8px 20px 6px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>Tous</div>
        </div>
        {others.map(ex => (
          <ExerciseRow key={ex.id} ex={ex} onPick={() => onSelect(ex.name)} onDetail={() => setDetail(ex)} />
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-3)', fontSize: 13 }}>
            Aucun exercice trouvé
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseRow({ ex, onPick, onDetail }: { ex: Exercise; onPick: () => void; onDetail: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
      {ex.gifUrl ? (
        <div style={{ paddingLeft: 16, paddingTop: 6, paddingBottom: 6, flexShrink: 0 }}>
          <Image src={ex.gifUrl} alt="" width={40} height={40} style={{ borderRadius: 10, objectFit: 'cover', background: 'var(--color-bg-2)' }} />
        </div>
      ) : (
        <div style={{ paddingLeft: 16, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-bg-2)', display: 'grid', placeItems: 'center' }}>
            <Dumbbell size={18} color="var(--color-ink-3)" />
          </div>
        </div>
      )}

      <button onClick={onPick} style={{
        flex: 1, textAlign: 'left', padding: '12px 12px', background: 'transparent', border: 'none',
        color: 'var(--color-ink)', cursor: 'pointer', minWidth: 0,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
        <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
          {ex.primaryMuscles.slice(0, 2).join(', ')}
          {ex.equipments?.length ? <span style={{ color: 'var(--color-ink-4)' }}> · {ex.equipments[0]}</span> : null}
        </div>
      </button>

      <button onClick={onDetail} style={{
        padding: '12px 16px', background: 'transparent', border: 'none',
        color: 'var(--color-ink-3)', cursor: 'pointer', flexShrink: 0,
      }}>
        <Plus size={18} />
      </button>
    </div>
  );
}
