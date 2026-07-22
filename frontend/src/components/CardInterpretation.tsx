// src/components/CardInterpretation.tsx
import { TarotCard, CONTEXTS_SINGLE } from '../types'

interface Props {
  card: TarotCard
}

export default function CardInterpretation({ card }: Props) {
  // Находим лейбл выбранного контекста для заголовка блока
  const contextLabel = CONTEXTS_SINGLE.find(c => c.key === card.context)?.label ?? ''
  // Показываем заголовок контекста только если он не "Одна карта"
  const showContextLabel = card.context !== 'one_card' && contextLabel

  return (
    <div className="slide-up mt-5 space-y-4 w-full max-w-sm mx-auto">

      {/* Название карты */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">
          {card.name_ru}
        </h2>
        <p className="text-slate-500 text-sm mt-0.5 italic">
          {card.name_en}
        </p>
        <p className="text-purple-400 text-xs mt-1">
          {card.arcana} · {card.elemental}
          {card.reversed && (
            <span className="ml-2 text-rose-400">· Перевёрнутая</span>
          )}
        </p>
      </div>

      {/* Ключевые слова */}
      {card.keywords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {card.keywords.map(kw => (
            <span
              key={kw}
              className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300
                         text-xs border border-purple-700/50"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Общее значение карты */}
      {card.meaning_general && (
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">
            Общее значение
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {card.meaning_general}
          </p>
        </div>
      )}

      {/* Интерпретация по контексту — большое поле, текст может быть объёмным */}
      <div className="bg-indigo-950/60 rounded-xl p-4 border border-indigo-800/50">
        {showContextLabel && (
          <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1.5">
            {contextLabel}
          </p>
)}
        {/* min-h чтобы поле не сжималось на коротких текстах */}
        <p className="text-slate-200 text-sm leading-relaxed min-h-[80px] whitespace-pre-line">
          {card.interpretation}
        </p>
      </div>

    </div>
  )
}