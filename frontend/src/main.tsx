// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DeckProvider } from './store/deckStore'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeckProvider>
      <App />
    </DeckProvider>
  </React.StrictMode>
)