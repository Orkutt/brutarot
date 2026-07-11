// src/components/ContextSelector.tsx
import { CONTEXTS, ContextKey } from '../types'

interface Props {
  selected: ContextKey | null
  onChange: (key: ContextKey) => void
  onDraw: () => void
}

export default function ContextSelector({ selected, onChange, onDraw }: Props) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 mt-4">
      <p className="text-slate-400 text-sm text-center">
        Выбери тему гадания
      </p>

      {/* Сетка кнопок-радио */}
      <div className="grid grid-cols-2 gap-2">
        {CONTEXTS.map(({ key, label, icon }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
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
              {/* Точка-индикатор выбора */}
              <span className={`
                ml-auto w-2 h-2 rounded-full flex-shrink-0 transition-all
                ${isSelected ? 'bg-purple-400' : 'bg-slate-700'}
              `}/>
            </button>
          )
        })}
      </div>

      {/* Кнопка вытащить карту — активна только когда выбран контекст */}
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
        {selected ? '🔮 Вытащить карту' : 'Сначала выбери тему'}
      </button>
    </div>
  )
}