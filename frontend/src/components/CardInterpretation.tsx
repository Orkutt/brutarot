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
        <h2 className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          {card.name_ru}
        </h2>
        <p className="text-sm mt-0.5 italic"
          style={{ color: 'var(--text-primary)' }}>
          {card.name_en}
        </p>
        <p className="text-xs mt-1"
          style={{ color: 'var(--text-primary)' }}>
          {card.arcana} · {card.elemental}
          {card.reversed && (
            <span className="ml-2 text-rose-600">· Перевёрнутая</span>
          )}
        </p>
      </div>

      {/* Ключевые слова */}
      {card.keywords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {card.keywords.map(kw => (
            <span
              key={kw}
              style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-main)'
                  }}
              className="px-2.5 py-0.5 rounded-full text-xs border"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Общее значение карты */}
      {card.meaning_general && (
        <div className="rounded-xl p-4 border"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-main)' }}>
          <p className="text-xs uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-primary)' }}>
            Общее значение
          </p>
          <p className="text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)' }}>
            {card.meaning_general}
          </p>
        </div>
      )}

      {/* Интерпретация по контексту — большое поле, текст может быть объёмным */}
      <div className="rounded-xl p-4 border"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-main)' }}>
        {showContextLabel && (
          <p className="text-xs uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-primary)' }}>
            {contextLabel}
          </p>
)}
        {/* min-h чтобы поле не сжималось на коротких текстах */}
        <p className="text-sm leading-relaxed min-h-[80px] whitespace-pre-line"
          style={{ color: 'var(--text-primary)' }}>
          {card.interpretation}
        </p>
      </div>

    </div>
  )
}