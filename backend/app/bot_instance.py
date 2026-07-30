# app/bot_instance.py
# Хранилище глобального экземпляра бота — отдельно от main.py
# чтобы избежать circular import
from aiogram import Bot

bot_instance: Bot | None = None

def set_bot(bot: Bot) -> None:
    global bot_instance
    bot_instance = bot

def get_bot() -> Bot | None:
    return bot_instance