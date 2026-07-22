# app/services/gigachat_service.py
import httpx
import time
import uuid
from app.config import settings

# Кэш токена в памяти
_token_cache: dict = {"token": None, "expires_at": 0}

GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_API_URL  = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"


async def get_access_token() -> str:
    """Получает OAuth-токен. Возвращает кэшированный если не истёк."""
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"]:
        return _token_cache["token"]

    async with httpx.AsyncClient(verify=False) as client:  # GigaChat использует корп. сертификат
        response = await client.post(
            GIGACHAT_AUTH_URL,
            headers={
                "Authorization": f"Basic {settings.GIGACHAT_AUTH_KEY}",
                "RqUID": str(uuid.uuid4()),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"scope": settings.GIGACHAT_SCOPE},
        )
        response.raise_for_status()
        data = response.json()

    _token_cache["token"] = data["access_token"]
    # Токен живёт 30 минут, обновляем за 60 секунд до истечения
    _token_cache["expires_at"] = now + data.get("expires_in", 1800) - 60

    return _token_cache["token"]


def build_prompt(cards: list[dict], combos: dict, context: str) -> str:
    """Формирует промпт для GigaChat."""

    context_labels = {
        "relationships": "Отношения и любовь",
        "career":        "Работа и карьера",
        "finance":       "Финансы",
        "health":        "Здоровье",
        "answer":        "Ответ на вопрос / Ситуация",
    }
    context_label = context_labels.get(context, context)

    position_names = ["прошлое", "настоящее", "будущее"]
    combo_after = {0: "1-2", 1: "2-3"}  # комбо после 1-й и 2-й карты

    card_blocks = []
    for i, card in enumerate(cards):
        pos   = position_names[i]
        rev   = "перевёрнутая" if card["reversed"] else "прямая"
        name  = f"{card['name_ru']} ({card['name_en']})"
        gen   = card.get("meaning_general", "")
        ctx   = card.get("meanings_by_context_value", "")

        block = (
            f"Карта {i+1} ({pos}): {name}, {rev}.\n"
            f"Общее значение: {gen}"
        )
        if ctx:
            block += f"\nЗначение для запроса «{context_label}»: {ctx}"

        # Комбо между этой и следующей картой
        combo_key = combo_after.get(i)
        if combo_key and combo_key in combos:
            block += f"\nВажно: сочетание этой карты со следующей — {combos[combo_key]}"

        card_blocks.append(block)

    cards_text = "\n\n".join(card_blocks)

    return (
        f"Ты — профессиональный таролог. Выражаешься мягко и загадочно.\n"
        f"К тебе пришли с запросом погадать на тему: «{context_label}».\n\n"
        f"{cards_text}\n\n"
        f"Дай итоговое предсказание по всей полученной информации. "
        f"Пиши связно, не перечисляй карты отдельно — дай целостное толкование расклада."
    )


async def get_llm_summary(cards: list[dict], combos: dict, context: str) -> str:
    """Основная функция: получает интерпретацию от GigaChat."""
    token = await get_access_token()
    prompt = build_prompt(cards, combos, context)

    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(
            GIGACHAT_API_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "model": "GigaChat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.85,
                "max_tokens": 600,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"].strip()