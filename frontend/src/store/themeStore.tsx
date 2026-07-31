// src/store/themeStore.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ThemeInfo {
  key: string
  name: string
  description: string
}

export const THEMES: ThemeInfo[] = [
  {
    key: 'night',
    name: 'Мистическая ночь',
    description: 'Тёмная тема с фиолетовыми акцентами',
  },
  {
    key: 'day',
    name: 'Знойный день',
    description: 'Светлая тема: слоновая кость, розовый, тёмно-коричневый',
  },
]

// CSS-переменные для каждой темы
const THEME_VARS: Record<string, Record<string, string>> = {
  night: {
    '--bg-primary':    '#020617',   // slate-950
    '--bg-secondary':  '#0f172a',   // slate-900
    '--bg-card':       '#1e1b4b',   // indigo-950
    '--border-main':   '#4c1d95',   // purple-900
    '--border-accent': '#7c3aed',   // purple-600
    '--text-primary':  '#ffffff',
    '--text-secondary':'#94a3b8',   // slate-400
    '--text-muted':    '#475569',   // slate-600
    '--accent-main':   '#7c3aed',   // purple-600
    '--accent-light':  '#c4b5fd',   // purple-300
    '--accent-glow':   'rgba(139,92,246,0.4)',
    '--slot-empty':    '#1e293b',
    '--tag-bg':        'rgba(109,40,217,0.4)',
    '--tag-border':    'rgba(109,40,217,0.4)',
    '--tag-text':      '#c4b5fd',
    '--interp-bg':     'rgba(30,27,75,0.6)',
    '--interp-border': 'rgba(67,56,202,0.5)',
  },
  day: {
    '--bg-primary':    'rgba(255, 250, 245, 1)',
    '--bg-secondary':  'rgba(250, 243, 224, 1)',
    '--bg-card':       'rgba(255, 250, 245, 0.78)',
    '--border-main':   'rgba(0, 0, 0, 0.12)',
    '--border-accent': 'rgba(210, 96, 76, 0.28)',
    '--text-primary':  'rgba(0, 0, 0, 1)',
    '--text-secondary':'rgba(0, 0, 0, 0.78)',
    '--text-muted':    'rgba(0, 0, 0, 0.52)',
    '--accent-main':   'rgba(210, 96, 76, 1)',
    '--accent-light':  '#rgba(232, 180, 163, 1)',
    '--accent-glow':   'rgba(210, 96, 76, 0.22)',
    '--slot-empty':    '#rgba(232, 180, 163, 0.14)',
    '--tag-bg':        'rgba(232, 180, 163, 0.18)',
    '--tag-border':    'rgba(210, 96, 76, 0.22)',
    '--tag-text':      'rgba(210, 96, 76, 1)',
    '--interp-bg':     'rgba(0, 0, 0, 0.05)',
    '--interp-border': 'rgba(0, 0, 0, 0.14)',
  },
}

function applyTheme(key: string) {
  const vars = THEME_VARS[key] ?? THEME_VARS.night
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

// CloudStorage helpers — промисифицируем колбэк-API Telegram
function tgGet(key: string): Promise<string | null> {
  return new Promise(resolve => {
    const cs = window.Telegram?.WebApp?.CloudStorage
    if (!cs) return resolve(null)
    cs.getItem(key, (_err: unknown, value: string) => resolve(value ?? null))
  })
}
function tgSet(key: string, value: string): Promise<void> {
  return new Promise(resolve => {
    const cs = window.Telegram?.WebApp?.CloudStorage
    if (!cs) return resolve()
    cs.setItem(key, value, () => resolve())
  })
}

interface ThemeContextType {
  theme: ThemeInfo
  setTheme: (t: ThemeInfo) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[0],
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeInfo>(THEMES[0])

  // Загружаем сохранённые настройки при старте
  useEffect(() => {
    async function load() {
      const savedTheme = await tgGet('theme')
      const savedDeck  = await tgGet('deck')

      if (savedTheme) {
        const found = THEMES.find(t => t.key === savedTheme)
        if (found) { setThemeState(found); applyTheme(found.key) }
      } else {
        applyTheme('night')  // дефолт
      }

      // Возвращаем ключ колоды — его подхватит DeckProvider
      return savedDeck
    }
    load()
  }, [])

  const setTheme = async (t: ThemeInfo) => {
    setThemeState(t)
    applyTheme(t.key)
    await tgSet('theme', t.key)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}