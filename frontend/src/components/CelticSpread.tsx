// src/components/CelticSpread.tsx
import { useState } from 'react'
//import { useEffect } from 'react'
import { useCelticSpread } from '../hooks/useCelticSpread'
//import { useCelticInterpret } from '../hooks/useCelticInterpret'
import { useDeck } from '../store/deckStore'
import CelticRequestScreen from './CelticRequestScreen'
import MixingScreen from './MixingScreen'
import CelticCard from './CelticCard'

interface Props {
  onBack: () => void
}

type SubScreen = 'request' | 'mixing' | 'spread'

export default function CelticSpread({ onBack }: Props) {
  const [subScreen, setSubScreen]       = useState<SubScreen>('request')
  const [crossRequest, setCrossRequest] = useState('')
  const { deck } = useDeck()
  const { result, phase, revealedCount, error, draw, reset } = useCelticSpread()

  // LLM закомментирован пока шлифуем интерфейс
  // const { summary, status: llmStatus, interpret, reset: resetLlm } = useCelticInterpret()

  const isDone      = phase === 'done'
  const isRevealing = phase === 'revealing' || phase === 'done'
  const isLoading   = phase === 'loading'

  // useEffect(() => {
  //   if (isDone && result && crossRequest) {
  //     interpret(result.cards, result.combos, crossRequest)
  //   }
  // }, [isDone])

  const handleRequestSubmit = (req: string) => {
    setCrossRequest(req)
    setSubScreen('mixing')
  }

  const handleCardsSelected = () => {
    setSubScreen('spread')
    draw(deck.key)
  }

  const handleReset = () => {
    reset()
    // resetLlm()
    setSubScreen('request')
    setCrossRequest('')
  }

  if (subScreen === 'request') {
    return <CelticRequestScreen onSubmit={handleRequestSubmit} onBack={onBack}/>
  }

  // Один веер — 10 карт сразу, без батчей
  if (subScreen === 'mixing') {
    return (
      <MixingScreen
        mode="celtic"
        totalNeededOverride={10}
        onCardSelected={handleCardsSelected}
        onBack={() => setSubScreen('request')}
      />
    )
  }

  // Расклад
  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      <header className="relative flex items-center px-4 pt-6 pb-3">
        <button onClick={handleReset} className="absolute left-4 text-sm"
                style={{ color: 'var(--text-secondary)' }}>←</button>
        <h1 className="text-lg font-semibold flex-1 text-center"
            style={{ color: 'var(--accent-light)' }}>
          Кельтский крест
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-3 pb-10 gap-4">

        {isLoading && (
          <div className="flex flex-col items-center gap-3 mt-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: 'var(--border-accent)' }}/>
            <p className="text-sm" style={{ color: 'var(--accent-main)' }}>
              Раскладываем карты...
            </p>
          </div>
        )}

        {result && isRevealing && (
          <>
            {/* Запрос */}
            <div className="w-full max-w-sm rounded-xl p-2.5 border text-xs"
                 style={{ background: 'var(--bg-secondary)',
                          borderColor: 'var(--border-main)',
                          color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-light)' }}>Вопрос: </span>
              {crossRequest}
            </div>

            {/*
              ВЕРСТКА КЕЛЬТСКОГО КРЕСТА
              Используем CSS grid — левая часть (крест) + правая (посох) рядом.
              Крест: 3 колонки × 3 строки, посох: 1 колонка × 4 строки
            */}
            <div className="flex gap-8 justify-center w-full max-w-sm items-center">

              {/* КРЕСТ — левая часть */}
              <div
                className="grid flex-shrink-0"
                style={{
                  gridTemplateColumns: 'repeat(3, 52px)',
                  gridTemplateRows: 'repeat(3, 72px)',
                  gap: '4px',
                }}
              >
                {/* Строка 1: пусто, карта 3 (Подсказка), пусто */}
                <div/>
                {result.cards[2] && (
                  <CelticCard card={result.cards[2]} index={2}
                              revealed={revealedCount > 2}/>
                )}
                <div/>

                {/* Строка 2: карта 5 (Прошлое), карты 1+2 (центр), карта 6 (Будущее) */}
                {result.cards[4] && (
                  <CelticCard card={result.cards[4]} index={4}
                              revealed={revealedCount > 4}/>
                )}
                {/* Центральная ячейка — карты 1 и 2 поверх друг друга */}
                <div className="relative flex items-center justify-center">
                  {result.cards[0] && (
                    <div className="absolute">
                      <CelticCard card={result.cards[0]} index={0}
                                  revealed={revealedCount > 0}/>
                    </div>
                  )}
                  {result.cards[1] && (
                    <div className="absolute"
                         style={{ transform: 'rotate(90deg)', zIndex: 5 }}>
                      <CelticCard card={result.cards[1]} index={1}
                                  revealed={revealedCount > 1}
                                  isSecondCard/>
                    </div>
                  )}
                </div>
                {result.cards[5] && (
                  <CelticCard card={result.cards[5]} index={5}
                              revealed={revealedCount > 5}/>
                )}

                {/* Строка 3: пусто, карта 4 (Истоки), пусто */}
                <div/>
                {result.cards[3] && (
                  <CelticCard card={result.cards[3]} index={3}
                              revealed={revealedCount > 3}/>
                )}
                <div/>
              </div>

              {/* ПОСОХ — правая колонка: 10, 9, 8, 7 сверху вниз */}
              <div
                className="flex flex-col flex-shrink-0"
                style={{ gap: '4px' }}
              >
                {[9, 8, 7, 6].map(i => (
                  result.cards[i] && (
                    <CelticCard key={i} card={result.cards[i]} index={i}
                                revealed={revealedCount > i}/>
                  )
                ))}
              </div>

            </div>

            {/* Поле LLM — пока заглушка */}
            {isDone && (
              <>
                <div className="w-full max-w-sm rounded-xl p-4 border min-h-[80px]"
                     style={{ background: 'var(--bg-secondary)',
                              borderColor: 'var(--border-main)' }}>
                  <p className="text-xs uppercase tracking-wider mb-2"
                     style={{ color: 'var(--text-primary)' }}>
                    Совет Карт
                  </p>
                  <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                    Интерпретация от ИИ появится здесь...
                  </p>
                </div>

                <button onClick={handleReset}
                  className="w-full max-w-sm py-2.5 rounded-xl border text-sm
                             hover:brightness-110 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--border-accent)',
                           background: 'var(--tag-bg)',
                           color: 'var(--text-primary)' }}>
                  Новый расклад
                </button>
              </>
            )}
          </>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 mt-10 text-center">
            <p className="text-sm" style={{ color: 'var(--accent-main)' }}>{error}</p>
            <button onClick={handleReset}
              className="px-6 py-2 rounded-xl text-sm"
              style={{ background: 'var(--accent-main)', color: 'var(--text-primary)' }}>
              Попробовать снова
            </button>
          </div>
        )}
      </main>
    </div>
  )
}