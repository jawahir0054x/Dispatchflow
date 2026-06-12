import { useEffect, useState, type FormEvent } from 'react'
import * as deadheadApi from '../api/deadhead'
import { ApiClientError } from '../api/client'
import { FormField, TextInput } from './FormField'
import type { Driver } from '../types'

interface DeadheadCalculatorProps {
  drivers: Driver[]
  selectedDriverId: number | null
  pickupCity: string
  onApply: (deadheadMiles: number) => void
  variant?: 'light' | 'dark'
}

export function DeadheadCalculator({
  drivers,
  selectedDriverId,
  pickupCity,
  onApply,
  variant = 'dark',
}: DeadheadCalculatorProps) {
  const [currentLocation, setCurrentLocation] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    deadheadMiles: number
    resolvedCurrentLocation: string
    resolvedPickupLocation: string
  } | null>(null)

  const isDark = variant === 'dark'

  useEffect(() => {
    const driver = drivers.find((item) => item.id === selectedDriverId)
    if (driver?.currentLocation) {
      setCurrentLocation(driver.currentLocation)
    }
  }, [selectedDriverId, drivers])

  useEffect(() => {
    if (pickupCity.trim()) {
      setPickupLocation(pickupCity.trim())
    }
  }, [pickupCity])

  async function handleCalculate(event: FormEvent) {
    event.preventDefault()
    setCalculating(true)
    setError(null)
    setResult(null)

    try {
      const response = await deadheadApi.calculateDeadhead({
        currentLocation: currentLocation.trim(),
        pickupLocation: pickupLocation.trim(),
      })
      setResult({
        deadheadMiles: response.deadheadMiles,
        resolvedCurrentLocation: response.resolvedCurrentLocation,
        resolvedPickupLocation: response.resolvedPickupLocation,
      })
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to calculate deadhead')
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? 'border-surface-800 bg-surface-950' : 'border-surface-200 bg-surface-50'
      }`}
    >
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        Deadhead calculator
      </p>

      <form className="space-y-3" onSubmit={handleCalculate}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Current truck location">
            <TextInput
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. Dallas, TX"
              required
            />
          </FormField>
          <FormField label="Pickup location">
            <TextInput
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Houston, TX"
              required
            />
          </FormField>
        </div>

        {error && (
          <p className={`text-sm ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>
        )}

        {result && (
          <div
            className={`rounded-lg border px-3 py-3 text-sm ${
              isDark ? 'border-surface-800 bg-surface-900' : 'border-surface-200 bg-white'
            }`}
          >
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {result.deadheadMiles.toLocaleString()} deadhead miles
            </p>
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {result.resolvedCurrentLocation} → {result.resolvedPickupLocation}
            </p>
            <button
              type="button"
              onClick={() => onApply(result.deadheadMiles)}
              className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                isDark
                  ? 'bg-brand-600 text-white hover:bg-brand-500'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              Use {result.deadheadMiles.toLocaleString()} mi for this load
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={calculating || !currentLocation.trim() || !pickupLocation.trim()}
          className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
            isDark
              ? 'bg-surface-800 text-slate-200 hover:bg-surface-700'
              : 'bg-surface-200 text-slate-700 hover:bg-surface-300'
          }`}
        >
          {calculating ? 'Calculating...' : 'Calculate deadhead'}
        </button>
      </form>
    </div>
  )
}
