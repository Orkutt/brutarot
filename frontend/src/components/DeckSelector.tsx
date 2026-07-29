// src/components/DeckSelector.tsx
import { useState } from 'react'
import { DECKS, DeckInfo, useDeck } from '../store/deckStore'
import { THEMES, ThemeInfo, useTheme } from '../store/themeStore'
import { API_URL } from '../constants'

interface Props {
  onBack: () => void
}

export default function DeckSelector({ onBack }: Props) {
  const { deck: currentDeck, setDeck }   = useDeck()
  const { theme: currentTheme, setTheme } = useTheme()
  const [highlightedDeck, setHighlightedDeck]   = useState<string | null>(null)
  const [highlightedTheme, setHighlightedTheme] = useState<string | null>(null)

  const handleDeckTap = (d: DeckInfo) => {
    if (highlightedDeck === d.key) { setDeck(d); onBack() }
    else setHighlightedDeck(d.key)
  }

  const handleThemeTap = (t: ThemeInfo) => {
    if (highlightedTheme === t.key) { setTheme(t); setHighlightedTheme(null) }
    else { setTheme(t); setHighlightedTheme(t.key) }
    // Тема применяется сразу при первом тапе — пользователь видит превью
  }

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      <header className="flex items-center px-4 pt-6 pb-3 gap-3"
              style={{ borderBottom: '1px solid var(--border-main)' }}>
        <button onClick={onBack}
          style={{ color: 'var(--text-secondary)' }}
          className="text-sm hover:opacity-80 transition-opacity">
          ← Назад
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center pr-8"
            style={{ color: 'var(--accent-light)' }}>
          ⚙ Настройки
        </h1>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-4 py-4 pb-10 overflow-y-auto">

        {/* Выбор темы */}
        <section>
          <p className="text-xs uppercase tracking-wider mb-3"
             style={{ color: 'var(--text-secondary)' }}>
            Цветовая тема
          </p>
          <div className="flex flex-col gap-2">
            {THEMES.map(t => {
              const isActive = currentTheme.key === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => handleThemeTap(t)}
                  className="flex items-center gap-3 p-3 rounded-xl border-2
                             text-left transition-all duration-200 active:scale-98"
                  style={{
                    borderColor: isActive ? 'var(--accent-main)' : 'var(--border-main)',
                    background:  isActive ? 'var(--tag-bg)' : 'var(--bg-secondary)',
                  }}
                >
                  {/* Цветовой превью */}
                  <div className="flex gap-1 flex-shrink-0">
                    {t.key === 'night'
                      ? ['#020617','#7c3aed','#c4b5fd'].map(c => (
                          <div key={c} className="w-5 h-5 rounded-full border border-white/20"
                               style={{ background: c }}/>
                        ))
                      : ['#fdf6ec','#c47a7a','#3b1a0e'].map(c => (
                          <div key={c} className="w-5 h-5 rounded-full border border-black/10"
                               style={{ background: c }}/>
                        ))
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {t.description}
                    </p>
                  </div>
                  {isActive && (
                    <span className="text-xs flex-shrink-0"
                          style={{ color: 'var(--accent-light)' }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Выбор колоды */}
        <section>
          <p className="text-xs uppercase tracking-wider mb-3"
             style={{ color: 'var(--text-secondary)' }}>
            Колода карт · нажми дважды для выбора
          </p>
          <div className="flex flex-col gap-3">
            {DECKS.map(d => {
              const isHighlighted = highlightedDeck === d.key
              const isSelected    = currentDeck.key === d.key
              return (
                <div
                  key={d.key}
                  onClick={() => handleDeckTap(d)}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer
                             transition-all duration-200 active:scale-98 select-none"
                  style={{
                    borderColor: isHighlighted
                      ? '#facc15'
                      : isSelected ? 'var(--accent-main)' : 'var(--border-main)',
                    background: isHighlighted
                      ? 'rgba(250,204,21,0.08)'
                      : isSelected ? 'var(--tag-bg)' : 'var(--bg-secondary)',
                  }}
                >
                  <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 border"
                       style={{ borderColor: 'var(--border-main)' }}>
                    <img src={`${API_URL}/cards/${d.cover}`} alt={d.name}
                         className="w-full h-full object-cover"/>
                  </div>
                  <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 border"
                       style={{ borderColor: 'var(--border-main)' }}>
                    <img src={`${API_URL}/cards/${d.sample}`} alt="Пример"
                         className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {d.name}
                      </p>
                      {isSelected && (
                        <span className="text-xs" style={{ color: 'var(--accent-light)' }}>
                          ✓ выбрана
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-5"
                       style={{ color: 'var(--text-secondary)' }}>
                      {d.description}
                    </p>
                    {isHighlighted && (
                      <p className="text-xs mt-1" style={{ color: '#facc15' }}>
                        Нажми ещё раз для выбора
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </main>
    </div>
  )
}