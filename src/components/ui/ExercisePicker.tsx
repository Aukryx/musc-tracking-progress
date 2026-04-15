'use client';

import { useEffect, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { db, type Exercise } from '@/lib/db';

interface ExercisePickerProps {
  onSelect: (name: string) => void;
  onClose: () => void;
}

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    db.exercises.orderBy('name').toArray().then(setExercises);
  }, []);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const g = ex.muscleGroup;
    if (!acc[g]) acc[g] = [];
    acc[g].push(ex);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <h2 className="text-lg font-bold text-white flex-1">Choisir un exercice</h2>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            autoFocus
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-base"
          />
        </div>
      </div>

      {/* Custom exercise */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nom personnalisé..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-base"
          />
          <button
            onClick={() => {
              if (customName.trim()) {
                onSelect(customName.trim());
              }
            }}
            disabled={!customName.trim()}
            className="bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 rounded-xl font-bold transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groups).map(([group, exs]) => (
          <div key={group}>
            <div className="px-4 py-2 bg-zinc-900/60 sticky top-0">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                {group}
              </span>
            </div>
            {exs.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex.name)}
                className="w-full text-left px-4 py-4 border-b border-zinc-900 hover:bg-zinc-900 active:bg-zinc-800 transition-colors"
              >
                <div className="text-white font-medium">{ex.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{ex.category}</div>
              </button>
            ))}
          </div>
        ))}

        {filtered.length === 0 && query && (
          <div className="p-8 text-center text-zinc-500">
            <p>Aucun exercice trouvé.</p>
            <p className="text-sm mt-1">Utilisez le champ personnalisé ci-dessus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
