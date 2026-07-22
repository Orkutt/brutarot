// src/hooks/useTripleSpread.ts
import { useState } from 'react'
import { TripleSpreadResult } from '../types'
import { API_URL } from '../constants'

type Phase = 'idle' | 'loading' | 'revealing' | 'done' | 'error'

export function useTripleSpread() {
  const [result, setResult]          = useState<TripleSpreadResult | null>(null)
  const [phase, setPhase]            = useState<Phase>('idle')
  const [revealedCount, setRevealed] = useState(0)
  const [error, setError]            = useState<string | null>(null)

  const draw = async (context: string, deck = 'classic') => {
    setResult(null)
    setRevealed(0)
    setPhase('loading')
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/api/draw-triple?context=${context}&deck=${deck}`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      )
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)
      const data: TripleSpreadResult = await res.json()
      setResult(data)
      setPhase('revealing')
      setTimeout(() => setRevealed(1), 100)
      setTimeout(() => setRevealed(2), 1200)
      setTimeout(() => setRevealed(3), 2400)
      setTimeout(() => setPhase('done'), 3000)
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