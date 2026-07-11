// src/types.ts
export const CONTEXTS = [
  { key: "relationships",  label: "Отношения и любовь", icon: "💞" },
  { key: "career",         label: "Работа и карьера",   icon: "💼" },
  { key: "finance",        label: "Финансы",             icon: "💰" },
  { key: "health",         label: "Здоровье",            icon: "🌿" },
  { key: "answer",         label: "Ответ на вопрос",     icon: "🔍" },
  { key: "card_of_the_day", label: "Карта дня",          icon: "🌟" },
  { key: "advice",         label: "Совет",               icon: "🧭" },
] as const

export type ContextKey = typeof CONTEXTS[number]["key"]

export interface TarotCard {
  name_ru: string
  name_en: string
  number: string
  arcana: string
  suit: string
  img: string
  keywords: string[]
  numerology: string
  elemental: string
  reversed: boolean
  context: string
  interpretation: string
  meaning_general: string
}