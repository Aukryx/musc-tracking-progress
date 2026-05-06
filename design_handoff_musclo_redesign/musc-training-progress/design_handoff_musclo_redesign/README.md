# Handoff — Musclo (musc-training-progress) Redesign

## Overview

Refonte UX/UI complète d'une app Next.js de tracking de musculation (Push/Pull/Legs, exercices, séries, 1RM Brzycki, historique, stats, nutrition). L'app existante fonctionne bien côté data (Dexie/IndexedDB) mais le front actuel est jugé peu ergonomique. Cette refonte propose :

- Une nav réduite à **4 onglets** (au lieu de 5) en fusionnant Historique + Stats dans un onglet unique **Progression**.
- Un **dashboard** repensé qui rend les templates accessibles en un seul tap.
- Un **flow de logging novateur** : maintien long (≈600ms) sur une série pour la valider, plutôt qu'un bouton Check.
- Un **picker d'exercices** simplifié (recherche + groupes musculaires + récents épinglés).
- Un onglet **Nutrition** étoffé (sous-onglets Aujourd'hui / Semaine / Conseils, hydratation, détail repas, ajout aliment).
- Une direction visuelle **dark OLED** avec accent vert lime énergique, typographie display Inter Tight + chiffres tabulaires JetBrains Mono.

---

## ⚠️ À propos des fichiers de design

**Les fichiers HTML/JSX dans ce bundle sont des références de design**, pas du code de production à copier-coller. Ils utilisent :

- React/Babel chargé via `<script>` dans le navigateur (pas de build step)
- Des données mockées (`window.MOCK = {…}`) au lieu de la vraie DB Dexie
- Des SVG d'icônes inline au lieu de `lucide-react`
- Des styles inline (`style={{…}}`) au lieu de Tailwind / CSS modules

**Ta mission** : recréer ces écrans dans le **codebase Next.js existant** (`musc-training-progress`) en respectant ses conventions :

- App Router Next.js 15 (`src/app/...`)
- Tailwind CSS v4 (`@import "tailwindcss"` dans `globals.css`)
- `lucide-react` pour les icônes
- Dexie pour la persistence (DB déjà en place dans `src/lib/db.ts`)
- Recharts pour les graphiques (déjà installé)
- Composants client (`'use client'`) pour tout ce qui est interactif

Connecte chaque écran à la DB Dexie existante. **Ne casse pas** le data model actuel (`Exercise`, `WorkoutTemplate`, `WorkoutSession`, `WorkoutSet`, `Goal`).

---

## Fidélité

**High-fidelity** — colors, spacing, typo et interactions sont finalisés. Recrée pixel-perfect en Tailwind. Les valeurs OKLCH listées plus bas doivent être reportées telles quelles dans `globals.css` ou `tailwind.config`.

---

## Design Tokens

À ajouter dans `src/app/globals.css` (Tailwind v4 utilise `@theme`) :

```css
@theme {
  /* Backgrounds — dark OLED */
  --color-bg:    #0a0a0b;   /* page */
  --color-bg-1:  #111114;   /* card */
  --color-bg-2:  #17171b;   /* input / subtle surface */
  --color-bg-3:  #1f1f24;   /* elevated / chip-active */

  /* Lines */
  --color-line:   #26262c;  /* default border */
  --color-line-2: #34343c;  /* stronger border */

  /* Ink (text) */
  --color-ink:   #f5f5f7;   /* primary */
  --color-ink-2: #c1c1c8;   /* secondary */
  --color-ink-3: #7a7a82;   /* tertiary / muted */
  --color-ink-4: #4a4a52;   /* placeholder / disabled */

  /* Brand */
  --color-accent:      oklch(0.86 0.20 130);          /* lime electric */
  --color-accent-soft: oklch(0.86 0.20 130 / 0.14);   /* hover bg / chip bg */
  --color-accent-ink:  #0a0a0b;                       /* text on accent */

  /* Semantic */
  --color-pr:   oklch(0.86 0.20 90);   /* gold-ish for personal records */
  --color-warn: oklch(0.78 0.18 60);
  --color-bad:  oklch(0.68 0.22 25);

  /* Macro hues (nutrition bars) */
  --color-macro-protein: oklch(0.78 0.16 130);
  --color-macro-carbs:   oklch(0.78 0.16 75);
  --color-macro-fats:    oklch(0.78 0.16 40);

  /* Type */
  --font-display: "Inter Tight", -apple-system, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* Radii */
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 22px;
  --radius-pill: 999px;
}
```

Charge les fonts dans `layout.tsx` :
```tsx
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
const display = Inter_Tight({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

**Spacing scale** : utilise l'échelle Tailwind par défaut. Les valeurs custom dans le proto sont en px (`padding: '14px 16px'`) — convertis via `p-3.5 px-4` etc.

**Typo (display sizes utilisés dans le proto)** :
- Page title : `28px / 800 / -0.03em` (`text-[28px] font-extrabold tracking-tight`)
- Section title : `22px / 800 / -0.02em`
- Card title : `15-18px / 700`
- Body : `13-14px / 500-600`
- Eyebrow (label majuscule) : `10px / 700 / 0.14em / uppercase` + `text-ink-3`
- Numbers (mono, tabular) : appliquer `font-mono` + `font-feature-settings: 'tnum' 1`

**Conventions chiffres** : tous les nombres (poids, reps, kcal, durée, dates) sont en `font-mono` avec `tnum` activé pour alignement vertical parfait.

---

## Architecture des écrans → fichiers Next.js

| Écran proto | Onglet | Route Next.js cible |
|---|---|---|
| `ScreenHome` | Accueil | `src/app/page.tsx` (refonte de l'existant) |
| `ScreenSession` | Séance | `src/app/workout/page.tsx` (refonte) |
| `ScreenPicker` | (modal) | `src/components/ui/ExercisePicker.tsx` (refonte) |
| `ScreenExerciseDetail` | (modal) | `src/components/ui/ExerciseDetailSheet.tsx` (refonte) |
| `ScreenProgress` (Stats + Historique fusionnés) | Progression | `src/app/progress/page.tsx` (**nouveau**, remplace `analytics/` + `history/`) |
| `ScreenNutrition` (Aujourd'hui/Semaine/Conseils) | Nutrition | `src/app/nutrition/page.tsx` (refonte complète) |

### NavBar → 4 onglets

Refonte de `src/components/ui/NavBar.tsx` :
- `Home` → `/`
- `Bolt` (Zap) → `/workout`
- `BarChart3` → `/progress`  ⚠️ nouvelle route
- `Apple` → `/nutrition`

Fusionne les anciennes routes `/history` et `/analytics` sous `/progress` avec un toggle interne `tab: 'stats' | 'history'`. Tu peux soit redirect 301 les anciennes URLs dans `next.config.ts`, soit supprimer les pages.

Le dock du proto est en glassmorphism flottant (`backdrop-filter: blur(20px)` + bg `rgba(15,15,18,0.85)` + border + radius 20px), positionné en `bottom: 24px` avec marges horizontales 16px. À reproduire fidèlement.

---

## Écrans en détail

### 1. Accueil (`page.tsx`)

**Layout vertical, scroll, padding-bottom 110px (pour le dock).**

**a. Header** (`px-5 pt-4.5 pb-2`)
- Date du jour formatée fr-FR (ex: "Lundi 27 avr.") en `text-[13px] text-ink-3`
- Greeting "Salut {prénom}." en `text-[28px] font-extrabold tracking-tight` (-0.03em)
- À droite : bouton settings 38×38 rounded-xl avec border `line` et icône `Settings` 18px

**b. Streak banner** (`mx-5 mb-4.5`)
- Background : `linear-gradient(180deg, rgba(180,255,80,0.1), rgba(180,255,80,0.02))`
- Border : `1px solid rgba(180,255,80,0.2)`
- Radius 14, padding `10px 14px`
- Icône `Flame` 18px en accent + "X jours de série" + à droite "X/5 cette semaine" en mono ink-3

**c. Section "Démarrer"** (`px-5`)
- Eyebrow "Démarrer"
- Grille 3 cols (templates Push/Pull/Legs) avec gap 8 :
  - Card bg-1, border line, radius 18, padding `14px 12px`
  - Square 30×30 radius 9 en accent avec lettre `P/L/J` (ou première lettre du template) en accent-ink, font-extrabold 14px
  - Nom du template : 15px / 700
  - "X ex." en mono 11px ink-3
- En dessous : **bouton "Séance vide" pleine largeur**, accent bg, accent-ink text, radius 18, padding `16px 18px`, font-extrabold 16px, shadow `0 10px 30px -10px oklch(0.86 0.20 130 / 0.5)`. Carré 32×32 d'icône Bolt à gauche dans bg `rgba(0,0,0,0.18)`. ArrowRight à droite.
  - **Action** : ouvre la page `/workout` sans template.

**d. Dernière séance** (`px-5 pt-5`)
- Eyebrow + lien "Tout voir" → `/progress`
- Card bg-1 border line radius 20 padding 16
- Top : nom du template (18/800), date relative (12 ink-3) → à droite badge PR si > 0 (`bg accent-soft`, `text accent`, fontSize 11, padding `4px 8px`, radius 999, icône Star fill)
- Border-top après 14, puis 3 stats inline (gap 16) : durée min, séries, volume tonnes — chaque stat = number mono 18/700 + label 10 ink-3.

**e. Stats globales** (`px-5 pt-4.5`)
- 2 cards `Stat` en flex gap 8 : "Séances" (47) et "Séries" (412 avec value en accent).
- Chaque Stat : bg-1, border line, radius 18, padding 14, value 28/800/-0.02em mono, label 12 ink-3.

**Connexion DB** :
- `MOCK_TEMPLATES` → `db.workoutTemplates.toArray()`
- `MOCK_LAST_SESSION` → `db.workoutSessions.orderBy('endTime').reverse().first()` + agrégat des sets
- `MOCK_STATS.streak` → calcul "jours consécutifs avec au moins une session" (algo simple sur les dates de `workoutSessions`)
- `MOCK_STATS.thisWeek` → count des sessions depuis lundi 00:00

---

### 2. Séance active (`workout/page.tsx`)

**Layout** : header sticky + progress bar 2px + carrousel exercices + zone scrollable + FAB rest timer.

**a. Header** (`px-4 py-3 border-b line`)
- Bouton fermer 36×36 bg-2 radius 10 → confirme abandon si sets validés > 0
- Centre : nom template (15/700) + sub-line en mono 11 ink-3 : `<Clock /> 24:12 · 3/12 séries`
- Bouton "Terminer" : accent bg, accent-ink, radius 12, padding `8px 14px`, 13/700 → confirme + écrit la session en DB.

**b. Progress bar** : div 2px height, bg-2, avec inner accent width = `completedSets/totalSets * 100%`, transition 0.4s.

**c. Carrousel d'exercices** (`px-4 pt-3 pb-1`)
- Flex gap 8 horizontal scroll
- Chaque tab : `bg-2 si active sinon transparent`, border `line-2 si active sinon line`, radius 10, padding `7px 12px`, 12/600
- Affiche `{numéro}` + `{done}/{all}` en mono 11 (accent si done==all sinon ink-3)
- Bouton final "+" en bordure dashed → ouvre le picker.

**d. Zone exercice courant** (`px-4`)
- Titre exercice : 22/800/-0.02em
- Sub-line muscles : 12 ink-3
- À droite : bouton "Détails →" (ouvre la modal ExerciseDetail)
- Card "Dernier best" : bg-1, border line, radius 12, padding `10px 12px`, flex gap 12 :
  - Eyebrow "Dernier best" + nombre mono 14/700 (`80kg × 6`) + à droite "1RM 92.8kg" en mono 11

**e. Liste des séries**
- Header de colonnes (px-2, fontSize 10, letterSpacing 0.1em, uppercase, ink-4) : `# | Poids · kg | Reps | 1RM` (grid `24px 1fr 1fr 60px`, gap 10)
- Chaque ligne : grid identique, padding `12px 12px`, radius 14
  - **Non validée** : bg-1, border line, cursor pointer, inputs bg-2 + border line-2
  - **Validée** : bg `accent-soft`, border `accent / 0.35`, inputs transparents (juste valeur centrée)
  - Inputs : `text-align center`, `font-mono`, 17/700, `inputMode decimal/numeric`
  - Cellule 1RM : valeur mono 13/700 ink-2 (ink-4 si vide). Si `isPR` → étoile gold (`color: pr`) à gauche du nombre.

**f. Geste de validation novateur (POINT CLÉ)** :
- Sur toute la ligne (sauf inputs eux-mêmes), `onMouseDown` / `onTouchStart` démarre un timer.
- Pendant le hold : pseudo-progress bar overlay (div absolute, inset 0, bg accent opacity 0.12) avec `width = progress * 100%`, transition 50ms linéaire.
- À 600ms : `set.completed = true`, set la set en DB, animation de pulse, vibrate (`navigator.vibrate(15)`).
- `onMouseUp` / `onMouseLeave` / `onTouchEnd` avant 600ms → annule.
- **Important** : `e.stopPropagation()` sur `onMouseDown/onTouchStart` des inputs pour ne pas déclencher le hold quand on saisit.
- 1RM auto-calculé via la formule Brzycki existante de `src/lib/calculations.ts` à chaque changement de poids/reps.

**g. Bouton "+ Ajouter une série"** : padding 12, border dashed line-2, radius 14, ink-3, 13/600 centered avec icône Plus.

**h. Hint card** : explique le geste (Maintiens pour valider, swipe gauche pour supprimer). À montrer seulement à la première session (flag localStorage).

**i. FAB rest timer** : `position absolute, bottom 30, right 16`, 52×52 radius 16, bg-2, border line-2, icône Timer 20px, shadow. → Ouvre la modal `RestTimer` existante.

**Connexion DB** :
- État local des sets (`useState`) qui sync avec `db.workoutSessions` au moment du Terminer (existing logic dans `WorkoutSession.tsx`).
- Reprend l'auto-save / draft localStorage déjà implémenté.

---

### 3. Picker d'exercices (modal)

**Layout** : sheet pleine page, dark, header + search + chips groupes + liste scroll.

- **Header** : `Close` left + titre "Choisir un exercice" 16/700, no border
- **Search** (`px-4 pt-3`) : input bg-1, border line, radius 12, padding `10px 14px 10px 36px`, icône Search 15 absolute left 12 top 11. Placeholder "Rechercher dans 873 exercices…"
- **Chips groupes** (`px-4 pt-2 pb-3`) : flex gap 6 overflow-x. Active = bg accent + accent-ink, sinon bg-1 + ink-2. Padding `7px 14px`, radius pill, 12/700. Groupes : `All, Chest, Back, Legs, Arms, Shoulders, Core` — viens de l'API ExerciseDB.
- **Liste** : sections `Récents` (épinglés, max 5, icône Pin) puis `Tous`. Chaque row :
  - 40×40 carré bg-2 radius 10 avec icône Dumbbell ink-3
  - Nom 14/600 + sub-line "muscles · équipement" 11 ink-3
  - Plus icon 18 ink-3 à droite

**Connexion** :
- Plug sur l'API ExerciseDB existante (cf. `ExercisePicker.tsx`)
- "Récents" = top 5 exercices par `count(WorkoutSet WHERE exerciseId)` sur les 30 derniers jours

---

### 4. Détail exercice (modal/sheet)

**Layout** : header + GIF + record perso + muscles + exécution.

- Header : `ArrowLeft` close + titre 15/700 + sub-line "muscles · équip" 11 ink-3
- GIF : carré radius 18 mx-4 height 200 — utilise le GIF de l'API ExerciseDB. Placeholder hachuré si absent.
- **Card record perso** : bg-1 border line radius 16 padding 16 flex gap 16
  - Carré 48×48 radius 14 bg accent-soft, icône Star fill accent
  - Nombre mono `80kg × 8` en 22/800/-0.02em
  - Sub-line "1RM estimé · 99kg · il y a 4 jours" en 11 ink-3
- **Muscles ciblés** : flex wrap gap 6 de tags pill 12/600 padding `6px 12px`. Le muscle primaire est en `bg accent-soft / text accent`, les secondaires en `bg-1 / ink-2 / border line`.
- **Exécution** : ol numérotée, chaque step = badge 22×22 mono 11/700 sur bg-2 + texte 13 ink-2 lh 1.45.

**Connexion** : `db.exercises.get(id)` + champ `instructions: string[]`. Best perso = `max(brzycki(weight, reps))` sur tous les `WorkoutSet WHERE exerciseId`.

---

### 5. Progression (`progress/page.tsx`) — NOUVEAU

**Layout** : header + toggle 2 onglets + contenu.

- Header : titre "Progression" 28/800/-0.03em (`px-5 pt-4.5`)
- Toggle : segmented control 2 boutons `Stats | Historique`. Wrapper bg-1 border line radius 12 padding 4. Bouton actif bg-3 ink, sinon transparent ink-3. Padding `7px 14px`, 13/600.

#### Tab "Stats"
**a. Volume cette semaine** : card bg-1 border line radius 18 padding 18
- Eyebrow "Volume cette semaine"
- Number mono 30/800/-0.02em : `8.4 tonnes` (sum des `weight*reps` sur 7 derniers jours)
- Badge delta vs semaine précédente : bg accent-soft, accent text, padding `5px 10px`, radius 999, icône Trend 12 + `+18%`
- Bar chart 7 barres (L-D), height 100, gap 6 :
  - barre = `(value/max)*80px` height
  - jour courant = `bg accent`, autres = `bg-3`
  - jour label dessous : 10/600 mono (ink-2 si today, ink-3 sinon)

**b. Sélecteur d'exercices** : flex gap 6 overflow-x scroll, chips identiques au picker mais sans accent (`bg-3 si active, bg-1 sinon`).

**c. Card 1RM par exercice** : bg-1 border line radius 18 padding 18
- Eyebrow "1RM estimé"
- Number mono `99kg` 30/800
- Badge delta accent
- **Sparkline SVG** 12 mois, fill gradient accent vers transparent, stroke accent 2.5px, point final 4px fill accent.

#### Tab "Historique"
- Liste de cards séances : flex column gap 10
- Chaque card : bg-1 border line radius 16 padding 14, flex gap 12
  - Square 44×44 radius 12 bg accent + accent-ink, première lettre du template, 13/800
  - Nom + badge `X PR` (si > 0) en bg `pr/0.15` text `pr` 10/700
  - Sub-line mono 11 ink-3 : "Hier · 58min · 22 séries · 8.4t"
  - ChevronRight 16 ink-4 → `/progress/[sessionId]` (ou modal)

**Connexion** :
- `db.workoutSessions.orderBy('endTime').reverse().toArray()` pour l'historique
- Pour le sparkline 1RM : pour chaque exercice sélectionné, prendre le max(brzycki) par mois sur 12 mois.
- Pour le delta semaine : compare sum volume cette semaine vs N-1.
- Conserve la page détail session existante (`history/[id]/page.tsx`) — change juste le routing vers `/progress/[id]`.

---

### 6. Nutrition (`nutrition/page.tsx`)

**Layout** : header + sub-toggle 3 onglets + contenu.

- Header : "Nutrition" 28/800 + sub-line "Lundi · Salle de musculation" (jour courant + activité, accent sur l'activité)
- Toggle 3 boutons `Aujourd'hui | Semaine | Conseils`

#### Tab "Aujourd'hui"
**a. Anneau calorique** : card bg-1 border line radius 22 padding 18 flex gap 14
- SVG 140×140 : 2 cercles concentriques r=64 stroke-width 10, fond bg-3, progress accent stroke-linecap round, dasharray = 2πr, offset calculé. Texte centré : grande valeur mono 32/800/-1px tracking + sub "/ 3400 kcal" 11/600 ink-3.
- À droite (flex-1, **min-width: 0** important) : 4 macro bars (Protéines, Glucides, Lipides, Fibres) :
  - Label 12/600 ink-2 + valeur mono 11 (cur/tgt)
  - Bar : height 6 bg-3 radius pill avec inner colored par hue (130/75/40/250 selon macro), width % = cur/tgt clamp 100.

**b. Tracker hydratation** : card bg-1 border line radius 18 padding 16
- Eyebrow + mono compteur "X / 12 doses"
- 12 doses cliquables : grid-cols-12 gap 4, chaque dose = div height 28 radius 6, bg accent si checked sinon bg-3, transition. Tap toggle.

**c. Liste repas du jour** :
- Eyebrow "Repas du jour" + bouton "+ Ajouter" accent text à droite
- Liste cards bg-1 border line radius 14 padding `12px 14px` flex gap 12 :
  - Heure mono 11 ink-3 width 38
  - Nom 14/700 (line-through si done) + Check icon accent si done
  - Items résumés ellipsis 11 ink-3
  - kcal mono 13/700 ink-2 à droite
  - Card opacity 0.55 si `done === true`
- **Tap** une carte → ouvre `MealDetail` modal

#### Tab "Semaine"
- Card bg-1 graphique 7 jours en bar chart (volume kcal par jour). Ligne pointillée à `target = 3400` superposée.
- Card "Moyennes hebdo" : 4 macros bars en ligne avec valeurs moyennes
- Card "Streak protéines" : icône Flame + "X jours d'objectif protéines atteint"

#### Tab "Conseils"
- Liste de insight cards (good/warn/info) :
  - Pastille colorée 32×32 + titre + body 13 ink-2
  - Exemples : "Protéines en avance ✓", "Hydratation faible aujourd'hui", "Pic glucides recommandé pré-séance"
- Card "Mes objectifs" en bas : édition de target kcal + ratio macros.

#### Modal Détail repas
- Header avec close + nom repas + heure
- Hero kcal mono 36/800
- Stats 4 macros en row (proteins/carbs/fats/fibers)
- Liste items : nom + qty + macros par item (mini)
- Bouton "Ajouter aliment" en bas (FAB ou plein largeur)

#### Modal Ajout aliment
- Search input
- Tabs `Récents | Favoris | Recettes | Scanner`
- Liste aliments base (par 100g) : nom + macros condensées + bouton + qui ouvre un step "qty + unité" (g/portion/cuillère)

**Connexion DB** :
- ⚠️ La nutrition n'existe pas encore en DB. **À créer** :
  ```ts
  // ajouter dans src/lib/db.ts
  export interface Food { id: number; name: string; kcalPer100: number; protein: number; carbs: number; fats: number; fibers: number; }
  export interface MealItem { foodId: number; qty: number; }
  export interface Meal { id: number; date: string; time: string; name: string; items: MealItem[]; done: boolean; }
  export interface NutritionGoal { kcal: number; proteinG: number; carbsG: number; fatsG: number; fibersG: number; }
  export interface WaterLog { date: string; doses: number; }
  ```
- Démarre avec une base d'aliments locale (top 100 communs FR) — pas besoin d'API externe en V1.

---

## Interactions clés

### Animations
- **Hold-to-validate** : transition `width 50ms linear` pendant le hold; à la complétion → bg pulse 200ms ease-out (scale 1 → 1.02 → 1, bg flash) + `navigator.vibrate?.(15)`.
- **Toggle tabs** : `transition: background 0.2s, color 0.2s`
- **Anneau calorie** : `stroke-dashoffset transition 0.6s ease-out` au mount.
- **Macro bars** : `width transition 0.5s ease-out`.
- **Sparkline** : pas d'animation au mount (assez petit), mais on peut animer le path avec `stroke-dasharray` si tu veux (~800ms).

### Navigation
- Bottom nav fixe en bas, **glassmorphism** : `backdrop-filter: blur(20px) saturate(180%)`, `bg rgba(15,15,18,0.85)`, border line, radius 20, padding `10px 8px`, marges `bottom 24 / left 16 / right 16`.
- 4 items, chacun = bouton flex column gap 4, icône 20 + label 10/600, accent si actif.
- Cache la nav dans les modals plein-écran (picker, détail repas, ajout aliment, ajout exercice).

### États
- Loading : skeleton shimmer (bg-1 → bg-2 → bg-1 keyframes 1.5s)
- Empty (no sessions yet) : illustration légère (Dumbbell 64px ink-4) + CTA "Créer ton premier template"
- Error : toast bottom (bg `bad/0.15`, border `bad`, radius 12)

---

## State management

L'app utilise déjà **Dexie** (IndexedDB) en direct depuis les composants (`useLiveQuery`). Continue ce pattern.

À ajouter pour la séance active : draft localStorage (déjà existant) — étend pour stocker le `holdProgress` éphémère en mémoire React seulement.

Pour la nutrition, mêmes patterns : `useLiveQuery(() => db.meals.where('date').equals(today).toArray())`.

---

## Assets

- **Icônes** : remplace les SVG inline du proto par `lucide-react` (déjà installé). Mapping :
  - `I.Home` → `Home`
  - `I.Bolt` → `Zap`
  - `I.Chart` → `BarChart3` ou `TrendingUp`
  - `I.Apple` → `Apple` (de lucide) ou `UtensilsCrossed`
  - `I.Plus/Check/Trash/Search/Close/Right/Left/Down/Up/Clock/Flame/Trend/Star/Pin/Filter/Settings/Drop/Dumbbell/Pause/Play/Calendar/Timer/ArrowR` → noms lucide équivalents (Plus, Check, Trash2, Search, X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Clock, Flame, TrendingUp, Star, Pin, Filter, Settings, Droplet, Dumbbell, Pause, Play, Calendar, Timer, ArrowRight)
- **GIF exercices** : API ExerciseDB (déjà en place dans le code)
- **Fonts** : Inter Tight + JetBrains Mono via `next/font/google`

---

## Fichiers de référence dans ce bundle

```
design_handoff_musclo_redesign/
├── README.md                       ← ce fichier
├── Musclo Redesign.html            ← entry point du proto
└── prototype/
    ├── app.jsx                     ← shell, routing modal, IOSDevice wrapper
    ├── screens.jsx                 ← TOUS les écrans (Home, Session, Picker, Detail, Progress, Nutrition + sous-modals)
    ├── data.jsx                    ← données mockées (window.MOCK)
    ├── icons.jsx                   ← SVG icons inline (à remplacer par lucide)
    └── ios-frame.jsx               ← bezel iPhone (ne pas reproduire en prod)
```

Pour lancer le proto en local : ouvre `Musclo Redesign.html` dans n'importe quel navigateur (aucun build nécessaire, Babel transpile dans le navigateur).

---

## Plan d'implémentation suggéré

1. **Tokens & fonts** : `globals.css` + `layout.tsx`
2. **NavBar** : refonte 4 onglets glassmorphism
3. **Accueil** : `page.tsx` (templates, last session, stats)
4. **Séance** : `workout/page.tsx` + nouveau `SetRow` avec hold gesture (le plus gros morceau)
5. **Picker** : refonte `ExercisePicker.tsx`
6. **Détail exercice** : refonte `ExerciseDetailSheet.tsx`
7. **Progression** : nouvelle `progress/page.tsx`, redirect `/history` et `/analytics`
8. **Nutrition** : DB schema + `nutrition/page.tsx` + sous-modals
9. **QA dark mode** : vérifie OLED-friendly (pas de bg-blanc qui traîne), contraste WCAG sur ink-3.

Bon courage 💪
