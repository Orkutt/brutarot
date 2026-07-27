// src/App.tsx
import { useEffect, useState } from 'react'
import { Screen, ContextKey, CONTEXTS_SINGLE } from './types'
import { useDeck } from './store/deckStore'
import MainMenu from './components/MainMenu'
import ContextSelector from './components/ContextSelector'
import MixingScreen from './components/MixingScreen'
import TarotCard from './components/TarotCard'
import CardInterpretation from './components/CardInterpretation'
import TripleSpread from './components/TripleSpread'
import DeckSelector from './components/DeckSelector'
import { useDrawCard } from './hooks/useDrawCard'

type SingleSubScreen = 'context' | 'mixing' | 'spread'

export default function App() {
  const [screen, setScreen]         = useState<Screen>('menu')
  const [subScreen, setSubScreen]   = useState<SingleSubScreen>('context')
  const [context, setContext]       = useState<ContextKey | null>(null)
  const { deck } = useDeck()
  const { card, status, error, draw, reset } = useDrawCard()

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (webApp) { webApp.ready(); webApp.expand() }
  }, [])

  const handleBackToMenu = () => {
    setScreen('menu')
    setSubScreen('context')
    setContext(null)
    reset()
  }

  const handleMixingDone = () => {
    if (!context) return
    setSubScreen('spread')
    draw(context, deck.key)
  }

  const isFlipping = status === 'flipping' || status === 'done'
  const isDone     = status === 'done'

    // Выбор колоды
  if (screen === 'settings') {
    return <DeckSelector onBack={() => setScreen('menu')} />
  }


  // Главное меню
  if (screen === 'menu') {
    return (
      <MainMenu
        onSelect={setScreen}
        onSettings={() => setScreen('settings')}
      />
    )
  }

  // Триплет
  if (screen === 'triple') {
    return <TripleSpread onBack={handleBackToMenu} />
  }

  // Кельтский крест — заглушка
  if (screen === 'celtic') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center
                      justify-center gap-4">
        <p className="text-2xl">✝</p>
        <p className="text-purple-300 text-lg font-medium">Кельтский крест</p>
        <p className="text-slate-500 text-sm">Раздел в разработке</p>
        <button
          onClick={handleBackToMenu}
          className="mt-4 px-6 py-2 rounded-xl border border-slate-700
                     text-slate-400 text-sm hover:border-purple-700 hover:text-purple-300
                     transition-all"
        >
          ← Назад
        </button>
      </div>
    )
  }

  // Одна карта
  if (subScreen === 'context') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="relative flex items-center px-4 pt-6 pb-3 gap-3">
          <button onClick={handleBackToMenu}
            className="absolute left-4 text-slate-400 hover:text-white text-sm">← Назад</button>
          <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center">
            Одна карта
          </h1>
        </header>
        <main className="flex-1 px-4 pb-10">
          <ContextSelector
            contexts={CONTEXTS_SINGLE}
            selected={context}
            onChange={setContext}
            onDraw={() => context && setSubScreen('mixing')}
          />
        </main>
      </div>
    )
  }

  // Одна карта — перемешивание
  if (subScreen === 'mixing') {
    return (
      <MixingScreen
        mode="single"
        onCardSelected={handleMixingDone}
        onBack={() => setSubScreen('context')}
      />
    )
  }

  // Экран расклада одной карты
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="relative flex items-center px-4 pt-6 pb-3 gap-3">
        <button onClick={() => { reset(); setSubScreen('context') }}
          className="absolute left-4 text-slate-400 hover:text-white text-sm">← Сначала</button>
        <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center">
          Одна карта
        </h1>
      </header>
      <main className="flex-1 flex flex-col items-center px-4 pb-10">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 mt-10">
            <div className="w-60 h-96 rounded-2xl bg-slate-900 border-2 border-purple-800
                            flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
                                rounded-full animate-spin"/>
                <p className="text-purple-400 text-sm">Раскрываем карту...</p>
              </div>
            </div>
          </div>
        )}
        {card && isFlipping && (
          <>
            <div className="mt-4">
              <TarotCard card={card} flipped={isFlipping} />
            </div>
            {isDone && (
              <>
                <CardInterpretation card={card} />
                <button
                  onClick={() => { reset(); setSubScreen('context'); setContext(null) }}
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
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 mt-10 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
            <button onClick={() => { reset(); setSubScreen('context') }}
              className="px-6 py-2 rounded-xl bg-purple-800 text-white text-sm">
              Попробовать снова
            </button>
          </div>
        )}
      </main>
    </div>
  )
}