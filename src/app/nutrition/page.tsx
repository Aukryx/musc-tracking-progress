'use client';

import { useEffect, useState } from 'react';
import { Droplet, Flame, Check, TrendingUp, Plus } from 'lucide-react';
import { db, type Meal, type WaterLog } from '@/lib/db';

type Tab = 'today' | 'week' | 'insights';

const DEFAULT_GOAL = { kcal: 3400, proteinG: 200, carbsG: 415, fatsG: 104, fibersG: 30 };
const TODAY = new Date().toISOString().slice(0, 10);
const TODAY_LABEL = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());

function todayActivity(): string {
  const dow = new Date().getDay();
  const map: Record<number, string> = {
    0: 'Repos',
    1: 'Musculation',
    2: 'Boxe Thaï',
    3: 'Course (optionnelle)',
    4: 'Boxe Thaï',
    5: 'Repos',
    6: 'Musculation',
  };
  return map[dow] ?? 'Repos';
}

interface MacroBarProps { label: string; cur: number; tgt: number; hue: number }
function MacroBar({ label, cur, tgt, hue }: MacroBarProps) {
  const pct = Math.min(100, Math.round((cur / tgt) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)' }}>
          <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{cur}</span>/{tgt}<span style={{ color: 'var(--color-ink-4)' }}>g</span>
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--color-bg-3)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `oklch(0.78 0.16 ${hue})`, transition: 'width 0.5s', borderRadius: 999 }} />
      </div>
    </div>
  );
}

interface InsightCard { kind: 'good' | 'warn' | 'info'; icon: string; title: string; text: string }
const INSIGHTS: InsightCard[] = [
  { kind: 'good', icon: 'check', title: 'Protéines en avance', text: 'Tu es sur la bonne voie pour atteindre tes 200g de protéines. Continue !' },
  { kind: 'warn', icon: 'drop', title: 'Hydratation faible', text: 'Pense à boire davantage. Vise 3L par jour, +500ml les jours de sport.' },
  { kind: 'info', icon: 'flame', title: 'Pic glucides recommandé', text: 'En pré-séance, charge en glucides complexes 1h30 avant pour maximiser les perfs.' },
  { kind: 'good', icon: 'check', title: 'Créatine monohydrate', text: '5g par jour avec un repas. Le supplément le mieux documenté scientifiquement.' },
  { kind: 'warn', icon: 'flame', title: 'Répartis tes protéines', text: 'Vise 5 prises de 35-45g par repas pour optimiser la synthèse musculaire.' },
];

export default function NutritionPage() {
  const [tab, setTab] = useState<Tab>('today');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterDoses, setWaterDoses] = useState(0);
  const [loading, setLoading] = useState(true);

  // Totaux du jour (depuis les repas)
  const totalKcal = 0; // No food DB entries yet — would sum meal items
  const goal = DEFAULT_GOAL;

  useEffect(() => {
    async function load() {
      const [todayMeals, waterLog] = await Promise.all([
        db.meals.where('date').equals(TODAY).toArray(),
        db.waterLogs.where('date').equals(TODAY).first(),
      ]);
      setMeals(todayMeals);
      setWaterDoses(waterLog?.doses ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleWaterDose(doseIndex: number) {
    const newDoses = doseIndex < waterDoses ? doseIndex : doseIndex + 1;
    setWaterDoses(newDoses);
    const existing = await db.waterLogs.where('date').equals(TODAY).first();
    if (existing?.id) {
      await db.waterLogs.update(existing.id, { doses: newDoses });
    } else {
      await db.waterLogs.add({ date: TODAY, doses: newDoses });
    }
  }

  // Calorie ring
  const pct = Math.min(100, Math.round((totalKcal / goal.kcal) * 100));
  const ringR = 56;
  const ringC = 2 * Math.PI * ringR;
  const ringOff = ringC - (pct / 100) * ringC;
  const remaining = Math.max(0, goal.kcal - totalKcal);

  if (loading) {
    return <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }} />;
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100dvh', paddingBottom: 110 }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Nutrition</div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 2, textTransform: 'capitalize' }}>
            {TODAY_LABEL} · <span style={{ color: 'var(--color-accent)' }}>{todayActivity()}</span>
          </div>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 12, background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
          border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: '0 6px 16px -6px oklch(0.86 0.20 130 / 0.6)',
        }}>
          <Plus size={18} />
        </button>
      </div>

      {/* Tab toggle */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--color-bg-1)', borderRadius: 12, border: '1px solid var(--color-line)' }}>
          {([['today', "Aujourd'hui"], ['week', 'Semaine'], ['insights', 'Conseils']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: '7px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              background: tab === k ? 'var(--color-bg-3)' : 'transparent',
              color: tab === k ? 'var(--color-ink)' : 'var(--color-ink-3)',
              border: 'none', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Aujourd'hui ── */}
      {tab === 'today' && (
        <>
          {/* Calorie ring card */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 22, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <svg width="128" height="128" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                  <circle cx="80" cy="80" r={ringR} fill="none" stroke="var(--color-bg-3)" strokeWidth="11" />
                  <circle cx="80" cy="80" r={ringR} fill="none" stroke="var(--color-accent)" strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={ringC}
                    strokeDashoffset={ringOff}
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease-out' }} />
                  <text x="80" y="74" textAnchor="middle" fill="var(--color-ink-3)" fontSize="10" fontWeight="700" letterSpacing="2">RESTE</text>
                  <text x="80" y="100" textAnchor="middle" fill="var(--color-ink)" fontSize="28" fontWeight="800"
                    fontFamily="var(--font-mono)" letterSpacing="-1">{remaining}</text>
                </svg>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 500 }}>Objectif</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>{goal.kcal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 500 }}>Mangé</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'oklch(0.82 0.16 130)' }}>−{totalKcal}</span>
                  </div>
                </div>
              </div>
              {/* Macros */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MacroBar label="Protéines" hue={130} cur={0} tgt={goal.proteinG} />
                <MacroBar label="Glucides" hue={75} cur={0} tgt={goal.carbsG} />
                <MacroBar label="Lipides" hue={40} cur={0} tgt={goal.fatsG} />
                <MacroBar label="Fibres" hue={170} cur={0} tgt={goal.fibersG} />
              </div>
            </div>
          </div>

          {/* Hydratation */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Droplet size={16} color="oklch(0.78 0.14 230)" />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-2)' }}>Hydratation</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>
                  {(waterDoses * 0.25).toFixed(2).replace(/\.?0+$/, '')}
                  <span style={{ color: 'var(--color-ink-3)', fontSize: 11 }}>/3L</span>
                </div>
              </div>
              {/* 12 doses */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const filled = i < waterDoses;
                  return (
                    <button key={i} onClick={() => toggleWaterDose(i)} style={{
                      height: 28, borderRadius: 5, border: 'none', cursor: 'pointer',
                      background: filled ? 'oklch(0.78 0.14 230)' : 'var(--color-bg-3)',
                      opacity: filled ? 1 : 0.5,
                      transition: 'background 0.15s, opacity 0.15s',
                    }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[250, 500].map(ml => (
                  <button key={ml} onClick={() => toggleWaterDose(waterDoses + Math.round(ml / 250) - 1)} style={{
                    flex: 1, padding: 8, borderRadius: 10, background: 'var(--color-bg-2)',
                    border: '1px solid var(--color-line-2)', color: 'var(--color-ink-2)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>+{ml}ml</button>
                ))}
              </div>
            </div>
          </div>

          {/* Repas du jour */}
          <div style={{ padding: '18px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>Repas du jour</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)' }}>
                {meals.filter(m => m.done).length}/{meals.length}
              </span>
            </div>
            {meals.length === 0 ? (
              <div style={{
                background: 'var(--color-bg-1)', border: '1px dashed var(--color-line)', borderRadius: 14,
                padding: 24, textAlign: 'center', color: 'var(--color-ink-4)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🥗</div>
                <p style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>Ajoute ton premier repas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {meals.map(m => (
                  <div key={m.id} style={{
                    background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 14,
                    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                    opacity: m.done ? 0.6 : 1,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 600, width: 38, flexShrink: 0 }}>
                      {m.time}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, textDecoration: m.done ? 'line-through' : 'none' }}>{m.name}</span>
                        {m.done && <Check size={12} color="var(--color-accent)" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Semaine ── */}
      {tab === 'week' && (
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 4 }}>
              Calories — 7 derniers jours
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              —<span style={{ fontSize: 13, color: 'var(--color-ink-3)', marginLeft: 4 }}>kcal/j moy.</span>
            </div>
            <div style={{ marginTop: 18, padding: '24px 0', textAlign: 'center', color: 'var(--color-ink-4)', fontSize: 12 }}>
              Les données s&apos;afficheront quand tu enregistreras des repas
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 12 }}>Moyennes hebdo</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ l: 'Protéines', hue: 130 }, { l: 'Glucides', hue: 75 }, { l: 'Lipides', hue: 40 }].map(x => (
                <div key={x.l} style={{ flex: 1, padding: 12, background: 'var(--color-bg-2)', borderRadius: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: `oklch(0.82 0.16 ${x.hue})` }}>
                    —<span style={{ fontSize: 10, color: 'var(--color-ink-3)', marginLeft: 1 }}>g</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-3)', marginTop: 4, fontWeight: 500 }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(180deg, rgba(180,255,80,0.08), rgba(180,255,80,0.01))',
            border: '1px solid rgba(180,255,80,0.15)', borderRadius: 18, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Flame size={22} color="var(--color-accent)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Objectif protéines</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>{goal.proteinG}g/j · {(goal.proteinG / 77).toFixed(1)}g/kg</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Conseils ── */}
      {tab === 'insights' && (
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {INSIGHTS.map((ins, i) => {
            const tone = ins.kind === 'good' ? 'var(--color-accent)' : ins.kind === 'warn' ? 'var(--color-warn)' : 'oklch(0.78 0.14 230)';
            return (
              <div key={i} style={{
                background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 16, padding: 14,
                display: 'flex', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: ins.kind === 'good' ? 'var(--color-accent-soft)' : ins.kind === 'warn' ? 'oklch(0.78 0.18 60 / 0.14)' : 'oklch(0.78 0.14 230 / 0.14)',
                }}>
                  {ins.icon === 'check' && <Check size={16} color={tone} />}
                  {ins.icon === 'flame' && <Flame size={16} color={tone} />}
                  {ins.icon === 'drop' && <Droplet size={16} color={tone} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{ins.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-2)', marginTop: 4, lineHeight: 1.4 }}>{ins.text}</div>
                </div>
              </div>
            );
          })}

          {/* Objectifs */}
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-line)', borderRadius: 16, padding: 16, marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 12 }}>Tes objectifs</div>
            {[
              { l: 'Calories', v: `${goal.kcal} kcal/j` },
              { l: 'Protéines', v: `${goal.proteinG}g/j` },
              { l: 'Glucides', v: `${goal.carbsG}g/j` },
              { l: 'Lipides', v: `${goal.fatsG}g/j` },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 13,
                paddingBottom: i < arr.length - 1 ? 10 : 0,
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-line)' : 'none',
                marginBottom: i < arr.length - 1 ? 10 : 0,
              }}>
                <span style={{ color: 'var(--color-ink-3)' }}>{row.l}</span>
                <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
