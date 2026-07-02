// src/types.ts
export interface CardMeanings {
  light: string[]
  shadow: string[]
}

export interface TarotCard {
  name: string
  number: string
  arcana: string
  suit: string
  img: string
  keywords: string[]
  fortune_telling: string[]
  interpretation: string
  reversed: boolean
  meanings: CardMeanings
  questions_to_ask: string[]
  elemental: string
  archetype: string
}