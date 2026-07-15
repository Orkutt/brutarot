// src/types.ts
export const CONTEXTS_SINGLE = [
  { key: "relationships",   label: "Отношения и любовь", icon: "💞" },
  { key: "career",          label: "Работа и карьера",   icon: "💼" },
  { key: "finance",         label: "Финансы",             icon: "💰" },
  { key: "health",          label: "Здоровье",            icon: "🌿" },
  { key: "answer",          label: "Ответ на вопрос",     icon: "🔍" },
  { key: "card_of_the_day", label: "Карта дня",           icon: "🌟" },
  { key: "advice",          label: "Совет",               icon: "🧭" },
] as const

export const CONTEXTS_TRIPLE = [
  { key: "relationships", label: "Отношения и любовь", icon: "💞" },
  { key: "career",        label: "Работа и карьера",   icon: "💼" },
  { key: "finance",       label: "Финансы",             icon: "💰" },
  { key: "health",        label: "Здоровье",            icon: "🌿" },
] as const

// Общий тип — объединение ключей обоих списков
export type ContextKey =
  | typeof CONTEXTS_SINGLE[number]["key"]
  | typeof CONTEXTS_TRIPLE[number]["key"]

export interface TarotCard {
  id: string
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
  meanings_by_context_value: string  // ← новое поле
}

export interface TripleSpreadResult {
  cards: TarotCard[]
  combos: Record<string, string>
  context: string
  llm_summary: string
}

export type Screen = 'menu' | 'single' | 'triple'