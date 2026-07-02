// src/components/TarotCard.tsx
import { TarotCard as TarotCardType } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface Props {
  card: TarotCardType
  flipped: boolean  // управляет анимацией снаружи
}

export default function TarotCard({ card, flipped }: Props) {
  const imageUrl = `${API_URL}/cards/${card.img}`

  return (
    <div className="perspective w-52 h-80 mx-auto">
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>

        {/* Рубашка карты — видна ДО переворота */}
        <div className="card-face rounded-2xl overflow-hidden border-2 border-purple-700">
          <div className="w-full h-full bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 flex items-center justify-center">
            {/* Орнамент на рубашке */}
            <div className="text-6xl opacity-40">🔮</div>
          </div>
        </div>

        {/* Лицо карты — видно ПОСЛЕ переворота */}
        <div className="card-face card-back rounded-2xl overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-900/50">
          <img
            src={imageUrl}
            alt={card.name}
            className={`w-full h-full object-cover ${card.reversed ? 'rotate-180' : ''}`}
          />
        </div>

      </div>
    </div>
  )
}