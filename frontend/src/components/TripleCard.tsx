// src/components/TripleCard.tsx
import { TarotCard } from '../types'
import { API_URL, COVER_URL } from '../constants'
import { useDeck } from '../store/deckStore'

interface Props {
  card: TarotCard
  index: number
  revealed: boolean
  isActive: boolean   // активный таб
  onClick: () => void
}

const POSITION_LABELS = ['Прошлое', 'Настоящее', 'Будущее']

export default function TripleCard({ card, index, revealed, isActive, onClick }: Props) {
  const { deck } = useDeck()
  const coverUrl = `${API_URL}/cards/${deck.cover}`
  const imageUrl = `${API_URL}/cards/${deck.key}/${card.img.split('/').pop()}`

  return (
    <div
      className={`flex flex-col items-center cursor-pointer transition-all duration-300
                  ${isActive ? 'scale-105' : 'opacity-70'}`}
      onClick={onClick}
    >
      <p className="text-purple-400 text-xs mb-1.5 tracking-wider uppercase">
        {POSITION_LABELS[index]}
      </p>

      <div className="perspective w-24 h-40">
        <div className={`card-inner ${revealed ? 'flipped' : ''}`}>

          {/* Рубашка */}
          <div className="card-face rounded-xl overflow-hidden border border-purple-800">
            <img src={COVER_URL} alt="Рубашка" className="w-full h-full object-cover"/>
          </div>

          {/* Лицо */}
          <div className="card-face card-back rounded-xl overflow-hidden border border-purple-500">
            <img
              src={imageUrl}
              alt={card.name_ru}
              className={`w-full h-full object-contain bg-slate-950
                          ${card.reversed ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Название под картой */}
      {revealed && (
        <div className="mt-1.5 text-center">
          <p className="text-white text-xs font-medium leading-tight">{card.name_ru}</p>
          {card.reversed && <p className="text-rose-400 text-xs">перевёрнутая</p>}
        </div>
      )}
    </div>
  )
}