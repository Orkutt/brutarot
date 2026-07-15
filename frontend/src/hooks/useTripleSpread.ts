// src/hooks/useTripleSpread.ts
import { useState } from 'react'
import { TripleSpreadResult } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Сколько карт показано пользователю прямо сейчас (0, 1, 2, 3)
type Phase = 'idle' | 'loading' | 'revealing' | 'done' | 'error'

export function useTripleSpread() {
  const [result, setResult]           = useState<TripleSpreadResult | null>(null)
  const [phase, setPhase]             = useState<Phase>('idle')
  const [revealedCount, setRevealed]  = useState(0)   // 0→1→2→3
  const [error, setError]             = useState<string | null>(null)

  const draw = async (context: string) => {
    setResult(null)
    setRevealed(0)
    setPhase('loading')
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/draw-triple?context=${context}`)
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)
      const data: TripleSpreadResult = await res.json()
      setResult(data)
      setPhase('revealing')

      // Открываем карты с задержкой: 1-я сразу, 2-я через 1.2с, 3-я через 2.4с
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
    setResult(null)
    setPhase('idle')
    setRevealed(0)
    setError(null)
  }

  return { result, phase, revealedCount, error, draw, reset }
}