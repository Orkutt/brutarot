// src/App.tsx
import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { useDrawCard } from './hooks/useDrawCard'
import TarotCard from './components/TarotCard'
import CardInterpretation from './components/CardInterpretation'

export default function App() {
  const { card, status, error, draw, reset } = useDrawCard()

  // Сообщаем Telegram что приложение готово — убирает экран загрузки
  useEffect(() => {
    WebApp.ready()
    WebApp.expand() // раскрываем на весь экран
  }, [])

  const isLoading  = status === 'loading'
  const isFlipping = status === 'flipping' || status === 'done'
  const isDone     = status === 'done'
  const isIdle     = status === 'idle'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Шапка */}
      <header className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl font-semibold tracking-wide text-purple-300">
          ✦ Таро
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Карта дня
        </p>
      </header>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pb-8">

        {/* Состояние: ожидание — показываем колоду */}
        {isIdle && (
          <div className="flex flex-col items-center gap-8 mt-8">
            <div
              onClick={draw}
              className="deck-glow w-52 h-80 rounded-2xl cursor-pointer
                         bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900
                         border-2 border-purple-700 flex items-center justify-center
                         active:scale-95 transition-transform select-none"
            >
              <div className="text-center">
                <div className="text-6xl mb-3">🔮</div>
                <p className="text-purple-400 text-sm">Нажми чтобы<br/>вытащить карту</p>
              </div>
            </div>
          </div>
        )}

        {/* Состояние: загрузка */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="w-52 h-80 rounded-2xl bg-slate-900 border-2 border-purple-800
                            flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
                                rounded-full animate-spin"/>
                <p className="text-purple-400 text-sm">Тасуем колоду...</p>
              </div>
            </div>
          </div>
        )}

        {/* Состояние: карта получена — показываем анимацию и интерпретацию */}
        {card && isFlipping && (
          <>
            <TarotCard card={card} flipped={isFlipping} />

            {isDone && (
              <>
                <CardInterpretation card={card} />
                <button
                  onClick={reset}
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

        {/* Состояние: ошибка */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 mt-8 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
            <button
              onClick={reset}
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