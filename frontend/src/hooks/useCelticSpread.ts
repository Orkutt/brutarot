// src/hooks/useCelticSpread.ts
import { useState } from 'react'
import { CelticSpreadResult } from '../types'
import { API_URL } from '../constants'

type Phase = 'idle' | 'loading' | 'revealing' | 'done' | 'error'

export function useCelticSpread() {
  const [result, setResult]          = useState<CelticSpreadResult | null>(null)
  const [phase, setPhase]            = useState<Phase>('idle')
  const [revealedCount, setRevealed] = useState(0)
  const [error, setError]            = useState<string | null>(null)

  const draw = async (deck = 'classic') => {
    setResult(null)
    setRevealed(0)
    setPhase('loading')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/draw-celtic?deck=${deck}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)
      const data: CelticSpreadResult = await res.json()
      setResult(data)
      setPhase('revealing')

      // Раскрываем по одной карте с задержкой 0.8с
      for (let i = 1; i <= 10; i++) {
        setTimeout(() => setRevealed(i), i * 800)
      }
      setTimeout(() => setPhase('done'), 10 * 800 + 300)

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка')
      setPhase('error')
    }
  }

  const reset = () => {
    setResult(null); setPhase('idle'); setRevealed(0); setError(null)
  }

  return { result, phase, revealedCount, error, draw, reset }
}