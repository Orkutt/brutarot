// src/components/CelticCard.tsx
import { useState, useEffect, useRef } from 'react'
import { TarotCard } from '../types'
import { useDeck } from '../store/deckStore'
import { API_URL } from '../constants'

const POSITION_NAMES = [
  'Ситуация', 'Влияние', 'Подсказка', 'Истоки',
  'Прошлое', 'Будущее', 'Вы', 'Внешние факторы',
  'Надежды и опасения', 'Итог',
]

interface Props {
  card: TarotCard
  index: number
  revealed: boolean
  isSecondCard?: boolean
}

export default function CelticCard({ card, index, revealed, isSecondCard }: Props) {
  const { deck } = useDeck()
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const coverUrl = `${API_URL}/cards/${deck.cover}`
  const imageUrl = `${API_URL}/cards/${deck.key}/${card.img.split('/').pop()}`

  // Закрываем по тапу в любое место за пределами карты
  useEffect(() => {
    if (!expanded) return
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    // Небольшая задержка чтобы текущий клик не сработал сразу
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside)
      document.addEventListener('touchstart', handleOutside)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [expanded])

  return (
    // Обёртка с relative — внутри неё абсолютно позиционируем увеличенную карту
    <div className="flex flex-col items-center" style={{ width: '52px', position: 'relative' }}>

      {/* Карта — нормальный размер */}
      <div
        ref={cardRef}
        style={{
          width: '44px',
          height: '64px',
          cursor: revealed ? 'pointer' : 'default',
          // При расширении — невидима но место занимает (expanded карта абсолютная)
          visibility: expanded ? 'hidden' : 'visible',
        }}
        onClick={() => revealed && setExpanded(s => !s)}
      >
        <div className={`card-inner ${revealed ? 'flipped' : ''}`}
             style={{ width: '100%', height: '100%' }}>
          <div className="card-face rounded-lg overflow-hidden border"
               style={{ borderColor: 'var(--border-main)' }}>
            <img src={coverUrl} alt="" className="w-full h-full object-cover"/>
          </div>
          <div className="card-face card-back rounded-lg overflow-hidden border"
               style={{ borderColor: 'var(--accent-main)' }}>
            <img src={imageUrl} alt={card.name_ru}
                 className={`w-full h-full object-contain
                             ${card.reversed ? 'rotate-180' : ''}`}
                 style={{ background: 'var(--bg-card)' }}/>
          </div>
        </div>
      </div>

      {/* Номер позиции */}
      <p className="text-xs mt-0.5 font-medium"
         style={{ color: 'var(--text-muted)' }}>
        {index + 1}
      </p>

      {/* Увеличенная карта — абсолютно поверх всего */}
      {revealed && expanded && (
        <div
          ref={cardRef}
          onClick={() => setExpanded(false)}
          className="slide-up"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            rotate: isSecondCard ? '-90deg' : '0deg',
          }}
        >
          {/* Затемнение фона */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.15)',
              zIndex: -1,
              rotate: isSecondCard ? '-90deg' : '0deg',
            }}
          />

          {/* Увеличенная карта — всегда вертикальная */}
          <div style={{ width: '96px', height: '160px' }}>
            <div className="card-inner flipped"
                 style={{ width: '100%', height: '100%' }}>
              <div className="card-face rounded-xl overflow-hidden border-2"
                   style={{ borderColor: 'var(--border-main)' }}>
                <img src={coverUrl} alt="" className="w-full h-full object-cover"/>
              </div>
              <div className="card-face card-back rounded-xl overflow-hidden border-2"
                   style={{ borderColor: 'var(--accent-main)' }}>
                {/* Карта 2 (isSecondCard) показывается вертикально без rotate */}
                <img src={imageUrl} alt={card.name_ru}
                     className={`w-full h-full object-contain
                                 ${card.reversed ? 'rotate-180' : ''}`}
                     style={{ background: 'var(--bg-card)' }}/>
              </div>
            </div>
          </div>

          {/* Информация о карте */}
          <div className="rounded-xl border px-4 py-3 text-center"
               style={{
                 background: 'var(--bg-secondary)',
                 borderColor: 'var(--border-accent)',
                 minWidth: '140px',
               }}>
            <p className="text-xs mt-1" style={{ color: 'var(--accent-light)' }}>
              {POSITION_NAMES[index]}
            </p>
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {card.name_ru}
            </p>            
            {card.reversed && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--accent-main)' }}>
                перевёрнутая
              </p>
            )}
          </div>          
        </div>
      )}

    </div>
  )
}