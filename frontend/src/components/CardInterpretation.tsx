// src/components/CardInterpretation.tsx
import { TarotCard } from '../types'

interface Props {
  card: TarotCard
}

export default function CardInterpretation({ card }: Props) {
  return (
    <div className="slide-up mt-6 space-y-4 text-center max-w-sm mx-auto">

      {/* Название и статус */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          {card.name}
        </h2>
        <p className="text-purple-400 text-sm mt-1">
          {card.arcana} · {card.elemental}
          {card.reversed && (
            <span className="ml-2 text-rose-400">· Перевёрнутая</span>
          )}
        </p>
      </div>

      {/* Ключевые слова */}
      {card.keywords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {card.keywords.map(kw => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-xs border border-purple-700/50"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Основная интерпретация */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 text-left">
        <p className="text-slate-300 text-sm leading-relaxed">
          {card.interpretation}
        </p>
      </div>

      {/* Предсказания */}
      {card.fortune_telling.length > 0 && (
        <div className="text-left">
          <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">
            Предсказание
          </p>
          <ul className="space-y-1">
            {card.fortune_telling.map((ft, i) => (
              <li key={i} className="text-slate-400 text-sm flex gap-2">
                <span className="text-purple-600 mt-0.5">✦</span>
                <span>{ft}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Вопросы для размышления */}
      {card.questions_to_ask.length > 0 && (
        <div className="text-left">
          <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">
            Вопросы для размышления
          </p>
          <ul className="space-y-1">
            {card.questions_to_ask.map((q, i) => (
              <li key={i} className="text-slate-400 text-sm flex gap-2">
                <span className="text-purple-600 mt-0.5">?</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}