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
      <p className="text-slate-400 text-sm text-center">Выбери тему гадания</p>

      <div className="grid grid-cols-2 gap-2">
        {contexts.map(({ key, label, icon }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key as ContextKey)}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm
                transition-all duration-200 active:scale-95
                ${isSelected
                  ? 'bg-purple-900/70 border-purple-500 text-purple-200 shadow-md shadow-purple-900/40'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-purple-700 hover:text-slate-300'
                }
              `}
            >
              <span className="text-base">{icon}</span>
              <span className="leading-tight">{label}</span>
              <span className={`
                ml-auto w-2 h-2 rounded-full flex-shrink-0 transition-all
                ${isSelected ? 'bg-purple-400' : 'bg-slate-700'}
              `}/>
            </button>
          )
        })}
      </div>

      <button
        onClick={onDraw}
        disabled={!selected}
        className={`
          mt-2 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200
          ${selected
            ? 'bg-purple-700 text-white hover:bg-purple-600 active:scale-95 deck-glow'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }
        `}
      >
        {selected ? `🔮 ${drawLabel}` : 'Сначала выбери тему'}
      </button>
    </div>
  )
}