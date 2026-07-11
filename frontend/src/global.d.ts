export {};

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        onEvent: (eventName: string, callback: () => void) => void;
        // добавь сюда любые другие методы, которые будешь использовать
      };
    };
  }
}
