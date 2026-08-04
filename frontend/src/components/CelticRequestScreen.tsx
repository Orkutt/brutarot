// src/components/CelticRequestScreen.tsx
import { useState } from 'react'

interface Props {
  onSubmit: (request: string) => void
  onBack: () => void
}

const THEMES = [
  {
    label: 'Понять текущую ситуацию',
    questions: [
      'В чём суть моей текущей ситуации? Какие ключевые моменты сейчас в фокусе?',
      'Какие события недавнего прошлого привели меня к этому состоянию?',
      'Что лежит в основе проблемы — какие скрытые мотивы или давние решения влияют на сейчас?',
    ],
  },
  {
    label: 'Выявить препятствия',
    questions: [
      'Какое непосредственное препятствие мешает мне двигаться вперёд?',
      'Есть ли внутренние или внешние конфликты, которые нужно разрешить?',
      'Что может стать серьёзным барьером на пути к цели?',
    ],
  },
  {
    label: 'Прояснить цели и ожидания',
    questions: [
      'К чему я сознательно стремлюсь в этой ситуации?',
      'Совпадают ли мои истинные желания с тем, что я вижу как цель?',
      'Какие мои неосознанные движущие силы влияют на решения?',
    ],
  },
  {
    label: 'Спрогнозировать ближайшие шаги',
    questions: [
      'Что произойдёт в ближайшем будущем, если я ничего не изменю?',
      'Какой следующий практический шаг я могу сделать, опираясь на текущую динамику?',
      'Какие события в ближайшие недели будут иметь решающее значение?',
    ],
  },
  {
    label: 'Оценить себя и внешнее влияние',
    questions: [
      'Как я сам воспринимаю эту ситуацию, какое у меня сейчас эмоциональное состояние?',
      'Кто из моего окружения косвенно влияет на ход событий?',
      'Какие внешние обстоятельства или люди могут сыграть ключевую роль?',
    ],
  },
  {
    label: 'Разобраться в надеждах и страхах',
    questions: [
      'На что я надеюсь в этой ситуации?',
      'Чего я опасаюсь больше всего?',
      'Как мои тревоги могут повлиять на мои действия?',
    ],
  },
  {
    label: 'Получить итоговую перспективу',
    questions: [
      'Какой вероятный исход всей цепочки событий, если всё пойдёт своим чередом?',
      'Чем в итоге завершится эта история с учётом всех факторов из расклада?',
    ],
  },
]

export default function CelticRequestScreen({ onSubmit, onBack }: Props) {
  const [text, setText]               = useState('')
  const [openTheme, setOpenTheme]     = useState<number | null>(null)

  const handleSelectQuestion = (q: string) => {
    setText(q)
    setOpenTheme(null)
  }

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      <header className="relative flex items-center px-4 pt-6 pb-3">
        <button onClick={onBack} className="absolute left-4 text-sm"
                style={{ color: 'var(--text-secondary)' }}>
          ← Назад
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center"
            style={{ color: 'var(--accent-light)' }}>
          Кельтский крест
        </h1>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-2 pb-10 gap-4 overflow-y-auto">

        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Сформулируйте ваш запрос
        </p>

        {/* Поле ввода своего вопроса */}
        <div className="flex items-start gap-2 rounded-xl border p-3"
             style={{ borderColor: 'var(--border-accent)',
                      background: 'var(--bg-secondary)' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Введите свой вопрос..."
            rows={3}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed
                       placeholder:opacity-40"
            style={{ color: 'var(--text-primary)' }}
          />
          <span className="text-xl mt-0.5 select-none flex-shrink-0"
                style={{ color: 'var(--accent-main)' }}>?</span>
        </div>

        {/* Кнопка к картам */}
        <button
          onClick={() => text.trim() && onSubmit(text.trim())}
          disabled={!text.trim()}
          className={`py-3 rounded-xl text-sm font-medium transition-all
                      ${text.trim() ? 'deck-glow active:scale-95' : 'cursor-not-allowed opacity-40'}`}
          style={{
            background: text.trim() ? 'var(--accent-main)' : 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          🃏 К картам
        </button>

        {/* Разделитель */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border-main)' }}/>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            или выберите готовый вопрос
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border-main)' }}/>
        </div>

        {/* Аккордеон тем */}
        <div className="flex flex-col gap-2">
          {THEMES.map((theme, ti) => (
            <div key={ti} className="rounded-xl border overflow-hidden"
                 style={{ borderColor: 'var(--border-main)' }}>

              {/* Заголовок темы */}
              <button
                onClick={() => setOpenTheme(openTheme === ti ? null : ti)}
                className="w-full flex items-center justify-between px-3 py-2.5
                           text-sm text-left transition-all"
                style={{
                  background: openTheme === ti ? 'var(--tag-bg)' : 'var(--bg-secondary)',
                  color: openTheme === ti ? 'var(--accent-light)' : 'var(--text-secondary)',
                }}
              >
                <span>{theme.label}</span>
                <span className="text-xs ml-2 flex-shrink-0 transition-transform duration-200"
                      style={{ transform: openTheme === ti ? 'rotate(180deg)' : 'none' }}>
                  ▾
                </span>
              </button>

              {/* Вопросы темы */}
              {openTheme === ti && (
                <div className="flex flex-col divide-y"
                     style={{ borderColor: 'var(--border-main)' }}>
                  {theme.questions.map((q, qi) => (
                    <button
                      key={qi}
                      onClick={() => handleSelectQuestion(q)}
                      className="px-3 py-2.5 text-xs text-left leading-relaxed
                                 transition-all hover:brightness-110 active:scale-98"
                      style={{
                        background: text === q ? 'var(--interp-bg)' : 'var(--bg-primary)',
                        color: text === q ? 'var(--accent-light)' : 'var(--text-secondary)',
                        borderColor: 'var(--border-main)',
                      }}
                    >
                      {text === q && <span className="mr-1">✓</span>}
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}