// src/App.tsx
import { useEffect, useState } from 'react'
import { useDrawCard } from './hooks/useDrawCard'
import { ContextKey } from './types'
import ContextSelector from './components/ContextSelector'
import TarotCard from './components/TarotCard'
import CardInterpretation from './components/CardInterpretation'

export default function App() {
  const { card, status, error, draw, reset } = useDrawCard()
  const [context, setContext] = useState<ContextKey | null>(null)

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (webApp) {
      webApp.ready()
      webApp.expand()
    } else {
      console.warn('⚠️ Приложение запущено не в Telegram — WebApp недоступен')
    }
  }, [])

  const handleDraw = () => {
    if (context) draw(context)
  }

  const handleReset = () => {
    reset()
    // контекст оставляем выбранным — удобно гадать снова на ту же тему
  }

  const isIdle     = status === 'idle'
  const isLoading  = status === 'loading'
  const isFlipping = status === 'flipping' || status === 'done'
  const isDone     = status === 'done'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      <header className="text-center pt-7 pb-3 px-4">
        <h1 className="text-2xl font-semibold tracking-wide text-purple-300">
          ✦ У ведьмы-гадалки ✦
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-10">

        {/* Экран выбора темы + кнопка тянуть */}
        {isIdle && (
          <ContextSelector
            selected={context}
            onChange={setContext}
            onDraw={handleDraw}
          />
        )}

        {/* Загрузка */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 mt-10">
            <div className="w-60 h-96 rounded-2xl bg-slate-900 border-2 border-purple-800
                            flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
                                rounded-full animate-spin"/>
                <p className="text-purple-400 text-sm">Тасуем колоду...</p>
              </div>
            </div>
          </div>
        )}

        {/* Карта + интерпретация */}
        {card && isFlipping && (
          <>
            <div className="mt-4">
              <TarotCard card={card} flipped={isFlipping} />
            </div>

            {isDone && (
              <>
                <CardInterpretation card={card} />
                <button
                  onClick={handleReset}
                  className="mt-6 px-6 py-2.5 rounded-xl border border-purple-700
                             text-purple-300 text-sm hover:bg-purple-900/40
                             active:scale-95 transition-all"
                >
                  Вытащить ещё раз
                </button>
              </>
            )}
          </>
        )}

        {/* Ошибка */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 mt-10 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-xl bg-purple-800 text-white text-sm"
            >
              Попробовать снова
            </button>
          </div>
        )}

      </main>
    </div>
  )
}