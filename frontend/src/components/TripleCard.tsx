// src/components/TripleCard.tsx
import { TarotCard } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface Props {
  card: TarotCard
  index: number        // 0, 1, 2 — позиция в раскладе
  revealed: boolean    // показывать ли карту
}

const POSITION_LABELS = ['Прошлое', 'Настоящее', 'Будущее']

export default function TripleCard({ card, index, revealed }: Props) {
  const imageUrl = `${API_URL}/cards/${card.img}`

  return (
    <div className={`flex flex-col items-center transition-all duration-700 ${
      revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`}>

      {/* Метка позиции */}
      <p className="text-purple-400 text-xs mb-1.5 tracking-wider uppercase">
        {POSITION_LABELS[index]}
      </p>

      {/* Карточка — уменьшенная для трёх в ряд */}
      <div className="perspective w-24 h-40">
        <div className={`card-inner ${revealed ? 'flipped' : ''}`}>

          {/* Рубашка */}
          <div className="card-face rounded-xl overflow-hidden border border-purple-800">
            <div className="w-full h-full bg-gradient-to-br from-purple-950 via-indigo-950
                            to-slate-900 flex items-center justify-center">
              <span className="text-2xl opacity-40">🔮</span>
            </div>
          </div>

          {/* Лицо */}
          <div className="card-face card-back rounded-xl overflow-hidden border border-purple-500">
            <img
              src={imageUrl}
              alt={card.name_ru}
              className={`w-full h-full object-contain bg-slate-950 ${
                card.reversed ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Название */}
      {revealed && (
        <div className="mt-2 text-center slide-up">
          <p className="text-white text-xs font-medium leading-tight">{card.name_ru}</p>
          <p className="text-slate-500 text-xs italic">{card.name_en}</p>
          {card.reversed && (
            <p className="text-rose-400 text-xs mt-0.5">перевёрнутая</p>
          )}
        </div>
      )}

      {/* Общее значение */}
      {revealed && card.meaning_general && (
        <div className="mt-2 w-full slide-up">
          <p className="text-slate-300 text-xs leading-relaxed text-center">
            {card.meaning_general}
          </p>
        </div>
      )}
    </div>
  )
}