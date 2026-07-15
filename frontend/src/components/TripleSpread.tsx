// src/components/TripleSpread.tsx
import { useState } from 'react'
import { ContextKey, CONTEXTS_TRIPLE } from '../types'
import { useTripleSpread } from '../hooks/useTripleSpread'
import ContextSelector from './ContextSelector'
import TripleCard from './TripleCard'

interface Props {
  onBack: () => void
}

export default function TripleSpread({ onBack }: Props) {
  const [context, setContext] = useState<ContextKey | null>(null)
  const { result, phase, revealedCount, error, draw, reset } = useTripleSpread()

  const handleDraw = () => {
    if (context) draw(context)
  }

  const handleReset = () => {
    reset()
    // контекст оставляем
  }

  const isIdle     = phase === 'idle'
  const isLoading  = phase === 'loading'
  const isRevealing = phase === 'revealing' || phase === 'done'
  const isDone     = phase === 'done'

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">

      {/* Шапка */}
      <header className="flex items-center px-4 pt-6 pb-3 gap-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          ← Назад
        </button>
        <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center pr-8">
          ✦✦✦ Триплет ✦✦✦
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-10">

        {/* Выбор темы */}
        {isIdle && (
          <ContextSelector
            contexts={CONTEXTS_TRIPLE}        // ← добавить
            drawLabel="Вытащить карты" 
            selected={context}
            onChange={setContext}
            onDraw={handleDraw}
          />
        )}

        {/* Загрузка */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 mt-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
                            rounded-full animate-spin"/>
            <p className="text-purple-400 text-sm">Тасуем колоду...</p>
          </div>
        )}

        {/* Расклад */}
        {result && isRevealing && (
          <div className="w-full mt-4 flex flex-col gap-4">

            {/* Три карты в ряд */}
            <div className="grid grid-cols-3 gap-3">
              {result.cards.map((card, i) => (
                <TripleCard
                  key={card.id}
                  card={card}
                  index={i}
                  revealed={revealedCount > i}
                />
              ))}
            </div>

            {/* Комбинации — появляются по мере раскрытия */}
            {isDone && Object.keys(result.combos).length > 0 && (
              <div className="slide-up space-y-2 mt-2">
                <p className="text-purple-400 text-xs uppercase tracking-wider text-center">
                  Взаимодействие карт
                </p>
                {Object.entries(result.combos).map(([key, text]) => {
                  // key вида "1-2", "2-3", "1-3"
                  const [a, b] = key.split('-')
                  const labels = ['Прошлое', 'Настоящее', 'Будущее']
                  const label = `${labels[Number(a) - 1]} + ${labels[Number(b) - 1]}`
                  return (
                    <div
                      key={key}
                      className="bg-purple-950/50 rounded-xl p-3 border border-purple-800/50"
                    >
                      <p className="text-purple-300 text-xs mb-1">{label}</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Блок для LLM-резюме — пока пустая заглушка */}
            {isDone && (
              <div className="slide-up mt-2 bg-slate-900/80 rounded-xl p-4
                              border border-slate-700/50 min-h-[100px]">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">
                  Общая интерпретация расклада
                </p>
                {result.llm_summary ? (
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                    {result.llm_summary}
                  </p>
                ) : (
                  <p className="text-slate-600 text-sm italic">
                    Здесь появится интерпретация от ИИ...
                  </p>
                )}
              </div>
            )}

            {/* Кнопка заново */}
            {isDone && (
              <button
                onClick={handleReset}
                className="mt-2 w-full py-2.5 rounded-xl border border-purple-700
                           text-purple-300 text-sm hover:bg-purple-900/40
                           active:scale-95 transition-all"
              >
                Новый расклад
              </button>
            )}
          </div>
        )}

        {/* Ошибка */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 mt-10 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-xl bg-purple-800 text-white text-sm"
            >
              Попробовать снова
            </button>
          </div>
        )}

      </main>
    </div>
  )
}