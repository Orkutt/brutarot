// src/components/TarotCard.tsx
import { TarotCard as TarotCardType } from '../types'
import { API_URL, COVER_URL } from '../constants'

interface Props {
  card: TarotCardType
  flipped: boolean
}

export default function TarotCard({ card, flipped }: Props) {
  const imageUrl = `${API_URL}/cards/${card.img}`

  return (
    <div className="perspective w-60 h-96 mx-auto">
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>

        {/* Рубашка — теперь реальное изображение cover.jpg */}
        <div className="card-face rounded-2xl overflow-hidden border-2 border-purple-700">
          <img src={COVER_URL} alt="Рубашка" className="w-full h-full object-cover"/>
        </div>

        {/* Лицо карты */}
        <div className="card-face card-back rounded-2xl overflow-hidden border-2
                        border-purple-500 shadow-lg shadow-purple-900/50">
          <img
            src={imageUrl}
            alt={card.name_ru}
            className={`w-full h-full object-contain bg-slate-950
                        ${card.reversed ? 'rotate-180' : ''}`}
          />
        </div>

      </div>
    </div>
  )
}