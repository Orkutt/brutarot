// src/hooks/useInterpret.ts
import { useState } from 'react'
import { TarotCard } from '../types'
import { API_URL } from '../constants'
import { getTelegramUserId } from '../utils/telegram'

type InterpretStatus = 'idle' | 'loading' | 'done' | 'error'

export function useInterpret() {
  const [summary, setSummary]   = useState<string>('')
  const [status, setStatus]     = useState<InterpretStatus>('idle')
  const [fromCache, setFromCache] = useState(false)

  const interpret = async (
    cards: TarotCard[],
    combos: Record<string, string>,
    context: string
  ) => {
    setStatus('loading')
    setSummary('')

    try {
      const res = await fetch(`${API_URL}/api/interpret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ cards, combos, context }),
      })
      if (!res.ok) throw new Error(`Сервер вернул ${res.status}`)
      const data = await res.json()
      setSummary(data.summary)
      setFromCache(data.from_cache)
      setStatus('done')

      // Отправляем результат в чат с ботом
      const userId = getTelegramUserId()
      if (userId && data.summary) {
        fetch(`${API_URL}/api/send-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            user_id: userId,
            cards,
            summary: data.summary,
          }),
        }).catch(() => {
          // Тихо игнорируем — отправка в чат не критична
        })
      }
      
    } catch (e) {
      setStatus('error')
    }
  }

  const reset = () => { setSummary(''); setStatus('idle'); setFromCache(false) }

  return { summary, status, fromCache, interpret, reset }
}

