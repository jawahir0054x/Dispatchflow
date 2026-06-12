import type { LoadGrade, LoadRecommendation } from '../types'

export function recommendationLabel(recommendation: LoadRecommendation): string {
  switch (recommendation) {
    case 'GOOD_LOAD':
      return 'Good Load'
    case 'AVERAGE_LOAD':
      return 'Average Load'
    case 'AVOID_LOAD':
      return 'Avoid Load'
  }
}

export function gradeStyles(grade: LoadGrade, variant: 'light' | 'dark'): string {
  const palette: Record<LoadGrade, { light: string; dark: string }> = {
    A: { light: 'bg-emerald-100 text-emerald-800', dark: 'bg-emerald-900/40 text-emerald-300' },
    B: { light: 'bg-green-100 text-green-800', dark: 'bg-green-900/40 text-green-300' },
    C: { light: 'bg-amber-100 text-amber-800', dark: 'bg-amber-900/40 text-amber-300' },
    D: { light: 'bg-orange-100 text-orange-800', dark: 'bg-orange-900/40 text-orange-300' },
    F: { light: 'bg-rose-100 text-rose-800', dark: 'bg-rose-900/40 text-rose-300' },
  }
  return palette[grade][variant]
}

export function recommendationStyles(
  recommendation: LoadRecommendation,
  variant: 'light' | 'dark',
): string {
  switch (recommendation) {
    case 'GOOD_LOAD':
      return variant === 'dark'
        ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'AVERAGE_LOAD':
      return variant === 'dark'
        ? 'border-amber-800 bg-amber-950/40 text-amber-300'
        : 'border-amber-200 bg-amber-50 text-amber-800'
    case 'AVOID_LOAD':
      return variant === 'dark'
        ? 'border-rose-800 bg-rose-950/40 text-rose-300'
        : 'border-rose-200 bg-rose-50 text-rose-800'
  }
}
