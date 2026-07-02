// src/hooks/useDrawCard.ts
import { useState } from 'react'
import { TarotCard } from '../types'

// Адрес бэкенда — при разработке localhost, на проде заменишь через .env
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type Status = 'idle' | 'loading' | 'flipping' | 'done' | 'error'

export function useDrawCard() {
  const [card, setCard] = useState<TarotCard | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const draw = async () => {
    // Сбрасываем предыдущую карту перед новым запросом
    setCard(null)
    setStatus('loading')
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/draw-card`)
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)
      const data: TarotCard = await res.json()

      setCard(data)
      setStatus('flipping')  // карта получена — начинаем анимацию

      // После анимации (700ms) показываем текст
      setTimeout(() => setStatus('done'), 800)

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка')
      setStatus('error')
    }
  }

  const reset = () => {
    setCard(null)
    setStatus('idle')
    setError(null)
  }

  return { card, status, error, draw, reset }
}