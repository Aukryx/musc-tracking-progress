'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, X, Plus, Info } from 'lucide-react';
import { db, type Exercise } from '@/lib/db';
import ExerciseDetailSheet from './ExerciseDetailSheet';

interface ExercisePickerProps {
  onSelect: (name: string) => void;
  onClose: () => void;
}

const GROUP_ORDER = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Neck'];

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    db.exercises.orderBy('name').toArray().then(setExercises);
  }, []);

  const groups = useMemo(() => {
    return [...new Set(exercises.map((e) => e.muscleGroup))].sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a);
      const ib = GROUP_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase());
      const matchesGroup = !activeGroup || e.muscleGroup === activeGroup;
      return matchesQuery && matchesGroup;
    });
  }, [exercises, query, activeGroup]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
      const g = ex.muscleGroup;
      if (!acc[g]) acc[g] = [];
      acc[g].push(ex);
      return acc;
    }, {});
  }, [filtered]);

  const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a);
    const ib = GROUP_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  if (detail) {
    return (
      <ExerciseDetailSheet
        exercise={detail}
        onClose={() => setDetail(null)}
        onSelect={() => {
          onSelect(detail.name);
          setDetail(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800 shrink-0">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <h2 className="text-lg font-bold text-white flex-1">Choose exercise</h2>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            autoFocus
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-base"
          />
        </div>
      </div>

      {/* Group filter tabs */}
      {!query && (
        <div className="px-4 pb-2 shrink-0 overflow-x-auto">
          <div className="flex gap-2 w-max">
            <button
              onClick={() => setActiveGroup(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                !activeGroup ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(activeGroup === g ? null : g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeGroup === g ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom exercise */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Custom exercise…"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 text-sm"
          />
          <button
            onClick={() => { if (customName.trim()) onSelect(customName.trim()); }}
            disabled={!customName.trim()}
            className="bg-green-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 rounded-xl font-bold transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {sortedGroupKeys.map((group) => (
          <div key={group}>
            <div className="px-4 py-2 bg-zinc-900/80 sticky top-0 backdrop-blur-sm">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {group}
              </span>
              <span className="ml-2 text-xs text-zinc-600">
                {grouped[group].length}
              </span>
            </div>
            {grouped[group].map((ex) => (
              <div
                key={ex.id}
                className="flex items-center border-b border-zinc-900"
              >
                {/* GIF thumbnail */}
                {ex.gifUrl && (
                  <div className="pl-3 py-2 shrink-0">
                    <img
                      src={ex.gifUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-900"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Name + meta */}
                <button
                  onClick={() => onSelect(ex.name)}
                  className="flex-1 text-left px-3 py-3 hover:bg-zinc-900 active:bg-zinc-800 transition-colors min-w-0"
                >
                  <div className="text-white font-medium text-sm leading-tight">{ex.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {ex.category}
                    {ex.primaryMuscles?.length > 0 && (
                      <span className="ml-2 text-zinc-600">
                        · {ex.primaryMuscles.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </button>

                {/* Detail button */}
                <button
                  onClick={() => setDetail(ex)}
                  className="px-4 py-4 text-zinc-600 hover:text-blue-400 transition-colors shrink-0"
                >
                  <Info size={18} />
                </button>
              </div>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            <p>No exercises found.</p>
            <p className="text-sm mt-1">Use the custom field above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
