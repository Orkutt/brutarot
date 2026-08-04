// src/hooks/useCelticInterpret.ts
import { useState } from 'react'
import { TarotCard } from '../types'
import { API_URL } from '../constants'
import { getTelegramUserId } from '../utils/telegram'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function useCelticInterpret() {
  const [summary, setSummary] = useState('')
  const [status, setStatus]   = useState<Status>('idle')

  const interpret = async (
    cards: TarotCard[],
    combos: Record<string, string>,
    crossRequest: string
  ) => {
    setStatus('loading')
    setSummary('')
    try {
      const res = await fetch(`${API_URL}/api/interpret-celtic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ cards, combos, cross_request: crossRequest }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setSummary(data.summary)
      setStatus('done')

      // Отправляем в чат с ботом
      const userId = getTelegramUserId()
      if (userId && data.summary) {
        const cardsLine = cards
          .map((c, i) => `${i + 1}. ${c.name_ru}${c.reversed ? ' (пер.)' : ''}`)
          .join('\n')
        fetch(`${API_URL}/api/send-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            user_id: userId,
            cards,
            summary: `🌿 Кельтский крест\nВопрос: ${crossRequest}\n\n${cardsLine}\n\n${data.summary}`,
          }),
        }).catch(console.error)
      }
    } catch (e) {
      setStatus('error')
    }
  }

  const reset = () => { setSummary(''); setStatus('idle') }
  return { summary, status, interpret, reset }
}