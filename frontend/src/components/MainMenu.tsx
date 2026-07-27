// src/components/MainMenu.tsx
import { Screen } from '../types'
import { useDeck } from '../store/deckStore'

interface Props {
  onSelect: (screen: Screen) => void
  onSettings: () => void   // ← новый проп для перехода к выбору колоды
}

export default function MainMenu({ onSelect, onSettings }: Props) {
  const { deck } = useDeck()

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center
                    justify-center px-6 gap-8">

      {/* Шестерёнка в правом верхнем углу */}
      <button
        onClick={onSettings}
        className="absolute top-5 right-5 text-slate-500 hover:text-purple-400
                   transition-colors text-2xl leading-none"
        aria-label="Настройки"
      >
        ⚙
      </button>                

      <div className="text-center">
        <h1 className="text-4xl font-semibold text-purple-300 mb-2">У ведьмы-гадалки</h1>
        <p className="text-slate-500 text-sm">
          Колода: <span className="text-slate-400">{deck.name}</span>
        </p>
        <p className="text-slate-500 text-sm">Выбери тип расклада</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">

        <button
          onClick={() => onSelect('single')}
          className="flex items-center gap-4 p-5 rounded-2xl border border-purple-800
                     bg-purple-950/40 hover:bg-purple-900/50 active:scale-95
                     transition-all text-left group"
        >
          <span className="text-3xl">🃏</span>
          <div>
            <p className="text-white font-cormorant font-medium group-hover:text-purple-200 transition-colors">
              Одна карта
            </p>
            <p className="text-slate-500 font-cormorant text-xs mt-0.5">
              Быстрый ответ или карта дня
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect('triple')}
          className="flex items-center gap-4 p-5 rounded-2xl border border-indigo-800
                     bg-indigo-950/40 hover:bg-indigo-900/50 active:scale-95
                     transition-all text-left group"
        >
          <span className="text-3xl">🎴</span>
          <div>
            <p className="text-white font-cormorant font-medium group-hover:text-indigo-200 transition-colors">
              Триплет
            </p>
            <p className="text-slate-500 font-cormorant text-xs mt-0.5">
              Прошлое · Настоящее · Будущее
            </p>
          </div>
        </button>

        {/* Кельтский крест */}
        <button
          onClick={() => onSelect('celtic')}
          className="flex items-center gap-4 p-5 rounded-2xl border border-teal-800
                     bg-teal-950/40 hover:bg-teal-900/50 active:scale-95
                     transition-all text-left group opacity-60"
          // opacity-60 и cursor пока говорят что режим в разработке
        >
          <span className="text-3xl">✝</span>
          <div>
            <p className="text-white font-medium group-hover:text-teal-200 transition-colors">
              Кельтский крест
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Универсальный расклад</p>
          </div>
        </button>

      </div>
    </div>
  )
}