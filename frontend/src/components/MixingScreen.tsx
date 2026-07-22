// src/components/MixingScreen.tsx
import { useState } from 'react'
import { COVER_URL } from '../constants'
import { SpreadMode } from '../types'

interface Props {
  mode: SpreadMode
  onCardSelected: (indices: number[]) => void  // индексы выбранных карт
  onBack: () => void
}

type Phase = 'idle' | 'mixing' | 'selecting'

const CARD_COUNT = 3  // всегда показываем 3 карты на выбор

export default function MixingScreen({ mode, onCardSelected, onBack }: Props) {
  const [phase, setPhase]           = useState<Phase>('idle')
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [chosen, setChosen]           = useState<number[]>([])  // уже добавленные в расклад
  const totalNeeded = mode === 'single' ? 1 : 3

  const handleMix = () => {
    if (phase !== 'idle') return
    setPhase('mixing')
    setHighlighted(null)
    // После анимации перемешивания (1.5с) → фаза выбора
    setTimeout(() => setPhase('selecting'), 1500)
  }

  const handleCardClick = (idx: number) => {
    if (phase !== 'selecting') return
    if (chosen.includes(idx)) return  // уже добавлена

    if (highlighted === idx) {
      // Второе нажатие — добавляем карту в расклад
      const newChosen = [...chosen, idx]
      setChosen(newChosen)
      setHighlighted(null)

      if (newChosen.length >= totalNeeded) {
        // Все карты выбраны — переходим на экран расклада
        setTimeout(() => onCardSelected(newChosen), 400)
      } else {
        // Нужна ещё карта — возвращаемся к перемешиванию
        setTimeout(() => {
          setPhase('idle')
        }, 500)
      }
    } else {
      // Первое нажатие — подсвечиваем
      setHighlighted(idx)
    }
  }

  const needsMoreCards = chosen.length < totalNeeded
  const canMix = phase === 'idle'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      <header className="flex items-center px-4 pt-6 pb-3 gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">
          ← Назад
        </button>
        <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center pr-8">
          {mode === 'single' ? '✦ Одна карта' : '✦ Триплет'}
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-8 gap-6">

        {/* Подсказка */}
        <p className="text-slate-400 text-sm text-center mt-2">
          {phase === 'idle' && chosen.length === 0 && 'Перемешай колоду и выбери карту'}
          {phase === 'idle' && chosen.length > 0 && `Выбрано ${chosen.length} из ${totalNeeded}. Перемешай снова`}
          {phase === 'mixing' && 'Колода перемешивается...'}
          {phase === 'selecting' && highlighted === null && 'Нажми на карту, чтобы выбрать'}
          {phase === 'selecting' && highlighted !== null && 'Нажми ещё раз, чтобы добавить в расклад'}
        </p>

        {/* Колода */}
        <div className={`relative w-36 h-56 ${phase === 'mixing' ? 'animate-mixing' : ''}`}>

          {/* Стопка карт (иллюзия глубины) */}
          {[3, 2, 1].map(offset => (
            <div
              key={offset}
              className="absolute rounded-xl border border-purple-800/50"
              style={{
                top: -offset * 2,
                left: offset * 1,
                width: '100%',
                height: '100%',
                background: '#1e1b4b',
                zIndex: offset,
              }}
            />
          ))}

          {/* Верхняя карта — рубашка */}
          <div
            className="absolute w-full h-full rounded-xl overflow-hidden border-2 border-purple-700"
            style={{ zIndex: 4 }}
          >
            <img
              src={COVER_URL}
              alt="Колода"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Анимация перемешивания — карты летают */}
          {phase === 'mixing' && (
            <>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="absolute w-full h-full rounded-xl overflow-hidden
                             border-2 border-purple-500"
                  style={{
                    zIndex: 10 + i,
                    animation: `shuffle${i} 1.5s ease-in-out forwards`,
                    background: '#1e1b4b',
                  }}
                >
                  <img src={COVER_URL} alt="" className="w-full h-full object-cover opacity-80"/>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Три карты на выбор — появляются в фазе selecting */}
        {phase === 'selecting' && (
          <div className="flex gap-3 justify-center mt-2">
            {Array.from({ length: CARD_COUNT }).map((_, idx) => {
              const isChosen      = chosen.includes(idx)
              const isHighlighted = highlighted === idx

              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`
                    relative w-20 h-32 rounded-xl overflow-hidden cursor-pointer
                    border-2 transition-all duration-300 select-none
                    ${isChosen
                      ? 'opacity-30 border-slate-700 cursor-default'
                      : isHighlighted
                        ? 'border-yellow-400 shadow-lg shadow-yellow-500/40 scale-105 -translate-y-3'
                        : 'border-purple-600 hover:border-purple-400 hover:-translate-y-2'
                    }
                  `}
                  style={{
                    // Карты чуть выдвинуты из "колоды" — разные углы
                    transform: isHighlighted
                      ? 'translateY(-12px) scale(1.05)'
                      : isChosen
                        ? 'translateY(0)'
                        : `translateY(-8px) rotate(${(idx - 1) * 4}deg)`,
                  }}
                >
                  <img
                    src={COVER_URL}
                    alt="Карта"
                    className="w-full h-full object-cover"
                  />
                  {isHighlighted && (
                    <div className="absolute inset-0 bg-yellow-400/10 flex items-end
                                    justify-center pb-2">
                      <span className="text-yellow-300 text-xs">✓ ещё раз</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Кнопка перемешать */}
        <button
          onClick={handleMix}
          disabled={!canMix}
          className={`
            px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300
            ${canMix && needsMoreCards
              ? 'bg-purple-700 text-white deck-glow hover:bg-purple-600 active:scale-95'
              : canMix && !needsMoreCards
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-purple-900/40 text-purple-600 cursor-not-allowed'
            }
          `}
        >
          {phase === 'mixing' ? '⟳ Перемешиваем...' : '🔀 Перемешать колоду'}
        </button>

        {/* Рамки-слоты для выбранных карт (только для триплета) */}
        {mode === 'triple' && (
          <div className="flex gap-3 mt-2">
            {Array.from({ length: 3 }).map((_, i) => {
              const isFilled = i < chosen.length
              return (
                <div
                  key={i}
                  className={`
                    w-20 h-32 rounded-xl border-2 border-dashed flex items-center
                    justify-center transition-all duration-500
                    ${isFilled
                      ? 'border-purple-500 bg-purple-950/50'
                      : 'border-slate-700 bg-slate-900/30'
                    }
                  `}
                >
                  {isFilled ? (
                    <img
                      src={COVER_URL}
                      alt="Выбранная карта"
                      className="w-full h-full object-cover rounded-xl opacity-80"
                    />
                  ) : (
                    <span className="text-slate-600 text-xs text-center px-1">
                      {i + 1}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* CSS анимации перемешивания */}
      <style>{`
        @keyframes shuffle0 {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          30%  { transform: translate(-60px, -20px) rotate(-15deg); opacity: 0.9; }
          60%  { transform: translate(40px, -10px) rotate(10deg); opacity: 0.9; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        }
        @keyframes shuffle1 {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          30%  { transform: translate(50px, -30px) rotate(12deg); opacity: 0.9; }
          60%  { transform: translate(-30px, -15px) rotate(-8deg); opacity: 0.9; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        }
        @keyframes shuffle2 {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          30%  { transform: translate(-20px, -40px) rotate(8deg); opacity: 0.9; }
          60%  { transform: translate(60px, -5px) rotate(-12deg); opacity: 0.9; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}