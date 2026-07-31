// src/hooks/useInterpret.ts
import { useState } from 'react'
import { TarotCard } from '../types'
import { API_URL } from '../constants'
import { getTelegramUserId } from '../utils/telegram'

type InterpretStatus = 'idle' | 'loading' | 'done' | 'error'

export function useInterpret() {
  const [summary, setSummary]     = useState<string>('')
  const [status, setStatus]       = useState<InterpretStatus>('idle')
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

      // Диагностика отправки в чат
      const userId = getTelegramUserId()
      console.log('🔑 user_id:', userId)
      console.log('📝 summary length:', data.summary?.length)
      console.log('🌐 API_URL:', API_URL)

      if (!userId) {
        console.warn('⚠️ userId is null — приложение открыто не в Telegram или initDataUnsafe недоступен')
        return
      }

      if (!data.summary) {
        console.warn('⚠️ summary пустой — не отправляем')
        return
      }

      console.log('📤 Отправляем запрос на /api/send-result...')
      try {
        const sendRes = await fetch(`${API_URL}/api/send-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ user_id: userId, cards, summary: data.summary }),
        })
        const sendData = await sendRes.json()
        console.log('📬 Ответ /api/send-result:', sendData)
        if (!sendRes.ok) {
          console.error('❌ send-result вернул ошибку:', sendRes.status, sendData)
        }
      } catch (sendErr) {
        console.error('❌ Ошибка fetch к /api/send-result:', sendErr)
      }

    } catch (e) {
      console.error('❌ Ошибка interpret:', e)
      setStatus('error')
    }
  }

  const reset = () => { setSummary(''); setStatus('idle'); setFromCache(false) }

  return { summary, status, fromCache, interpret, reset }
}