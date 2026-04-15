import type { MuscleKey } from '@/lib/db';

interface MuscleMapProps {
  primary: MuscleKey[];
  secondary: MuscleKey[];
  size?: number;
}

// Couleurs
const PRIMARY = '#3b82f6';    // bleu vif
const SECONDARY = '#1d4ed8';  // bleu foncé
const BASE = '#27272a';       // zinc-800
const OUTLINE = '#3f3f46';    // zinc-700

function color(key: MuscleKey, primary: MuscleKey[], secondary: MuscleKey[]) {
  if (primary.includes(key)) return PRIMARY;
  if (secondary.includes(key)) return SECONDARY;
  return BASE;
}

export default function MuscleMap({ primary, secondary, size = 280 }: MuscleMapProps) {
  const c = (key: MuscleKey) => color(key, primary, secondary);
  const h = size;
  const w = size * 0.85;

  return (
    <div className="flex gap-2 items-start justify-center">
      {/* FACE AVANT */}
      <svg width={w / 2} height={h} viewBox="0 0 100 220" fill="none">
        {/* Cou */}
        <rect x="44" y="22" width="12" height="10" rx="2" fill={BASE} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Tête */}
        <ellipse cx="50" cy="14" rx="12" ry="13" fill="#3f3f46" stroke={OUTLINE} strokeWidth="0.5" />

        {/* Pectoraux (2 lobes) */}
        <ellipse cx="38" cy="50" rx="13" ry="10" fill={c('pectoraux')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="62" cy="50" rx="13" ry="10" fill={c('pectoraux')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Deltoïde antérieur */}
        <ellipse cx="22" cy="48" rx="8" ry="7" fill={c('deltoide_ant')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="78" cy="48" rx="8" ry="7" fill={c('deltoide_ant')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Deltoïde latéral */}
        <ellipse cx="16" cy="56" rx="6" ry="5" fill={c('deltoide_lat')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="84" cy="56" rx="6" ry="5" fill={c('deltoide_lat')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Abdominaux */}
        <rect x="42" y="62" width="7" height="8" rx="2" fill={c('abdominaux')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="51" y="62" width="7" height="8" rx="2" fill={c('abdominaux')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="42" y="72" width="7" height="8" rx="2" fill={c('abdominaux')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="51" y="72" width="7" height="8" rx="2" fill={c('abdominaux')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="42" y="82" width="7" height="7" rx="2" fill={c('abdominaux')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="51" y="82" width="7" height="7" rx="2" fill={c('abdominaux')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Biceps */}
        <ellipse cx="18" cy="68" rx="6" ry="11" fill={c('biceps')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="82" cy="68" rx="6" ry="11" fill={c('biceps')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Avant-bras */}
        <rect x="13" y="80" width="10" height="20" rx="4" fill={c('avant_bras')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="77" y="80" width="10" height="20" rx="4" fill={c('avant_bras')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Quadriceps */}
        <ellipse cx="38" cy="145" rx="12" ry="22" fill={c('quadriceps')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="62" cy="145" rx="12" ry="22" fill={c('quadriceps')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Mollets (face avant visible légèrement) */}
        <ellipse cx="38" cy="188" rx="8" ry="14" fill={c('mollets')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="62" cy="188" rx="8" ry="14" fill={c('mollets')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Tronc/hanches */}
        <path d="M36 92 Q50 100 64 92 L68 120 Q50 128 32 120 Z" fill="#3f3f46" stroke={OUTLINE} strokeWidth="0.5" />

        {/* Légende */}
        <text x="50" y="215" textAnchor="middle" fontSize="7" fill="#71717a">AVANT</text>
      </svg>

      {/* FACE ARRIÈRE */}
      <svg width={w / 2} height={h} viewBox="0 0 100 220" fill="none">
        {/* Tête */}
        <ellipse cx="50" cy="14" rx="12" ry="13" fill="#3f3f46" stroke={OUTLINE} strokeWidth="0.5" />

        {/* Cou */}
        <rect x="44" y="22" width="12" height="10" rx="2" fill={BASE} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Trapèze */}
        <path d="M30 32 Q50 28 70 32 L65 50 Q50 54 35 50 Z" fill={c('trapeze')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Deltoïde postérieur */}
        <ellipse cx="22" cy="48" rx="8" ry="7" fill={c('deltoide_post')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="78" cy="48" rx="8" ry="7" fill={c('deltoide_post')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Grand dorsal */}
        <path d="M22 52 Q36 58 38 80 L32 92 Q20 70 18 56 Z" fill={c('grand_dorsal')} stroke={OUTLINE} strokeWidth="0.5" />
        <path d="M78 52 Q64 58 62 80 L68 92 Q80 70 82 56 Z" fill={c('grand_dorsal')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Rhomboïdes (entre les omoplates) */}
        <ellipse cx="50" cy="60" rx="10" ry="12" fill={c('rhomboides')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Lombaires */}
        <rect x="40" y="80" width="20" height="14" rx="3" fill={c('lombaires')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Triceps */}
        <ellipse cx="18" cy="68" rx="6" ry="11" fill={c('triceps')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="82" cy="68" rx="6" ry="11" fill={c('triceps')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Avant-bras dos */}
        <rect x="13" y="80" width="10" height="20" rx="4" fill={c('avant_bras')} stroke={OUTLINE} strokeWidth="0.5" />
        <rect x="77" y="80" width="10" height="20" rx="4" fill={c('avant_bras')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Fessiers */}
        <ellipse cx="38" cy="118" rx="14" ry="12" fill={c('fessiers')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="62" cy="118" rx="14" ry="12" fill={c('fessiers')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Ischio-jambiers */}
        <ellipse cx="38" cy="150" rx="12" ry="20" fill={c('ischio')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="62" cy="150" rx="12" ry="20" fill={c('ischio')} stroke={OUTLINE} strokeWidth="0.5" />

        {/* Mollets */}
        <ellipse cx="38" cy="188" rx="8" ry="14" fill={c('mollets')} stroke={OUTLINE} strokeWidth="0.5" />
        <ellipse cx="62" cy="188" rx="8" ry="14" fill={c('mollets')} stroke={OUTLINE} strokeWidth="0.5" />

        <text x="50" y="215" textAnchor="middle" fontSize="7" fill="#71717a">ARRIÈRE</text>
      </svg>

      {/* Légende couleurs */}
    </div>
  );
}

export function MuscleLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-zinc-400">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
        Principal
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-blue-800 inline-block" />
        Secondaire
      </span>
    </div>
  );
}
