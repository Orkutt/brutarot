# app/bot.py
from aiogram import Bot, Dispatcher, Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from app.config import settings

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