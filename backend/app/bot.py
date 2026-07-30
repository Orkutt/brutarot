# app/bot.py
from aiogram import Bot, Dispatcher, Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from app.config import settings
import os

# Router — это как "группа маршрутов" в FastAPI.
# В маленьком проекте он один, но структура уже правильная.
router = Router()

@router.message(Command("start"))
async def cmd_start(message: Message):
    
    await message.answer(
        "✨ Добро пожаловать!\n\n"
        "Нажми кнопку ниже, чтобы вытащить карту таро и узнать, "
        "что готовит тебе день.",
        )

@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "Просто нажми кнопку «Давай гадать!» — и колода сама выберет твою карту дня."
    )


def get_bot_and_dispatcher():
    """Фабрика — возвращает готовые Bot и Dispatcher с подключёнными роутерами."""
    bot = Bot(token=settings.BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)
    return bot, dp

async def send_spread_result(
    user_id: int,
    cards: list[dict],
    summary: str,
    bot: Bot
) -> None:
    """Отправляет результат расклада в чат пользователя с ботом."""

    # Формируем строку с картами
    cards_line = " — ".join(
        f"{c['name_ru']}, {'перевёрнутая' if c['reversed'] else 'прямая'}"
        for c in cards
    )

    text = f"🔮 *Расклад Триплет*\n\n{cards_line}\n\n{summary}"

    await bot.send_message(
        chat_id=user_id,
        text=text,
        parse_mode="Markdown"
    )

async def setup_webhook(bot: Bot, webhook_url: str) -> None:
    await bot.set_webhook(
    url=f"{webhook_url}/webhook",
    drop_pending_updates=True)

async def remove_webhook(bot: Bot) -> None:
    await bot.delete_webhook(drop_pending_updates=True)