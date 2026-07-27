// src/store/deckStore.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

export interface DeckInfo {
  key: string
  name: string
  cover: string   // путь к cover.jpg относительно /cards/
  sample: string  // путь к m06.jpg
  description: string
}

export const DECKS: DeckInfo[] = [
  {
    key: 'classic',
    name: 'Классическое Таро',
    cover: 'classic/cover.jpg',
    sample: 'classic/m06.jpg',
    description: 'Классическое Таро Райдера-Уэйта — самая известная колода в мире, созданная в 1909 году. Богатая символика и интуитивные образы.',
  },
  {
    key: 'dragons',
    name: 'Кельтские Драконы',
    cover: 'dragons/cover.jpg',
    sample: 'dragons/m06.jpg',
    description: 'Таро кельтских драконов — мистическая колода, вдохновлённая кельтской мифологией и легендами о драконах.',
  },
  {
    key: 'fantastical_creatures',
    name: 'Фантастические Существа',
    cover: 'fantastical_creatures/cover.jpg',
    sample: 'fantastical_creatures/m06.jpg',
    description: 'Таро Фантастических Существ — яркая колода с образами мифических существ из легенд разных культур мира.',
  },
  {
    key: 'secret',
    name: 'Заповедный Лес',
    cover: 'secret/cover.jpg',
    sample: 'secret/m06.jpg',
    description: 'Таро Заповедного Леса — нежная колода с образами лесных животных и растений, полная природной магии.',
  },
]

interface DeckContextType {
  deck: DeckInfo
  setDeck: (deck: DeckInfo) => void
}

const DeckContext = createContext<DeckContextType>({
  deck: DECKS[0],
  setDeck: () => {},
})

export function DeckProvider({ children }: { children: ReactNode }) {
  const [deck, setDeck] = useState<DeckInfo>(DECKS[0])
  return (
    <DeckContext.Provider value={{ deck, setDeck }}>
      {children}
    </DeckContext.Provider>
  )
}

export function useDeck() {
  return useContext(DeckContext)
}