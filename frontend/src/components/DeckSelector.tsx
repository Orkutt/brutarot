// src/components/DeckSelector.tsx
import { useState } from 'react'
import { DECKS, DeckInfo, useDeck } from '../store/deckStore'
import { API_URL } from '../constants'

interface Props {
  onBack: () => void
}

export default function DeckSelector({ onBack }: Props) {
  const { deck: currentDeck, setDeck } = useDeck()
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const handleTap = (d: DeckInfo) => {
    if (highlighted === d.key) {
      // Второй тап — выбираем и уходим
      setDeck(d)
      onBack()
    } else {
      // Первый тап — подсвечиваем
      setHighlighted(d.key)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      <header className="flex items-center px-4 pt-6 pb-3 gap-3">
        <button
          onClick={onBack}
          className="absolute left-4 text-slate-400 hover:text-white transition-colors text-sm"
        >
          ← Назад
        </button>
        <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center">
          Выбор колоды
        </h1>
      </header>

      <p className="text-slate-500 text-xs text-center mb-4">
        Нажми дважды, чтобы выбрать колоду
      </p>

      <main className="flex-1 flex flex-col gap-3 px-4 pb-10">
        {DECKS.map((d) => {
          const isHighlighted = highlighted === d.key
          const isSelected    = currentDeck.key === d.key

          return (
            <div
              key={d.key}
              onClick={() => handleTap(d)}
              className={`
                flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer
                transition-all duration-200 active:scale-98 select-none
                ${isHighlighted
                  ? 'border-yellow-400 bg-yellow-950/30 shadow-lg shadow-yellow-900/30'
                  : isSelected
                    ? 'border-purple-500 bg-purple-950/40'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }
              `}
            >
              {/* Обложка колоды */}
              <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0
                              border border-slate-600">
                <img
                  src={`${API_URL}/cards/${d.cover}`}
                  alt={d.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Карта-пример m06 */}
              <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0
                              border border-slate-600">
                <img
                  src={`${API_URL}/cards/${d.sample}`}
                  alt="Пример карты"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Описание */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-sm font-medium leading-tight">
                    {d.name}
                  </p>
                  {isSelected && (
                    <span className="text-purple-400 text-xs">✓ выбрана</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-5">
                  {d.description}
                </p>
                {isHighlighted && (
                  <p className="text-yellow-400 text-xs mt-1">
                    Нажми ещё раз для выбора
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}