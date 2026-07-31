// src/store/storage.ts
// Проверяем наличие CloudStorage в момент вызова, не при импорте модуля

function isCloudStorageAvailable(): boolean {
  return !!window.Telegram?.WebApp?.CloudStorage
}

export function storageGet(key: string): Promise<string | null> {
  if (!isCloudStorageAvailable()) {
    console.log(`📦 localStorage.get: ${key} =`, localStorage.getItem(key))
    return Promise.resolve(localStorage.getItem(key))
  }
  return new Promise(resolve => {
    window.Telegram!.WebApp.CloudStorage.getItem(
      key,
      (err: unknown, value: string) => {
        console.log(`☁️ CloudStorage.get: ${key} =`, value, err ? `err: ${err}` : '')
        resolve(err || !value ? null : value)
      }
    )
  })
}

export function storageSet(key: string, value: string): Promise<void> {
  if (!isCloudStorageAvailable()) {
    console.log(`📦 localStorage.set: ${key} =`, value)
    localStorage.setItem(key, value)
    return Promise.resolve()
  }
  return new Promise(resolve => {
    window.Telegram!.WebApp.CloudStorage.setItem(key, value, () => {
      console.log(`☁️ CloudStorage.set: ${key} =`, value)
      resolve()
    })
  })
}