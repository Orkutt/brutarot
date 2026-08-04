// src/components/MixingScreen.tsx
import { useState, useEffect } from 'react'
import { useDeck } from '../store/deckStore'
import { API_URL } from '../constants'
import { SpreadMode } from '../types'

interface Props {
  mode: SpreadMode
  onCardSelected: (indices: number[]) => void
  onBack: () => void
  totalNeededOverride?: number
}

const TOTAL_CARDS = 20
const totalNeeded = (mode: SpreadMode, override?: number) =>
  override ?? (mode === 'single' ? 1 : 3)

const ANGLES = Array.from({ length: TOTAL_CARDS }, (_, i) => {
  const spread = 92
  return -spread / 2 + (spread / (TOTAL_CARDS - 1)) * i
})

export default function MixingScreen({ mode, onCardSelected, onBack, totalNeededOverride }: Props) {
  const { deck } = useDeck()
  const coverUrl = `${API_URL}/cards/${deck.cover}`

  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [chosen, setChosen]           = useState<number[]>([])
  // fanned: когда true — карты на своих углах, когда false — все в стартовой позиции
  const [fanned, setFanned]           = useState(false)

  const needed = totalNeeded(mode, totalNeededOverride)

  // Запускаем анимацию раскрытия через 100ms после маунта
  useEffect(() => {
    const t = setTimeout(() => setFanned(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleCardClick = (idx: number) => {
    if (chosen.includes(idx)) return
    if (highlighted === idx) {
      const newChosen = [...chosen, idx]
      setChosen(newChosen)
      setHighlighted(null)
      if (newChosen.length >= needed) {
        setTimeout(() => onCardSelected(newChosen), 400)
      }
    } else {
      setHighlighted(idx)
    }
  }

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      <header className="flex items-center px-4 pt-6 pb-3">
        <button onClick={onBack} className="absolute left-4 text-sm"
                style={{ color: 'var(--text-secondary)' }}>
          ← Назад
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center"
            style={{ color: 'var(--accent-light)' }}>
          {mode === 'single' ? 'Одна карта' : mode === 'triple' ? 'Триплет' : 'Кельтский крест'}
        </h1>
      </header>

      {/* Подсказка */}
      <div className="text-center px-4 mt-1 min-h-[40px]">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {chosen.length === 0 && highlighted === null && 'Выбери карту из веера'}
          {highlighted !== null && 'Нажми ещё раз, чтобы взять карту'}
          {highlighted === null && chosen.length > 0 && chosen.length < needed &&
            `Выбрано ${chosen.length} из ${needed} — выбери следующую`}
        </p>

        {/* Счётчик и точки для celtic */}
        {needed > 3 && (
          <div className="mt-1">
            <p className="text-xs font-medium"
               style={{ color: 'var(--accent-light)' }}>
              Осталось: {needed - chosen.length}
            </p>
            <div className="flex gap-1 justify-center mt-1 flex-wrap max-w-xs mx-auto">
              {Array.from({ length: needed }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                     style={{
                       background: i < chosen.length
                         ? 'var(--accent-main)'
                         : 'var(--border-main)'
                     }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Слоты (триплет) */}
      {mode === 'triple' && (
        <div className="flex justify-center gap-3 px-4 mt-2">
          {Array.from({ length: 3 }).map((_, i) => {
            const isFilled = i < chosen.length
            return (
              <div key={i}
                className="w-16 h-24 rounded-xl border-2 border-dashed flex items-center
                           justify-center transition-all duration-500 overflow-hidden"
                style={{
                  borderColor: isFilled ? 'var(--border-accent)' : 'var(--tag-border)',
                  background: isFilled ? 'var(--tag-bg)' : 'var(--bg-secondary)',
                }}
              >
                {isFilled
                  ? <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-80"/>
                  : <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                }
              </div>
            )
          })}
        </div>
      )}

      {/* Веер карт */}
      <div className="fan-section">
        <div className="fan-hand">
          {ANGLES.map((angle, idx) => {
            const isChosen      = chosen.includes(idx)
            const isHighlighted = highlighted === idx

            // Стартовый угол — все карты начинают из крайней левой позиции
            const startAngle = ANGLES[0]
            // Финальный угол — свой угол в веере
            const currentAngle = fanned ? angle : startAngle
            // Задержка для каждой карты — чем правее, тем позже
            const delay = fanned ? idx * 28 : 0

            return (
              <button
                key={idx}
                className="fan-card"
                onClick={() => handleCardClick(idx)}
                disabled={isChosen}
                data-highlighted={isHighlighted ? 'true' : undefined}
                style={{
                  '--a': `${currentAngle}deg`,
                  '--delay': `${delay}ms`,
                  zIndex: isHighlighted ? 30 : isChosen ? 1 : 10 + idx,
                } as React.CSSProperties}
              >
                {!isChosen && (
                  <img src={coverUrl} alt="Карта" className="fan-card__img"
                       style={{ opacity: isHighlighted ? 1 : 0.92 }}/>
                )}
                {isChosen && (
                  <div className="fan-card__chosen"><span>✓</span></div>
                )}
                {isHighlighted && <div className="fan-card__glow"/>}
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        .fan-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          perspective: 900px;
        }

        .fan-hand {
          position: relative;
          width: 220px;
          height: 280px;
          margin-bottom: 40px;
        }

        .fan-card {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 90px;
          height: 130px;
          margin-left: -45px;
          border: none;
          cursor: pointer;
          border-radius: 10px;
          overflow: hidden;
          padding: 0;
          background: #1e1b4b;
          box-shadow: 0 12px 28px -12px rgba(0,0,0,0.8);
          transform-origin: 50% 140%;

          /* Анимация раскрытия веера + hover/tap */
          transition:
            transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1) var(--delay, 0ms),
            box-shadow 0.3s,
            opacity 0.3s;

          transform: rotate(var(--a));
        }

        /* После раскрытия — hover работает поверх transition */
        .fan-card[data-highlighted="true"] {
          transform: rotate(var(--a)) translateY(-52px) scale(1.08);
          box-shadow: 0 28px 48px -16px rgba(0,0,0,0.15),
                      0 0 0 2px rgba(0,0,0,0.15);
          /* Без задержки для интерактивных состояний */
          transition:
            transform 0.35s cubic-bezier(0.3, 0.9, 0.3, 1) 0ms,
            box-shadow 0.3s 0ms;
        }

        .fan-card:disabled {
          transform: rotate(var(--a)) translateY(20px);
          opacity: 0.25;
          cursor: default;
          box-shadow: none;
          transition:
            transform 0.35s cubic-bezier(0.3, 0.9, 0.3, 1) 0ms,
            opacity 0.3s 0ms;
        }

        .fan-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
          display: block;
          pointer-events: none;
        }

        .fan-card__chosen {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.15);
          color: rgba(0,0,0,0.15);
          font-size: 28px;
        }

        .fan-card__glow {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: rgba(0,0,0,0.15);
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .fan-card {
            transition: box-shadow 0.2s, opacity 0.2s;
          }
        }
      `}</style>
    </div>
  )
}