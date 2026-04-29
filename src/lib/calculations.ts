/**
 * Formule de Brzycki pour estimer le 1RM (One Rep Max)
 * 1RM = poids / (1.0278 - (0.0278 * reps))
 * Valide pour reps < 37
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // Formule non fiable au-delà

  const oneRM = weight / (1.0278 - 0.0278 * reps);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Calcule le volume total d'une séance (somme poids * reps)
 */
export function calculateVolume(weight: number, reps: number, sets: number): number {
  return weight * reps * sets;
}

/**
 * Formate un 1RM pour affichage
 */
export function format1RM(oneRM: number): string {
  if (oneRM <= 0) return '—';
  return `${oneRM.toFixed(1)} kg`;
}

/**
 * Formate une durée en secondes en mm:ss
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Formate une date pour affichage
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

/**
 * Calcule la durée d'une séance en minutes
 */
export function sessionDuration(start: Date, end?: Date): number {
  const endTime = end ?? new Date();
  return Math.round((endTime.getTime() - start.getTime()) / 1000);
}
