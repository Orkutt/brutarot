// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DeckProvider } from './store/deckStore'
import { ThemeProvider } from './store/themeStore'
import { waitForTelegramWebApp } from './utils/telegram'

async function init() {
  // Ждём инициализации Telegram WebApp прежде чем монтировать React
  await waitForTelegramWebApp()

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider>
        <DeckProvider>
          <App />
        </DeckProvider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

init()