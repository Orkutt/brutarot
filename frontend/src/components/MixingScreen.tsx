// src/components/MixingScreen.tsx
import { useState } from 'react'
import { SpreadMode } from '../types'
import { useDeck } from '../store/deckStore'
import { API_URL } from '../constants'


interface Props {
  mode: SpreadMode
  onCardSelected: (indices: number[]) => void  // индексы выбранных карт
  onBack: () => void
}

type Phase = 'idle' | 'mixing' | 'selecting'

const CARD_COUNT = 3  // всегда показываем 3 карты на выбор

export default function MixingScreen({ mode, onCardSelected, onBack }: Props) {
  const { deck } = useDeck()
  const coverUrl = `${API_URL}/cards/${deck.cover}`
  const [phase, setPhase]           = useState<Phase>('idle')
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [chosen, setChosen]           = useState<number[]>([])  // уже добавленные в расклад
  const totalNeeded = mode === 'single' ? 1 : 3

  const handleMix = () => {
  if (phase !== 'idle') return
  setPhase('mixing')
  setHighlighted(null)
  // Увеличили анимацию до 2.5с
  setTimeout(() => setPhase('selecting'), 2500)
  }

  const handleCardClick = (idx: number) => {
  if (phase !== 'selecting') return
  if (chosen.includes(idx)) return

  if (highlighted === idx) {
    const newChosen = [...chosen, idx]
    setChosen(newChosen)
    setHighlighted(null)

    if (newChosen.length >= totalNeeded) {
      setTimeout(() => onCardSelected(newChosen), 400)
    }
    // ← убрали else-ветку с возвратом в idle
    // просто снимаем подсветку, юзер выбирает следующую из тех же трёх карт
  } else {
    setHighlighted(idx)
  }
  }

  const needsMoreCards = chosen.length < totalNeeded
  const canMix = phase === 'idle'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      <header className="relative flex items-center px-4 pt-6 pb-3 gap-3">
        <button onClick={onBack} className="absolute left-4 text-slate-400 hover:text-white text-sm">
          ← Назад
        </button>
        <h1 className="text-lg font-semibold text-purple-300 flex-1 text-center">
          {mode === 'single' ? 'Одна карта' : 'Триплет'}
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-8 gap-6">

        {/* Подсказка */}
              <>
        {phase === 'idle' && chosen.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-2">Перемешай колоду и выбери три карты</p>
        )}
        {phase === 'selecting' && (
          <>
            <p className="text-slate-400 text-sm text-center mt-2">
              Выбрано {chosen.length} из {totalNeeded} — выбери ещё
            </p>
            {highlighted === null ? (
              <p className="text-slate-400 text-sm text-center mt-1">Нажми на карту, чтобы выбрать</p>
            ) : (
              <p className="text-slate-400 text-sm text-center mt-1">Нажми ещё раз, чтобы добавить в расклад</p>
            )}
          </>
        )}
      </>


        {/* Колода */}
        <div
          className={`relative w-36 h-56 deck-wrap`}
          style={phase === 'mixing' ? {
            animation: 'deckSettle 2.5s ease-in-out forwards'
          } : undefined}
        >

          {/* Стопка карт (иллюзия глубины) */}
          {[3, 2, 1].map(offset => (
            <div
              key={offset}
              className="absolute rounded-xl border border-purple-800/50"
              style={{
                top: -offset * 2,
                left: offset * 1,
                width: '100%',
                height: '100%',
                background: '#1e1b4b',
                zIndex: offset,
              }}
            />
          ))}

          {/* Верхняя карта — рубашка */}
          <div
            className="absolute w-full h-full rounded-xl overflow-hidden border-2 border-purple-700"
            style={{ zIndex: 4 }}
          >
            <img
              src={coverUrl}
              alt="Колода"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Анимация перемешивания — 2 слоя карт */}
          {phase === 'mixing' && (
            <>
              {/* Фоновый слой — двигается меньше */}
              {[0, 1].map(i => (
                <div
                  key={`bg-${i}`}
                  className="absolute w-full h-full rounded-xl overflow-hidden border border-purple-800/60"
                  style={{
                    zIndex: 5 + i,
                    animation: `shuffleBg${i} 2.5s ease-in-out forwards`,
                    background: '#1e1b4b',
                  }}
                >
                  <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-60"/>
                </div>
              ))}

              {/* Верхний слой — активные карты с сильным 3D */}
              {[0, 1, 2].map(i => (
                <div
                  key={`top-${i}`}
                  className="absolute w-full h-full rounded-xl overflow-hidden border-2 border-purple-500/80"
                  style={{
                    zIndex: 8 + i,
                    animation: `shuffleTop${i} 2.5s ease-in-out forwards`,
                    background: '#1e1b4b',
                  }}
                >
                  <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-90"/>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Три карты на выбор — появляются в фазе selecting */}
        {phase === 'selecting' && (
          <div className="flex gap-3 justify-center mt-2">
            {Array.from({ length: CARD_COUNT }).map((_, idx) => {
              const isChosen      = chosen.includes(idx)
              const isHighlighted = highlighted === idx

              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`
                    relative w-20 h-32 rounded-xl overflow-hidden cursor-pointer
                    border-2 transition-all duration-300 select-none
                    ${isChosen
                      ? 'opacity-30 border-slate-700 cursor-default'
                      : isHighlighted
                        ? 'border-yellow-400 shadow-lg shadow-yellow-500/40 scale-105 -translate-y-3'
                        : 'border-purple-600 hover:border-purple-400 hover:-translate-y-2'
                    }
                  `}
                  style={{
                    // Карты чуть выдвинуты из "колоды" — разные углы
                    transform: isHighlighted
                      ? 'translateY(-12px) scale(1.05)'
                      : isChosen
                        ? 'translateY(0)'
                        : `translateY(-8px) rotate(${(idx - 1) * 4}deg)`,
                  }}
                >
                  <img
                    src={coverUrl}
                    alt="Карта"
                    className="w-full h-full object-cover"
                  />
                  {isHighlighted && (
                    <div className="absolute inset-0 bg-yellow-400/10 flex items-end
                                    justify-center pb-2">
                      <span className="text-yellow-300 text-xs">✓ ещё раз</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Кнопка перемешать */}
        <button
          onClick={handleMix}
          disabled={!canMix}
          className={`
            px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300
            ${canMix && needsMoreCards
              ? 'bg-purple-700 text-white deck-glow hover:bg-purple-600 active:scale-95'
              : canMix && !needsMoreCards
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-purple-900/40 text-purple-600 cursor-not-allowed'
            }
          `}
        >
          {phase === 'mixing' ? '⟳ Перемешиваем...' : 'Перемешать колоду'}
        </button>

        {/* Рамки-слоты для выбранных карт (только для триплета) */}
        {mode === 'triple' && (
          <div className="flex gap-3 mt-2">
            {Array.from({ length: 3 }).map((_, i) => {
              const isFilled = i < chosen.length
              return (
                <div
                  key={i}
                  className={`
                    w-20 h-32 rounded-xl border-2 border-dashed flex items-center
                    justify-center transition-all duration-500
                    ${isFilled
                      ? 'border-purple-500 bg-purple-950/50'
                      : 'border-slate-700 bg-slate-900/30'
                    }
                  `}
                >
                  {isFilled ? (
                    <img
                      src={coverUrl}
                      alt="Выбранная карта"
                      className="w-full h-full object-cover rounded-xl opacity-80"
                    />
                  ) : (
                    <span className="text-slate-600 text-xs text-center px-1">
                      {i + 1}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </main>

      <style>{`
        /* Родитель колоды — перспектива для 3D-эффекта */
        .deck-wrap {
          perspective: 600px;
          transform-style: preserve-3d;
        }

        /* ── Фоновые карты (тихий слой) ── */
        @keyframes shuffleBg0 {
          0%   { transform: translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          25%  { transform: translate3d(-28px,-12px,-30px) rotateY(-18deg) rotateZ(-6deg) scale(0.94); }
          55%  { transform: translate3d(22px, 8px,-20px) rotateY( 12deg) rotateZ( 4deg) scale(0.96); }
          80%  { transform: translate3d(-10px,-4px,-10px) rotateY(-5deg)  rotateZ(-2deg) scale(0.98); }
          100% { transform: translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1);   opacity: 0; }
        }
        @keyframes shuffleBg1 {
          0%   { transform: translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 0; }
          15%  { opacity: 1; }
          30%  { transform: translate3d(24px,-16px,-25px) rotateY(14deg) rotateZ(5deg) scale(0.95); }
          60%  { transform: translate3d(-18px,10px,-15px) rotateY(-10deg) rotateZ(-3deg) scale(0.97); }
          85%  { transform: translate3d(8px,-3px,-8px) rotateY(4deg) rotateZ(1deg) scale(0.99); }
          100% { transform: translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1);  opacity: 0; }
        }

        /* ── Верхние карты (активный слой) ── */
        @keyframes shuffleTop0 {
          0%   { transform: translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 1; }
          20%  { transform: translate3d(-55px,-18px, 20px) rotateX(8deg)  rotateY(-28deg) rotateZ(-12deg) scale(0.88); }
          45%  { transform: translate3d( 40px, 10px,-10px) rotateX(-5deg) rotateY( 20deg) rotateZ(  8deg) scale(0.92); }
          70%  { transform: translate3d(-20px,-6px,  8px) rotateX(3deg)  rotateY(-10deg) rotateZ( -4deg) scale(0.97); }
          88%  { transform: translate3d(  5px, 2px,  2px) rotateX(-1deg) rotateY(  3deg) rotateZ(  1deg) scale(1.01); }
          100% { transform: translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);        opacity: 0; }
        }
        @keyframes shuffleTop1 {
          0%   { transform: translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 1; }
          15%  { transform: translate3d( 50px,-22px, 15px) rotateX(-10deg) rotateY( 24deg) rotateZ( 14deg) scale(0.86); }
          40%  { transform: translate3d(-35px, 14px,-12px) rotateX(  6deg) rotateY(-18deg) rotateZ(-10deg) scale(0.91); }
          68%  { transform: translate3d( 18px, -4px,  6px) rotateX( -2deg) rotateY(  8deg) rotateZ(  3deg) scale(0.98); }
          87%  { transform: translate3d( -4px,  1px,  1px) rotateX(  1deg) rotateY( -2deg) rotateZ( -1deg) scale(1.01); }
          100% { transform: translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);          opacity: 0; }
        }
        @keyframes shuffleTop2 {
          0%   { transform: translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 1; }
          25%  { transform: translate3d(-30px, 20px, 25px) rotateX( 12deg) rotateY(-22deg) rotateZ(-16deg) scale(0.84); }
          50%  { transform: translate3d( 45px,-10px,-15px) rotateX( -7deg) rotateY( 16deg) rotateZ( 11deg) scale(0.90); }
          72%  { transform: translate3d(-15px,  5px,  4px) rotateX(  4deg) rotateY( -7deg) rotateZ( -3deg) scale(0.97); }
          90%  { transform: translate3d(  3px, -1px,  0px) rotateX( -1deg) rotateY(  2deg) rotateZ(  1deg) scale(1.00); }
          100% { transform: translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);          opacity: 0; }
        }

        /* Settle-bounce колоды в конце */
        @keyframes deckSettle {
          0%,100% { transform: translate3d(0,0,0) rotateX(0deg); }
          20%     { transform: translate3d(0,-6px, 8px) rotateX(4deg); }
          50%     { transform: translate3d(0, 3px,-4px) rotateX(-2deg); }
          80%     { transform: translate3d(0,-1px, 2px) rotateX(1deg); }
        }
      `}</style>
    </div>
  )
}