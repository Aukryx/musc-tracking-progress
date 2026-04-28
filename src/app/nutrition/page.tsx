'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'calories' | 'sport' | 'planning' | 'repas' | 'conseils';

interface Macros { p: number; g: number; l: number }
interface Meal { name: string; kcal: number; detail: string; macros: Macros }
interface DayPlan {
  id: string;
  abbr: string;
  name: string;
  type: string;
  kcal: string;
  dotColor: string;
  kcalColor: string;
  meals: Meal[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DAYS: DayPlan[] = [
  {
    id: 'lun', abbr: 'LUN', name: 'Lundi', type: '🏋️ Salle de musculation',
    kcal: '3 500 kcal', dotColor: 'bg-blue-600/20 text-blue-400', kcalColor: 'text-blue-400',
    meals: [
      { name: 'Petit-déjeuner', kcal: 750, detail: 'Flocons d\'avoine 100g · Whey vanille 30g · Banane · Beurre de cacahuète 20g · Lait demi-écrémé', macros: { p: 42, g: 80, l: 16 } },
      { name: 'Collation matin', kcal: 300, detail: 'Yaourt grec 200g · Myrtilles · Amandes 25g', macros: { p: 22, g: 22, l: 12 } },
      { name: 'Déjeuner', kcal: 850, detail: 'Poulet grillé 220g · Riz basmati 160g (cru) · Brocolis · Huile d\'olive 15ml', macros: { p: 52, g: 85, l: 14 } },
      { name: 'Pré-séance (2h avant)', kcal: 450, detail: 'Pain complet 2 tranches · Œufs durs 2 · Fromage blanc 100g · Pomme', macros: { p: 28, g: 55, l: 10 } },
      { name: 'Post-séance', kcal: 200, detail: 'Shake : Whey 40g + lait demi-écrémé + 1 banane', macros: { p: 45, g: 35, l: 4 } },
      { name: 'Dîner', kcal: 950, detail: 'Saumon 200g · Patate douce 220g · Haricots verts · Avocat demi · Citron', macros: { p: 42, g: 60, l: 26 } },
    ],
  },
  {
    id: 'mar', abbr: 'MAR', name: 'Mardi', type: '🥊 Boxe Thaï',
    kcal: '3 700 kcal', dotColor: 'bg-red-500/20 text-red-400', kcalColor: 'text-red-400',
    meals: [
      { name: 'Petit-déjeuner', kcal: 800, detail: 'Omelette 4 œufs · Fromage râpé 30g · Pain complet 2 tr. · Jus d\'orange 200ml', macros: { p: 38, g: 60, l: 24 } },
      { name: 'Collation matin', kcal: 400, detail: 'Shake maison : lait entier 300ml · Whey 30g · Flocons avoine 50g · Cacao', macros: { p: 38, g: 55, l: 10 } },
      { name: 'Déjeuner', kcal: 900, detail: 'Bœuf haché 5% 220g · Pâtes complètes 140g (cru) · Sauce tomate · Parmesan 20g', macros: { p: 55, g: 95, l: 16 } },
      { name: 'Pré-boxe (2h avant)', kcal: 500, detail: 'Riz blanc 120g (cru) · Thon 150g · Légumes vapeur · Pain de riz', macros: { p: 38, g: 70, l: 4 } },
      { name: 'Post-boxe', kcal: 250, detail: 'Whey 40g · Lait demi-écrémé 200ml · 2 dattes · Eau de coco', macros: { p: 42, g: 30, l: 4 } },
      { name: 'Dîner', kcal: 850, detail: 'Poulet rôti 220g · Quinoa 120g (cru) · Épinards sautés ail · Huile olive · Féta 30g', macros: { p: 55, g: 65, l: 18 } },
    ],
  },
  {
    id: 'mer', abbr: 'MER', name: 'Mercredi', type: '🏃 Course (optionnelle) ou repos',
    kcal: '3 100–3 250', dotColor: 'bg-emerald-500/20 text-emerald-400', kcalColor: 'text-emerald-400',
    meals: [
      { name: 'Petit-déjeuner', kcal: 700, detail: 'Pancakes protéinés : whey 40g + œuf + flocons · Myrtilles · Sirop érable', macros: { p: 42, g: 70, l: 12 } },
      { name: 'Déjeuner', kcal: 800, detail: 'Dinde 220g · Lentilles vertes 160g (cuit) · Courgettes grillées · Féta 30g', macros: { p: 55, g: 65, l: 14 } },
      { name: 'Collation (si course)', kcal: 300, detail: 'Pain de riz · Beurre d\'amande 25g · Banane. Sauter si repos.', macros: { p: 8, g: 45, l: 10 } },
      { name: 'Dîner', kcal: 950, detail: 'Cabillaud 220g · Pommes de terre 260g · Ratatouille · Huile olive · Yaourt grec', macros: { p: 45, g: 75, l: 18 } },
      { name: 'Collation soir', kcal: 200, detail: 'Skyr 200g · Graines de chia · Miel', macros: { p: 22, g: 18, l: 3 } },
    ],
  },
  {
    id: 'jeu', abbr: 'JEU', name: 'Jeudi', type: '🥊 Boxe Thaï',
    kcal: '3 700 kcal', dotColor: 'bg-red-500/20 text-red-400', kcalColor: 'text-red-400',
    meals: [
      { name: 'Petit-déjeuner', kcal: 780, detail: 'Bowl : Skyr 200g · Muesli 60g · Banane · Noix 20g · Miel', macros: { p: 32, g: 85, l: 14 } },
      { name: 'Collation', kcal: 400, detail: 'Shake : lait 300ml · Whey 30g · Flocons 50g · Cacao · Banane', macros: { p: 38, g: 60, l: 10 } },
      { name: 'Déjeuner', kcal: 850, detail: 'Poulet 220g · Riz complet 150g (cru) · Brocolis · Sauce soja · Œuf dur', macros: { p: 55, g: 80, l: 12 } },
      { name: 'Pré-boxe (2h avant)', kcal: 500, detail: 'Riz blanc + thon + légumes vapeur (idem mardi)', macros: { p: 38, g: 70, l: 4 } },
      { name: 'Post-boxe + dîner', kcal: 900, detail: 'Steak bœuf 220g · Patate douce 240g · Salade · Avocat · Vinaigrette', macros: { p: 48, g: 65, l: 22 } },
    ],
  },
  {
    id: 'ven', abbr: 'VEN', name: 'Vendredi', type: '😴 Repos — récupération',
    kcal: '3 100 kcal', dotColor: 'bg-zinc-600/30 text-zinc-400', kcalColor: 'text-zinc-400',
    meals: [
      { name: 'Petit-déjeuner', kcal: 650, detail: 'Œufs brouillés 3 · Pain complet 2 tr. · Fromage blanc 150g · Fruits rouges', macros: { p: 38, g: 50, l: 18 } },
      { name: 'Collation', kcal: 300, detail: 'Cottage cheese 200g · Kiwi · Graines de chia · Miel', macros: { p: 24, g: 22, l: 6 } },
      { name: 'Déjeuner', kcal: 800, detail: 'Thon 200g · Pâtes complètes 130g (cru) · Salade · Tomates · Huile olive', macros: { p: 52, g: 80, l: 14 } },
      { name: 'Dîner', kcal: 1000, detail: 'Saumon fumé 120g · Pâtes complètes 120g · Crème légère · Épinards · Citron', macros: { p: 42, g: 65, l: 28 } },
      { name: 'Collation soir', kcal: 200, detail: 'Caséine 30g ou Skyr 200g · Graines de lin', macros: { p: 24, g: 8, l: 4 } },
    ],
  },
  {
    id: 'sam', abbr: 'SAM', name: 'Samedi', type: '🏋️ Salle + 🏀 Basket (si dispo)',
    kcal: '3 500–3 800', dotColor: 'bg-blue-600/20 text-blue-400', kcalColor: 'text-blue-400',
    meals: [
      { name: 'Petit-déjeuner', kcal: 800, detail: 'Flocons d\'avoine 100g · Whey 30g · Lait entier 300ml · Beurre de cacahuète 25g · Banane', macros: { p: 48, g: 88, l: 18 } },
      { name: 'Déjeuner', kcal: 900, detail: 'Steak bœuf 220g · Riz basmati 160g (cru) · Légumes grillés · Fromage · Huile', macros: { p: 52, g: 88, l: 18 } },
      { name: 'Pré-séance', kcal: 400, detail: 'Pain de riz · Beurre d\'amande · 3 dattes · Whey 30g', macros: { p: 35, g: 52, l: 8 } },
      { name: 'Post-séance', kcal: 250, detail: 'Shake whey 40g · Lait 200ml · Banane. Si basket aussi : +150 kcal.', macros: { p: 45, g: 35, l: 4 } },
      { name: 'Dîner', kcal: 950, detail: 'Poulet 220g · Wok nouilles soba · Légumes variés · Huile sésame · Sauce soja', macros: { p: 50, g: 70, l: 20 } },
    ],
  },
  {
    id: 'dim', abbr: 'DIM', name: 'Dimanche', type: '😴 Repos ou 🏃 Course légère',
    kcal: '3 100–3 250', dotColor: 'bg-zinc-600/30 text-zinc-400', kcalColor: 'text-zinc-400',
    meals: [
      { name: 'Brunch', kcal: 900, detail: 'Œufs brouillés 4 · Avocat · Saumon fumé 100g · Pain complet · Fromage blanc', macros: { p: 52, g: 45, l: 30 } },
      { name: 'Collation (si course)', kcal: 250, detail: 'Banane + beurre de cacahuète 20g + fromage blanc. Sauter si repos total.', macros: { p: 14, g: 30, l: 8 } },
      { name: 'Déjeuner', kcal: 850, detail: 'Poulet rôti 220g · Lentilles coral 150g (cru) · Épices curcuma-cumin · Riz', macros: { p: 55, g: 70, l: 12 } },
      { name: 'Dîner léger', kcal: 700, detail: 'Soupe de légumes · Œufs pochés 3 · Pain complet · Fromage blanc', macros: { p: 38, g: 50, l: 16 } },
      { name: 'Collation soir', kcal: 200, detail: 'Caséine 30g · Lait · Graines de chia', macros: { p: 25, g: 10, l: 4 } },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MacroBadges({ m }: { m: Macros }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">P: {m.p}g</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">G: {m.g}g</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">L: {m.l}g</span>
    </div>
  );
}

function MacroBar({ label, grams, kcal, pct, color }: { label: string; grams: number; kcal: number; pct: number; color: string }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1.5">
        <span className={`font-medium ${color}`}>{label}</span>
        <span className="text-zinc-500">{grams}g · {kcal} kcal · {pct}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TipCard({ title, text, variant = 'default' }: { title: string; text: string; variant?: 'default' | 'warning' | 'info' }) {
  const border = variant === 'warning' ? 'border-l-orange-500' : variant === 'info' ? 'border-l-blue-500' : 'border-l-zinc-600';
  return (
    <div className={`bg-zinc-900 border border-zinc-800 border-l-2 ${border} rounded-r-2xl rounded-l-none px-4 py-4 mb-3`}>
      <div className="text-white font-semibold text-sm mb-1">{title}</div>
      <div className="text-zinc-400 text-sm leading-relaxed">{text}</div>
    </div>
  );
}

function DayCard({ day }: { day: DayPlan }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-left touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${day.dotColor}`}>
            {day.abbr}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{day.name}</div>
            <div className="text-zinc-500 text-xs mt-0.5">{day.type}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-semibold ${day.kcalColor}`}>{day.kcal}</span>
          <ChevronDown
            size={16}
            className={`text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {day.meals.map((meal, i) => (
            <div key={i} className="pt-3 border-t border-zinc-800">
              <div className="flex justify-between items-start">
                <span className="text-white text-sm font-medium">{meal.name}</span>
                <span className="text-blue-400 text-xs font-semibold ml-2 shrink-0">{meal.kcal} kcal</span>
              </div>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{meal.detail}</p>
              <MacroBadges m={meal.macros} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab contents ─────────────────────────────────────────────────────────────

function TabCalories() {
  return (
    <div className="space-y-4">
      {/* Surplus card */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-400/70 font-semibold uppercase tracking-widest mb-1">Objectif journalier</div>
          <div className="text-4xl font-black text-blue-400 tracking-tight">3 400</div>
          <div className="text-zinc-500 text-xs mt-1">kcal / jour · lean bulk</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500 mb-1">surplus</div>
          <div className="text-2xl font-bold text-blue-400">+300</div>
          <div className="text-xs text-zinc-500">kcal/j</div>
        </div>
      </div>

      {/* BMR / TDEE grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xl font-bold text-white">1 936 <span className="text-sm font-normal text-zinc-500">kcal</span></div>
          <div className="text-xs text-zinc-500 mt-1">Métabolisme de base</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xl font-bold text-white">3 100 <span className="text-sm font-normal text-zinc-500">kcal</span></div>
          <div className="text-xs text-zinc-500 mt-1">Dépense totale (TDEE)</div>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Macronutriments · 3 400 kcal</div>
        <MacroBar label="Protéines" grams={200} kcal={800} pct={24} color="text-emerald-400" />
        <MacroBar label="Glucides" grams={415} kcal={1660} pct={49} color="text-amber-400" />
        <MacroBar label="Lipides" grams={104} kcal={940} pct={27} color="text-orange-400" />
        <div className="bg-zinc-800/60 rounded-xl p-3 text-xs text-zinc-400 leading-relaxed mt-1">
          <span className="text-zinc-200 font-medium">Méthode :</span> Harris-Benedict révisée · Facteur activité <span className="text-zinc-200">1.6</span> (très actif) · Surplus <span className="text-zinc-200">+300 kcal</span> · Protéines : <span className="text-zinc-200">2.6 g/kg</span>
        </div>
      </div>

      {/* Répartition */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Répartition journalière</div>
        {[
          { name: 'Petit-déjeuner', kcal: '~750 kcal', note: 'Le plus copieux — prépare ta journée' },
          { name: 'Collation matin', kcal: '~350 kcal', note: 'Protéines + glucides rapides' },
          { name: 'Déjeuner', kcal: '~850 kcal', note: 'Repas équilibré complet' },
          { name: 'Collation / pré-séance', kcal: '~450 kcal', note: 'Glucides complexes si séance le soir' },
          { name: 'Dîner', kcal: '~1 000 kcal', note: 'Post-entraînement ou repas récupération' },
        ].map((r, i) => (
          <div key={i} className={`flex justify-between items-start py-3 ${i > 0 ? 'border-t border-zinc-800' : ''}`}>
            <div>
              <div className="text-white text-sm font-medium">{r.name}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{r.note}</div>
            </div>
            <span className="text-blue-400 text-sm font-semibold ml-3 shrink-0">{r.kcal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabSport() {
  const schedule = [
    { day: 'Lundi', sport: '🏋️ Salle de muscu', extra: '+200 kcal', extraColor: 'text-blue-400', note: 'Charge glucidique élevée avant séance. Post-séance : whey + glucides rapides.' },
    { day: 'Mardi', sport: '🥊 Boxe Thaï', extra: '+400 kcal', extraColor: 'text-red-400', note: 'Sport très intense — augmente tes glucides. Repas pré-cours 2h avant. Bonne hydratation.' },
    { day: 'Mercredi', sport: '🏃 Course (optionnelle)', extra: '+150 kcal', extraColor: 'text-emerald-400', note: 'Si tu cours : ajoute une collation glucidique légère. Sinon : repas de récupération standard.' },
    { day: 'Jeudi', sport: '🥊 Boxe Thaï', extra: '+400 kcal', extraColor: 'text-red-400', note: 'Idem mardi. Les deux jours de boxe sont tes séances les plus énergivores.' },
    { day: 'Vendredi', sport: '😴 Repos', extra: 'Base', extraColor: 'text-zinc-500', note: 'Réduction des glucides. Maintien des protéines. Favorise la récupération musculaire.' },
    { day: 'Sam/Dim', sport: '🏋️ Salle + 🏀 Basket', extra: '+200-300 kcal', extraColor: 'text-blue-400', note: 'Si salle + basket le même jour : ajoute +150 kcal supplémentaires. L\'autre jour = repos actif.' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Semaine type</div>
        {schedule.map((s, i) => (
          <div key={i} className={`py-3 ${i > 0 ? 'border-t border-zinc-800' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white text-sm font-semibold">{s.day}</div>
                <div className="text-zinc-400 text-xs mt-0.5">{s.sport}</div>
              </div>
              <span className={`text-xs font-bold ${s.extraColor} shrink-0 ml-2`}>{s.extra}</span>
            </div>
            <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Calories par type de journée</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: '3 700', label: 'Jour boxe thaï', color: 'text-red-400' },
            { val: '3 500', label: 'Jour salle', color: 'text-blue-400' },
            { val: '3 250', label: 'Jour course', color: 'text-emerald-400' },
            { val: '3 100', label: 'Jour repos', color: 'text-zinc-400' },
          ].map((c, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-xl p-3">
              <div className={`text-xl font-bold ${c.color}`}>{c.val} <span className="text-xs font-normal text-zinc-500">kcal</span></div>
              <div className="text-xs text-zinc-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabPlanning() {
  return (
    <div>
      <p className="text-zinc-500 text-sm mb-4">Appuie sur un jour pour voir le détail des repas.</p>
      {DAYS.map((day) => <DayCard key={day.id} day={day} />)}
    </div>
  );
}

function TabRepas() {
  const ideas = [
    { cat: 'Petit-déjeuner', title: 'Bowl avoine & whey', ingr: 'Flocons d\'avoine 100g · Whey vanille 30g · Banane · Beurre de cacahuète 20g · Lait demi-écrémé 200ml', macros: { p: 45, g: 80, l: 16 }, kcal: 750 },
    { cat: 'Petit-déjeuner', title: 'Omelette complète', ingr: '4 œufs · Fromage râpé 30g · Pain complet 2 tranches · Jambon blanc 60g · Tomates', macros: { p: 48, g: 42, l: 28 }, kcal: 700 },
    { cat: 'Déjeuner', title: 'Bowl poulet-riz', ingr: 'Poulet grillé 220g · Riz basmati 160g (cru) · Légumes vapeur · Sauce soja · Sésame', macros: { p: 55, g: 88, l: 10 }, kcal: 850 },
    { cat: 'Déjeuner', title: 'Pasta bœuf maison', ingr: 'Bœuf haché 5% 220g · Pâtes complètes 140g · Sauce tomate maison · Parmesan 20g', macros: { p: 55, g: 98, l: 18 }, kcal: 900 },
    { cat: 'Dîner', title: 'Saumon patate douce', ingr: 'Filet de saumon 220g · Patate douce 240g · Brocolis · Citron · Herbes fraîches', macros: { p: 46, g: 60, l: 22 }, kcal: 900 },
    { cat: 'Dîner', title: 'Poulet lentilles épicé', ingr: 'Escalope poulet 220g · Lentilles 160g (cuites) · Épinards · Curcuma · Cumin · Féta', macros: { p: 58, g: 62, l: 14 }, kcal: 800 },
    { cat: 'Collation / Shake', title: 'Gainer maison', ingr: 'Lait entier 300ml · Whey 40g · Flocons d\'avoine 60g · Banane · Cacao', macros: { p: 48, g: 80, l: 14 }, kcal: 650 },
    { cat: 'Collation', title: 'Skyr & fruits secs', ingr: 'Skyr nature 200g · Amandes 25g · Noix de cajou 15g · Framboises · Miel', macros: { p: 26, g: 28, l: 14 }, kcal: 350 },
  ];

  const starFoods = [
    { label: 'Protéines', items: 'Poulet · Dinde · Bœuf 5% · Thon · Saumon · Cabillaud · Œufs · Whey · Skyr · Yaourt grec · Fromage blanc · Caséine' },
    { label: 'Glucides complexes', items: 'Flocons d\'avoine · Riz basmati · Riz complet · Pâtes complètes · Patate douce · Pommes de terre · Quinoa · Lentilles · Pain complet' },
    { label: 'Bonnes graisses', items: 'Avocat · Huile d\'olive · Beurre de cacahuète · Beurre d\'amande · Amandes · Noix · Saumon · Graines de chia · Graines de lin' },
  ];

  return (
    <div className="space-y-3">
      {ideas.map((idea, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{idea.cat}</div>
          <div className="text-white font-semibold text-base mb-1">{idea.title}</div>
          <p className="text-zinc-500 text-xs leading-relaxed mb-2">{idea.ingr}</p>
          <div className="flex flex-wrap gap-1.5 items-center">
            <MacroBadges m={idea.macros} />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-400">~{idea.kcal} kcal</span>
          </div>
        </div>
      ))}

      <div className="h-px bg-zinc-800 my-2" />

      {starFoods.map((sf, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{sf.label}</div>
          <p className="text-zinc-300 text-sm leading-loose">{sf.items}</p>
        </div>
      ))}
    </div>
  );
}

function TabConseils() {
  const tips = [
    { title: 'Hydratation', text: 'Vise 3 à 3.5L d\'eau par jour. Les jours de boxe thaï, ajoute 500 à 750ml supplémentaires. La boxe fait beaucoup transpirer — ne néglige pas l\'hydratation avant, pendant et après.', v: 'default' as const },
    { title: 'Timing protéines', text: 'Répartis tes 200g de protéines sur 5 prises (35 à 45g par repas) pour optimiser la synthèse musculaire. Ne dépasse pas 50g par prise — au-delà le corps ne peut pas tout absorber efficacement.', v: 'default' as const },
    { title: 'Boxe thaï : nutrition spécifique', text: '2h avant le cours : repas riche en glucides simples + protéines légères (riz blanc + thon). Pas de repas lourd en graisses. Post-boxe : whey + sucres rapides dans les 30 min.', v: 'warning' as const },
    { title: 'Pré-musculation', text: '1h30 à 2h avant la séance : glucides complexes + protéines. Post-séance dans les 30 à 45 min : shake whey + glucides rapides (banane, datte) pour maximiser l\'anabolisme.', v: 'default' as const },
    { title: 'Créatine monohydrate', text: '5g par jour à n\'importe quel moment (avec un repas). Améliore les performances à la salle ET accélère la récupération après la boxe. C\'est le supplément le mieux documenté scientifiquement.', v: 'info' as const },
    { title: 'Suivi de progression', text: 'Pèse-toi le matin à jeun 2 à 3 fois par semaine. L\'objectif est +0.3 à 0.5 kg/semaine. Si le poids ne bouge pas après 10 jours, ajoute 100 à 150 kcal. Si tu grossis trop vite, réduis le surplus.', v: 'default' as const },
    { title: 'Sommeil = muscle', text: '90% de la sécrétion de GH (hormone de croissance) se passe la nuit. Vise 7 à 9h. Après la boxe, ton corps a besoin de réparer les micro-lésions — le sommeil est non-négociable.', v: 'info' as const },
    { title: 'Jours doubles (salle + basket)', text: 'Si tu fais salle + basket le même jour, ajoute 150 à 200 kcal supplémentaires, principalement en glucides. Ne te prive pas — un déficit sur une journée intense casse l\'anabolisme.', v: 'warning' as const },
    { title: 'Suppléments recommandés', text: 'Essentiels : Whey protéine · Créatine monohydrate 5g/j. Utiles : Vitamine D3 (surtout en hiver) · Magnésium bisglycinate (récupération) · Caséine (protéines nocturnes lentes).', v: 'default' as const },
  ];

  const goals = [
    { val: '200g', label: 'Protéines/jour' },
    { val: '3.5L', label: 'Eau/jour (sport)' },
    { val: '+0.4kg', label: 'Objectif/semaine' },
    { val: '8h', label: 'Sommeil mini' },
  ];

  return (
    <div>
      {tips.map((t, i) => <TipCard key={i} title={t.title} text={t.text} variant={t.v} />)}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-4">
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Rappel de tes objectifs</div>
        <div className="grid grid-cols-2 gap-3">
          {goals.map((g, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{g.val}</div>
              <div className="text-xs text-zinc-500 mt-1">{g.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'calories', label: 'Calories' },
  { id: 'sport', label: 'Sport' },
  { id: 'planning', label: 'Planning' },
  { id: 'repas', label: 'Repas' },
  { id: 'conseils', label: 'Conseils' },
];

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calories');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-2">Programme personnalisé</div>
        <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
          Prise de masse<br /><span className="text-blue-400">musculaire</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">Nutrition optimisée · lean bulk</p>
        <div className="inline-flex items-center gap-2 mt-3 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
          <span className="text-white text-xs font-medium">26 ans</span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-zinc-400 text-xs">77 kg · 190 cm · Homme</span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors touch-manipulation ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pb-24">
        {activeTab === 'calories' && <TabCalories />}
        {activeTab === 'sport' && <TabSport />}
        {activeTab === 'planning' && <TabPlanning />}
        {activeTab === 'repas' && <TabRepas />}
        {activeTab === 'conseils' && <TabConseils />}
      </div>
    </div>
  );
}
