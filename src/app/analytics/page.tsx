'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDateShort, format1RM } from '@/lib/calculations';

interface DataPoint {
  date: string;
  oneRepMax: number;
  weight: number;
  reps: number;
  rawDate: Date;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: DataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-zinc-400">{d.date}</p>
      <p className="text-white font-bold mt-1">1RM: {format1RM(d.oneRepMax)}</p>
      <p className="text-zinc-400 text-xs mt-0.5">
        {d.weight} kg × {d.reps} reps
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [data, setData] = useState<DataPoint[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les noms d'exercices avec historique
  useEffect(() => {
    async function load() {
      const sets = await db.workoutSets.toArray();
      const names = [...new Set(sets.map((s) => s.exerciseName))].sort();
      setExerciseNames(names);
      if (names.length > 0) setSelected(names[0]);
      setLoading(false);
    }
    load();
  }, []);

  // Charger les données pour l'exercice sélectionné
  useEffect(() => {
    if (!selected) return;

    async function load() {
      const sets = await db.workoutSets
        .where('exerciseName')
        .equals(selected)
        .sortBy('completedAt');

      // Grouper par séance (workoutId) et prendre le best 1RM de chaque séance
      const byWorkout = new Map<number, typeof sets[number]>();
      for (const set of sets) {
        const existing = byWorkout.get(set.workoutId);
        if (!existing || set.oneRepMax > existing.oneRepMax) {
          byWorkout.set(set.workoutId, set);
        }
      }

      const points: DataPoint[] = [...byWorkout.values()].map((s) => ({
        date: formatDateShort(s.completedAt),
        oneRepMax: s.oneRepMax,
        weight: s.weight,
        reps: s.reps,
        rawDate: s.completedAt,
      }));

      setData(points);
    }

    load();
  }, [selected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxOneRM = data.length > 0 ? Math.max(...data.map((d) => d.oneRepMax)) : 0;
  const latestOneRM = data.length > 0 ? data[data.length - 1].oneRepMax : 0;
  const firstOneRM = data.length > 0 ? data[0].oneRepMax : 0;
  const progression =
    firstOneRM > 0 ? (((latestOneRM - firstOneRM) / firstOneRM) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-black px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-white">Analytics</h1>
        <TrendingUp size={22} className="text-blue-400" />
      </div>

      {exerciseNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <TrendingUp size={48} className="mb-4 opacity-30" />
          <p className="text-zinc-500 text-lg font-medium">Aucune donnée</p>
          <p className="text-sm mt-1 text-center">
            Effectuez des séances pour voir votre progression
          </p>
        </div>
      ) : (
        <>
          {/* Sélecteur d'exercice */}
          <div className="relative mb-6">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-4 text-white font-bold text-base"
            >
              <span className="truncate">{selected || 'Choisir un exercice'}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 ml-2 text-zinc-400 transition-transform ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                {exerciseNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelected(name);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3.5 border-b border-zinc-800 last:border-0 transition-colors ${
                      name === selected
                        ? 'text-blue-400 font-bold bg-blue-950/30'
                        : 'text-white hover:bg-zinc-800'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stat cards */}
          {data.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-yellow-400">{format1RM(maxOneRM)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Best 1RM</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-white">{format1RM(latestOneRM)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Dernier</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
                <div
                  className={`text-lg font-black ${
                    parseFloat(progression) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {parseFloat(progression) >= 0 ? '+' : ''}
                  {progression}%
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Progression</div>
              </div>
            </div>
          )}

          {/* Graphique */}
          {data.length >= 2 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-zinc-400 mb-4">
                Évolution du 1RM estimé
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v: number) => `${v}kg`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="oneRepMax"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                    activeDot={{ fill: '#60a5fa', r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : data.length === 1 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500">
              <p>1 séance enregistrée</p>
              <p className="text-sm mt-1">Ajoutez plus de séances pour voir la courbe</p>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500">
              <p>Aucune donnée pour cet exercice</p>
            </div>
          )}

          {/* Tableau des séances */}
          {data.length > 0 && (
            <div className="mt-4 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-400">Historique des best</h2>
              </div>
              {[...data].reverse().slice(0, 10).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 last:border-0"
                >
                  <span className="text-zinc-500 text-sm w-12">{d.date}</span>
                  <span className="flex-1 text-white font-bold">{format1RM(d.oneRepMax)}</span>
                  <span className="text-zinc-500 text-sm">
                    {d.weight}kg × {d.reps}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
