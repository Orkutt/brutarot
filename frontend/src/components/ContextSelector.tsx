// src/components/ContextSelector.tsx
import { ContextKey } from '../types'

// Тип одного элемента контекста — достаточно общий чтобы принять любой список
interface ContextItem {
  key: string
  label: string
  icon: string
}

interface Props {
  contexts: readonly ContextItem[]          // ← список приходит снаружи
  drawLabel?: string               // ← текст кнопки, по умолчанию "Вытащить карту"
  selected: ContextKey | null
  onChange: (key: ContextKey) => void
  onDraw: () => void
}

export default function ContextSelector({
  contexts,
  drawLabel = 'Вытащить карту',
  selected,
  onChange,
  onDraw,
}: Props) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 mt-4">
      <p className="text-sm text-center"
        style={{ color: 'var(--text-primary)' }}
      >Выбери тему гадания</p>

      <div className="grid grid-cols-2 gap-2">
        {contexts.map(({ key, label, icon }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key as ContextKey)}
              style={{
                    backgroundColor: isSelected ? 'var(--accent-glow)' : 'var(--interp-bg)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderColor: isSelected ? 'var(--border-accent)' : 'var(--interp-border)',
                  }}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm
                transition-all duration-200 active:scale-95
                ${isSelected
                  ? 'shadow-md shadow-slate-900/40'
                  : 'hover:brightness-110'
                }
              `}
            >
              <span className="text-base">{icon}</span>
              <span className="leading-tight">{label}</span>
              <span style={{
                          backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--accent-glow)',
                        }}
                    className={`
                ml-auto w-2 h-2 rounded-full flex-shrink-0 transition-all
                ${isSelected ? '' : ''}
              `}/>
            </button>
          )
        })}
      </div>

      <button
        onClick={onDraw}
        disabled={!selected}
        style={{
                backgroundColor: selected ? 'var(--accent-glow)' : 'var(--interp-bg)',
                color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
        className={`
          mt-2 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200
          ${selected
            ? 'hover:brightness-110 active:scale-95 deck-glow'
            : 'cursor-not-allowed'
          }
        `}
      >
        {selected ? `🔮 ${drawLabel}` : 'Сначала выбери тему'}
      </button>
    </div>
  )
}