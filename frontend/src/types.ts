// src/types.ts

// Одна карта — отдельный контекст только для single
export const CONTEXTS_SINGLE = [
  { key: "one_card",        label: "Одна карта",              icon: "🃏" },
  { key: "card_of_the_day", label: "Карта дня",               icon: "🌟" },
  { key: "relationships",   label: "Отношения и любовь",      icon: "💞" },
  { key: "career",          label: "Работа и карьера",        icon: "💼" },
  { key: "finance",         label: "Финансы",                 icon: "💰" },
  { key: "health",          label: "Здоровье",                icon: "🌿" },
  { key: "answer",          label: "Ответ на вопрос / Ситуация", icon: "🔍" },
  { key: "advice",          label: "Совет",                   icon: "🧭" },
] as const

export const CONTEXTS_TRIPLE = [
  { key: "relationships",   label: "Отношения и любовь",      icon: "💞" },
  { key: "career",          label: "Работа и карьера",        icon: "💼" },
  { key: "finance",         label: "Финансы",                 icon: "💰" },
  { key: "health",          label: "Здоровье",                icon: "🌿" },
] as const

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
  img: string           // теперь вида "classic/m00.jpg"
  keywords: string[]
  numerology: string
  elemental: string
  reversed: boolean
  context: string
  interpretation: string
  meaning_general: string
  meanings_by_context_value: string
}

export interface TripleSpreadResult {
  cards: TarotCard[]
  combos: Record<string, string>
  context: string
  llm_summary: string
  llm_package: string   // ← новое
}

// Тип экрана
export type Screen = 'menu' | 'single' | 'triple' | 'celtic' | 'settings'

// Режим расклада — передаём в MixingScreen
export type SpreadMode = 'single' | 'triple' | 'celtic'

export interface CelticSpreadResult {
  cards: TarotCard[]
  combos: Record<string, string>
  llm_summary: string
}