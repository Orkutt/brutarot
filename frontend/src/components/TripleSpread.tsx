// src/components/TripleSpread.tsx
import { useState, useEffect } from 'react'
import { ContextKey, CONTEXTS_TRIPLE } from '../types'
import { useTripleSpread } from '../hooks/useTripleSpread'
import MixingScreen from './MixingScreen'
import TripleCard from './TripleCard'
import { useInterpret } from '../hooks/useInterpret'

interface Props {
  onBack: () => void
}

type SubScreen = 'context' | 'mixing' | 'spread'

export default function TripleSpread({ onBack }: Props) {
  const [subScreen, setSubScreen] = useState<SubScreen>('context')
  const [context, setContext]     = useState<ContextKey | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const { result, phase, revealedCount, error, draw, reset } = useTripleSpread()
  const { summary, status: llmStatus, interpret, reset: resetLlm } = useInterpret()

  const contextLabel = CONTEXTS_TRIPLE.find(c => c.key === context)?.label ?? ''

  const handleContextSelect = (key: ContextKey) => setContext(key)

  const handleMixingDone = () => {
  if (!context) return
  resetLlm()
  setSubScreen('spread')
  draw(context)
  }

  const handleReset = () => {
  reset()
  resetLlm()
  setSubScreen('context')
  setContext(null)
  setActiveTab(0)
  }

  const isDone     = phase === 'done'
  const isRevealing = phase === 'revealing' || phase === 'done'
  const isLoading  = phase === 'loading'

  useEffect(() => {
  if (isDone && result && context) {
    interpret(result.cards, result.combos, context)
  }
  }, [isDone])

  // Экран выбора контекста
  if (subScreen === 'context') {
    return (
      <div className="min-h-screen flex flex-col"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <header className="relative flex items-center px-4 pt-6 pb-3 gap-3">
          <button onClick={onBack} className="absolute left-4 hover:text-white text-sm"
          style={{ color: 'var(--text-secondary)' }}>
            ← Назад
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center"
            style={{ color: 'var(--accent-light)' }}>
            Триплет
          </h1>
        </header>
        <main className="flex-1 px-4 pb-10">
          <p className="text-sm text-center mt-4 mb-4"
            style={{ color: 'var(--text-secondary)' }}>
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
    <div className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="relative flex items-center px-4 pt-6 pb-3 gap-3">
        <button onClick={handleReset} className="absolute left-4 hover:text-white text-sm"
        style={{ color: 'var(--text-secondary)' }}>
          ←
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center"
          style={{ color: 'var(--accent-light)' }}>
          Триплет · {contextLabel}
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-10 gap-4">

        {/* Загрузка */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 mt-16">
            <div className="w-8 h-8 border-2 border-t-transparent
                            rounded-full animate-spin"
                            style={{ borderColor: 'var(--border-main)' }}/>
            <p className="text-purple-400 text-sm"
            style={{ color: 'var(--accent-main)' }}
            >Раскладываем карты...</p>
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
                <div className="w-full max-w-xs slide-up space-y-3
                  style={{ color: 'var(--accent-light)', borderBottomColor: 'var(--accent-main)' }}">
                  {(() => {
                    const card = result.cards[activeTab]
                    return (
                      <>
                        {/* Ключевые слова */}
                        <div className="flex flex-wrap gap-1.5">
                          {card.keywords.map(kw => (
                            <span key={kw}
                              className="px-2 py-0.5 rounded-full text-xs border"
                                style={{ background: 'var(--tag-bg)', borderColor: 'var(--tag-border)', color: 'var(--tag-text)' }}>
                              {kw}
                            </span>
                          ))}
                        </div>

                        {/* Общее значение */}
                        <div className="rounded-xl p-3 border"
                          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-main)' }}>
                          <p className="text-xs uppercase tracking-wider mb-1.5"
                            style={{ color: 'var(--text-secondary)' }}>
                            Общее значение
                          </p>
                          <p className="text-slate-300 text-sm leading-relaxed"
                            style={{ color: 'var(--text-muted)' }}>
                            {card.meaning_general}
                          </p>
                        </div>

                        {/* Значение по запросу */}
                        {card.meanings_by_context_value && (
                          <div className="rounded-xl p-3 border"
                            style={{ background: 'var(--interp-bg)', borderColor: 'var(--interp-border)' }}>
                            <p className="text-xs uppercase tracking-wider mb-1.5"
                              style={{ color: 'var(--text-secondary)' }}>
                              {contextLabel}
                            </p>
                            <p className="text-slate-200 text-sm leading-relaxed"
                              style={{ color: 'var(--text-muted)' }}>
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
                    <p className="text-xs uppercase tracking-wider text-center"
                      style={{ color: 'var(--text-secondary)' }}>
                      Взаимодействие карт
                    </p>
                    {Object.entries(result.combos).map(([key, text]) => {
                      const labels = ['Прошлое', 'Настоящее', 'Будущее']
                      const [a, b] = key.split('-')
                      return (
                        <div key={key}
                          className="rounded-xl p-3 border"
                            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-accent)' }}>
                          <p className="text-xs mb-1"
                            style={{ color: 'var(--accent-light)' }}>
                            {labels[Number(a) - 1]} + {labels[Number(b) - 1]}
                          </p>
                          <p className="text-sm leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}>{text}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Поле для LLM */}
                <div className="w-full max-w-xs slide-up rounded-xl p-4
                                border min-h-[100px]"
                                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-main)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Общая интерпретация расклада
                    </p>
                  </div>

                  {llmStatus === 'idle' && (
                    <p className="text-sm italic"
                      style={{ color: 'var(--text-muted)' }}>Здесь появится интерпретация от ИИ...</p>
                  )}

                  {llmStatus === 'loading' && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-purple-500 border-t-transparent
                                      rounded-full animate-spin flex-shrink-0"/>
                      <p className="text-purple-400 text-sm italic">Таролог думает...</p>
                    </div>
                  )}

                  {llmStatus === 'done' && (
                    <p className="text-sm leading-relaxed whitespace-pre-line"
                      style={{ color: 'var(--text-secondary)' }}>
                      {summary}
                    </p>
                  )}

                  {llmStatus === 'error' && (
                    <p className="text-rose-400 text-sm italic">
                      Не удалось получить интерпретацию. Попробуй позже.
                    </p>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="w-full max-w-xs py-2.5 rounded-xl border
                             text-sm hover:bg-purple-900/40 active:scale-95
                             transition-all"
                  style={{ borderColor: 'var(--border-accent)', background: 'var(--tag-bg)' }}
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