// src/utils/telegram.ts

export function getTelegramUserId(): number | null {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null
}

/**
 * Ждёт пока Telegram WebApp полностью инициализируется.
 * В браузере (не в Telegram) резолвится сразу.
 */
export function waitForTelegramWebApp(): Promise<void> {
  return new Promise(resolve => {
    // Уже готов
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      resolve()
      return
    }
    // Ждём события загрузки скрипта Telegram
    const script = document.querySelector('script[src*="telegram-web-app"]')
    if (script) {
      script.addEventListener('load', () => {
        window.Telegram?.WebApp?.ready()
        window.Telegram?.WebApp?.expand()
        resolve()
      })
    } else {
      // Не в Telegram — резолвимся сразу
      resolve()
    }
  })
}