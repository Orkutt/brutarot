// src/components/TripleSpread.tsx
import { useState } from 'react'
import { ContextKey, CONTEXTS_TRIPLE } from '../types'
import { useTripleSpread } from '../hooks/useTripleSpread'
import MixingScreen from './MixingScreen'
import TripleCard from './TripleCard'

interface Props {
  onBack: () => void
}

type SubScreen = 'context' | 'mixing' | 'spread'

export default function TripleSpread({ onBack }: Props) {
  const [subScreen, setSubScreen] = useState<SubScreen>('context')
  const [context, setContext]     = useState<ContextKey | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const { result, phase, revealedCount, error, draw, reset } = useTripleSpread()

  const contextLabel = CONTEXTS_TRIPLE.find(c => c.key === context)?.label ?? ''

  const handleContextSelect = (key: ContextKey) => setContext(key)

  const handleMixingDone = () => {
    if (!context) return
    setSubScreen('spread')
    draw(context)
  }

  const handleReset = () => {
    reset()
    setSubScreen('context')
    setContext(null)
    setActiveTab(0)
  }

  const isDone     = phase === 'done'
  const isRevealing = phase === 'revealing' || phase === 'done'
  const isLoading  = phase === 'loading'

  // Экран выбора контекста
  if (subScreen === 'context') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="flex items-center px-4 pt-6 pb-3 gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">
            ← Назад
          </button>
          <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center pr-8">
            ✦ Триплет
          </h1>
        </header>
        <main className="flex-1 px-4 pb-10">
          <p className="text-slate-400 text-sm text-center mt-4 mb-4">
            Выбери тему гадания
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            {CONTEXTS_TRIPLE.map(({ key, label, icon }) => {
              const isSelected = context === key
              return (
                <button
                  key={key}
                  onClick={() => handleContextSelect(key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border
                              text-left text-sm transition-all duration-200 active:scale-95
                              ${isSelected
                                ? 'bg-purple-900/70 border-purple-500 text-purple-200'
                                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-purple-700'
                              }`}
                >
                  <span>{icon}</span>
                  <span className="leading-tight">{label}</span>
                  <span className={`ml-auto w-2 h-2 rounded-full flex-shrink-0
                                    ${isSelected ? 'bg-purple-400' : 'bg-slate-700'}`}/>
                </button>
              )
            })}
          </div>
          <div className="max-w-sm mx-auto mt-4">
            <button
              onClick={() => context && setSubScreen('mixing')}
              disabled={!context}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all
                          ${context
                            ? 'bg-purple-700 text-white hover:bg-purple-600 active:scale-95 deck-glow'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
            >
              {context ? '→ Далее' : 'Сначала выбери тему'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Экран перемешивания
  if (subScreen === 'mixing') {
    return (
      <MixingScreen
        mode="triple"
        onCardSelected={handleMixingDone}
        onBack={() => setSubScreen('context')}
      />
    )
  }

  // Экран расклада
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex items-center px-4 pt-6 pb-3 gap-3">
        <button onClick={handleReset} className="text-slate-400 hover:text-white text-sm">
          ← Сначала
        </button>
        <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center pr-8">
          ✦ Триплет · {contextLabel}
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-10 gap-4">

        {/* Загрузка */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 mt-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
                            rounded-full animate-spin"/>
            <p className="text-purple-400 text-sm">Раскладываем карты...</p>
          </div>
        )}

        {/* Три карты */}
        {result && isRevealing && (
          <>
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs mt-2">
              {result.cards.map((card, i) => (
                <TripleCard
                  key={card.id}
                  card={card}
                  index={i}
                  revealed={revealedCount > i}
                  isActive={activeTab === i}
                  onClick={() => revealedCount > i && setActiveTab(i)}
                />
              ))}
            </div>

            {/* Табы с толкованием */}
            {isDone && (
              <>
                {/* Заголовки табов */}
                <div className="flex w-full max-w-xs border-b border-slate-700">
                  {['Прошлое', 'Настоящее', 'Будущее'].map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 py-2 text-xs transition-all duration-200
                                  ${activeTab === i
                                    ? 'text-purple-300 border-b-2 border-purple-500 -mb-px'
                                    : 'text-slate-500 hover:text-slate-300'
                                  }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Содержимое активного таба */}
                <div className="w-full max-w-xs slide-up space-y-3">
                  {(() => {
                    const card = result.cards[activeTab]
                    return (
                      <>
                        {/* Ключевые слова */}
                        <div className="flex flex-wrap gap-1.5">
                          {card.keywords.map(kw => (
                            <span key={kw}
                              className="px-2 py-0.5 rounded-full bg-purple-900/60
                                         text-purple-300 text-xs border border-purple-700/50">
                              {kw}
                            </span>
                          ))}
                        </div>

                        {/* Общее значение */}
                        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/50">
                          <p className="text-purple-400 text-xs uppercase tracking-wider mb-1.5">
                            Общее значение
                          </p>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {card.meaning_general}
                          </p>
                        </div>

                        {/* Значение по запросу */}
                        {card.meanings_by_context_value && (
                          <div className="bg-indigo-950/60 rounded-xl p-3 border border-indigo-800/50">
                            <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1.5">
                              {contextLabel}
                            </p>
                            <p className="text-slate-200 text-sm leading-relaxed">
                              {card.meanings_by_context_value}
                            </p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Комбинации карт */}
                {Object.keys(result.combos).length > 0 && (
                  <div className="w-full max-w-xs slide-up space-y-2">
                    <p className="text-purple-400 text-xs uppercase tracking-wider text-center">
                      Взаимодействие карт
                    </p>
                    {Object.entries(result.combos).map(([key, text]) => {
                      const labels = ['Прошлое', 'Настоящее', 'Будущее']
                      const [a, b] = key.split('-')
                      return (
                        <div key={key}
                          className="bg-purple-950/50 rounded-xl p-3 border border-purple-800/50">
                          <p className="text-purple-300 text-xs mb-1">
                            {labels[Number(a) - 1]} + {labels[Number(b) - 1]}
                          </p>
                          <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Поле для LLM */}
                <div className="w-full max-w-xs slide-up bg-slate-900/80 rounded-xl p-4
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

                <button
                  onClick={handleReset}
                  className="w-full max-w-xs py-2.5 rounded-xl border border-purple-700
                             text-purple-300 text-sm hover:bg-purple-900/40 active:scale-95
                             transition-all"
                >
                  Новый расклад
                </button>
              </>
            )}
          </>
        )}

        {/* Ошибка */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 mt-10 text-center">
            <p className="text-rose-400 text-sm">{error}</p>
            <button onClick={handleReset}
              className="px-6 py-2 rounded-xl bg-purple-800 text-white text-sm">
              Попробовать снова
            </button>
          </div>
        )}
      </main>
    </div>
  )
}