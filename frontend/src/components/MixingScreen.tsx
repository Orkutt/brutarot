// src/components/MixingScreen.tsx
import { useState } from 'react'
import { useDeck } from '../store/deckStore'
import { API_URL } from '../constants'
import { SpreadMode } from '../types'

interface Props {
  mode: SpreadMode
  onCardSelected: (indices: number[]) => void
  onBack: () => void
}

const TOTAL_CARDS = 20
const totalNeeded = (mode: SpreadMode) => mode === 'single' ? 1 : 3

// Распределяем углы веера: от -46deg до +46deg для 20 карт
const ANGLES = Array.from({ length: TOTAL_CARDS }, (_, i) => {
  const spread = 92  // общий угол веера в градусах
  return -spread / 2 + (spread / (TOTAL_CARDS - 1)) * i
})

export default function MixingScreen({ mode, onCardSelected, onBack }: Props) {
  const { deck } = useDeck()
  const coverUrl = `${API_URL}/cards/${deck.cover}`

  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [chosen, setChosen]           = useState<number[]>([])
  const needed = totalNeeded(mode)

  const handleCardClick = (idx: number) => {
    if (chosen.includes(idx)) return  // уже выбрана — игнорируем

    if (highlighted === idx) {
      // Второй тап — добавляем в расклад
      const newChosen = [...chosen, idx]
      setChosen(newChosen)
      setHighlighted(null)

      if (newChosen.length >= needed) {
        setTimeout(() => onCardSelected(newChosen), 400)
      }
    } else {
      // Первый тап — приподнимаем карту
      setHighlighted(idx)
    }
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      <header className="flex items-center px-4 pt-6 pb-3 gap-3">
        <button
          onClick={onBack}
          className="absolute left-4 transition-colors text-sm"
            style={{ color: 'var(--text-primary)' }}>
          ← Назад
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center"
          style={{ color: 'var(--accent-light)' }}>
          {mode === 'single' ? 'Одна карта' : 'Триплет'}
        </h1>
      </header>

      {/* Подсказка */}
      <div className="text-center px-4 mt-1 min-h-[36px]">
        <p className="text-sm"
          style={{ color: 'var(--text-secondary)' }}>
          {chosen.length === 0 && highlighted === null &&
            'Выбери карту из веера'}
          {highlighted !== null &&
            'Нажми ещё раз, чтобы взять карту'}
          {highlighted === null && chosen.length > 0 && chosen.length < needed &&
            `Выбрано ${chosen.length} из ${needed} — выбери следующую`}
        </p>
      </div>
      
            {/* Слоты для выбранных карт (триплет) */}
      {mode === 'triple' && (
        <div className="flex justify-center gap-3 px-4 mt-2">
          {Array.from({ length: 3 }).map((_, i) => {
            const isFilled = i < chosen.length
            return (
              <div
                key={i}
                style={{
                        borderColor: isFilled ? 'var(--border-accent)' : 'var(--tag-border)',
                        background: isFilled ? 'var(--tag-bg)' : 'var(--bg-secondary)',
                      }}
                className={`
                  w-16 h-24 rounded-xl border-2 border-dashed flex items-center
                  justify-center transition-all duration-500 overflow-hidden
                  ${isFilled
                    ? ''
                    : ''
                  }
                `}
              >
                {isFilled ? (
                  <img
                    src={coverUrl}
                    alt="Выбранная карта"
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <span className="text-sm"
                    style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                )}
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

            return (
              <button
                key={idx}
                className="fan-card"
                onClick={() => handleCardClick(idx)}
                disabled={isChosen}
                data-highlighted={isHighlighted ? 'true' : undefined}
                style={{
                  '--a': `${angle}deg`,
                  zIndex: isHighlighted ? 30 : isChosen ? 1 : 10 + idx,
                } as React.CSSProperties}
              >
                {/* Рубашка карты */}
                {!isChosen && (
                  <img
                    src={coverUrl}
                    alt="Карта"
                    className="fan-card__img"
                    style={{
                      opacity: isHighlighted ? 1 : 0.92,
                    }}
                  />
                )}

                {/* Выбранная карта — показываем галочку */}
                {isChosen && (
                  <div className="fan-card__chosen">
                    <span>✓</span>
                  </div>
                )}

                {/* Подсветка при первом тапе */}
                {isHighlighted && (
                  <div className="fan-card__glow" />
                )}
              </button>
            )
          })}
        </div>
      </div>



      <style>{`
        .fan-section {
          flex: 1;
          display: flex;
          align-items: top;
          justify-content: center;
          padding: 0px;
          perspective: 900px;
        }

        .fan-hand {
          position: relative;
          width: 220px;
          height: 280px;
          margin-bottom: 200px; /* небольшой отступ вниз — веер рисуется от bottom */
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

          /* Точка вращения внизу по центру — как реальные карты в руке */
          transform-origin: 50% 140%;
          transform: rotate(var(--a));

          transition:
            transform 0.35s cubic-bezier(0.3, 0.9, 0.3, 1),
            box-shadow 0.3s,
            opacity 0.3s;
        }

        /* Приподнятая карта (первый тап) */
        .fan-card[data-highlighted="true"],
        .fan-card:focus-visible {
          transform: rotate(var(--a)) translateY(-52px) scale(1.08);
          box-shadow: 0 28px 48px -16px --accent-glow,
                      0 0 0 2px --accent-glow, 0.8;
          outline: none;
        }

        /* Выбранная карта — уходит вниз и тускнеет */
        .fan-card:disabled {
          transform: rotate(var(--a)) translateY(20px);
          opacity: 0.25;
          cursor: default;
          box-shadow: none;
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
          background: --accent-glow, 0.2;
          color: rgba(255,242,132,0.6);
          font-size: 28px;
        }

        .fan-card__glow {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: --accent-main, 0.15;
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