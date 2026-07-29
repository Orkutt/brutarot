// src/global.d.ts
export {}
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        onEvent: (eventName: string, callback: () => void) => void
        sendData: (data: string) => void
        initDataUnsafe: {
          user?: { id: number; first_name: string; username?: string }
        }
        CloudStorage: {
          getItem: (key: string, cb: (err: unknown, value: string) => void) => void
          setItem: (key: string, value: string, cb?: () => void) => void
          removeItem: (key: string, cb?: () => void) => void
        }
      }
    }
  }
}