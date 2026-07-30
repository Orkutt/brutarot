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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8"
     style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

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
        <h1 className="text-4xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>У ведьмы-гадалки</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Колода: <span className="" style={{ color: 'var(--text-secondary)' }}>{deck.name}</span>
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Выбери тип расклада</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">

        <button
          onClick={() => onSelect('single')}
          className="flex items-center gap-4 p-5 rounded-2xl border
                    hover:brightness-110 active:scale-95
                     transition-all text-center group"
                     style={{ borderColor: 'var(--border-accent)', background: 'var(--tag-bg)' }}
        >
          <span className="text-3xl"></span>
          <div>
            <p className="font-medium group-hover:brightness-110 transition-colors"
            style={{ color: 'var(--text-primary)' }}>
              Одна карта
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Быстрый ответ или карта дня
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect('triple')}
          className="flex items-center gap-4 p-5 rounded-2xl border
                     hover:brightness-110 active:scale-95
                     transition-all text-center group"
                     style={{ borderColor: 'var(--border-accent)', background: 'var(--tag-bg)' }}
        >
          <span className="text-3xl"></span>
          <div>
            <p className="font-medium group-hover:brightness-110 transition-colors"
            style={{ color: 'var(--text-primary)' }}>
              Триплет
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Прошлое · Настоящее · Будущее
            </p>
          </div>
        </button>

        {/* Кельтский крест */}
        <button
          onClick={() => onSelect('celtic')}
          className="flex items-center gap-4 p-5 rounded-2xl border border-teal-800
                     bg-teal-950/40 hover:brightness-110 active:scale-95
                     transition-all text-center group opacity-60"
          // opacity-60 и cursor пока говорят что режим в разработке
        >
          <span className="text-3xl"></span>
          <div>
            <p className="font-medium group-hover:brightness-110 transition-colors"
              style={{ color: 'var(--text-primary)' }}>
              Кельтский крест
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}
              >Универсальный расклад</p>
          </div>
        </button>

      </div>
    </div>
  )
}