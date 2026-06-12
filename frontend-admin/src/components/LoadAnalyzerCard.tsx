import { useEffect, useState } from 'react'
import * as loadAnalyzerApi from '../api/loadAnalyzer'
import { ApiClientError } from '../api/client'
import type { LoadAnalysisResponse } from '../types'
import { formatCurrency } from '../utils/format'
import {
  gradeStyles,
  recommendationLabel,
  recommendationStyles,
} from '../utils/loadAnalyzer'

interface LoadAnalyzerCardProps {
  rate: number
  miles: number
  deadheadMiles: number
  variant?: 'light' | 'dark'
}

export function LoadAnalyzerCard({
  rate,
  miles,
  deadheadMiles,
  variant = 'dark',
}: LoadAnalyzerCardProps) {
  const [analysis, setAnalysis] = useState<LoadAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDark = variant === 'dark'
  const canAnalyze = rate > 0 && miles > 0

  useEffect(() => {
    if (!canAnalyze) {
      setAnalysis(null)
      setError(null)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await loadAnalyzerApi.analyzeLoad({
          rate,
          miles,
          deadheadMiles: deadheadMiles ?? 0,
        })
        setAnalysis(result)
      } catch (err) {
        setAnalysis(null)
        setError(err instanceof ApiClientError ? err.message : 'Failed to analyze load')
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [rate, miles, deadheadMiles, canAnalyze])

  if (!canAnalyze) {
    return null
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? 'border-surface-800 bg-surface-950' : 'border-surface-200 bg-surface-50'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          AI load analyzer
        </p>
        {loading && <span className="text-xs text-slate-400">Analyzing...</span>}
      </div>

      {error && (
        <p className={`text-sm ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>
      )}

      {analysis && !loading && (
        <div className="space-y-3">
          <div
            className={`rounded-lg border px-4 py-3 ${recommendationStyles(analysis.recommendation, variant)}`}
          >
            <p className="text-sm font-semibold">{recommendationLabel(analysis.recommendation)}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Rate per mile</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(analysis.ratePerMile)}/mi
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Profitability score</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {analysis.profitabilityScore}/100
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Load grade</p>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${gradeStyles(analysis.loadGrade, variant)}`}
              >
                {analysis.loadGrade}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
