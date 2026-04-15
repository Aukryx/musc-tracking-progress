'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Dumbbell, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { db, type Template } from '@/lib/db';
import { generateId } from '@/lib/workout-store';

type TemplateExerciseInput = { id: string; name: string; sets: number };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<TemplateExerciseInput[]>([
    { id: generateId(), name: '', sets: 3 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.templates.orderBy('lastUsedAt').reverse().toArray().then((t) => {
      setTemplates(t);
      setLoading(false);
    });
  }, []);

  function addExercise() {
    setExercises((prev) => [...prev, { id: generateId(), name: '', sets: 3 }]);
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  function updateExercise(id: string, field: 'name' | 'sets', value: string | number) {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  async function saveTemplate() {
    const valid = exercises.filter((e) => e.name.trim());
    if (!name.trim() || valid.length === 0) return;

    const newTemplate: Omit<Template, 'id'> = {
      name: name.trim(),
      exercises: valid.map((e, i) => ({
        name: e.name.trim(),
        order: i,
        defaultSets: e.sets,
      })),
      createdAt: new Date(),
    };

    const id = await db.templates.add(newTemplate);
    const created = await db.templates.get(id);
    if (created) setTemplates((prev) => [created, ...prev]);

    setCreating(false);
    setName('');
    setExercises([{ id: generateId(), name: '', sets: 3 }]);
  }

  async function deleteTemplate(id: number) {
    if (!confirm('Supprimer ce template ?')) return;
    await db.templates.delete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-white">Templates</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <Plus size={16} />
            Créer
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {creating && (
        <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-4 mb-6 space-y-4">
          <h2 className="text-white font-bold">Nouveau template</h2>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du template (ex: Push, Pull, Legs...)"
            autoFocus
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-base"
          />

          <div className="space-y-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              Exercices
            </span>
            {exercises.map((ex, i) => (
              <div key={ex.id} className="flex items-center gap-2">
                <span className="text-zinc-600 text-sm w-4 text-center">{i + 1}</span>
                <input
                  type="text"
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                  placeholder="Nom de l'exercice"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
                />
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-2.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value) || 1)}
                    className="w-8 bg-transparent text-white text-center text-sm focus:outline-none"
                  />
                  <span className="text-zinc-500 text-xs">séries</span>
                </div>
                {exercises.length > 1 && (
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="text-zinc-600 hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addExercise}
              className="w-full py-2.5 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-400 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Ajouter un exercice
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setCreating(false);
                setName('');
                setExercises([{ id: generateId(), name: '', sets: 3 }]);
              }}
              className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-medium"
            >
              Annuler
            </button>
            <button
              onClick={saveTemplate}
              disabled={!name.trim() || !exercises.some((e) => e.name.trim())}
              className="flex-1 py-3 bg-green-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Liste des templates */}
      {templates.length === 0 && !creating ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <Dumbbell size={48} className="mb-4 opacity-30" />
          <p className="text-zinc-500 text-lg font-medium">Aucun template</p>
          <p className="text-sm mt-1">Créez des templates pour vos séances types</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Dumbbell size={18} className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold">{t.name}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    {t.exercises.length} exercices
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteTemplate(t.id!)}
                    className="text-zinc-600 hover:text-red-500 p-2 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Link
                    href={`/workout?template=${t.id}`}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-bold"
                  >
                    Démarrer
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="px-4 pb-4 space-y-1">
                {t.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-600 w-4 text-center">{i + 1}</span>
                    <span className="text-zinc-400 flex-1">{ex.name}</span>
                    <span className="text-zinc-600">{ex.defaultSets} séries</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
