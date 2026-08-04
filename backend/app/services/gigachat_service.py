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


CELTIC_POSITION_NAMES = [
    "Ситуация",
    "Влияние",
    "Подсказка",
    "Истоки",
    "Прошлое",
    "Будущее",
    "Вы",
    "Внешние факторы",
    "Надежды и опасения",
    "Итог",
]

CELTIC_POSITION_DESC = [
    "Описывает текущую ситуацию, суть вопроса.",
    "Силы, влияющие на ситуацию извне. Препятствия или помощь.",
    "Совет карт: как лучше действовать.",
    "Скрытые причины ситуации, подсознательные установки.",
    "События прошлого, которые привели к текущей ситуации.",
    "Наиболее вероятное развитие событий в ближайшее время.",
    "Ваше отношение к ситуации, страхи, надежды, сомнения.",
    "Влияние других людей, обстоятельств, среды.",
    "Ваши мечты и страхи относительно ситуации.",
    "Финальный результат по текущему сценарию.",
]


def build_celtic_prompt(
    cards: list[dict],
    combos: dict,
    cross_request: str
) -> str:
    lines = [
        f"Представь, что ты — мудрый таролог‑наставник. Выражаешься мягко и загадочно."
        f"Проведи расклад «Кельтский Крест» на вопрос: {cross_request}\n",
        "Карты расклада:\n",
    ]

    for i, card in enumerate(cards):
        pos_name = CELTIC_POSITION_NAMES[i]
        pos_desc = CELTIC_POSITION_DESC[i]
        rev = "перевёрнутая" if card["reversed"] else "прямая"
        name = f"{card['name_ru']} ({card['name_en']})"
        general = card.get("meaning_general", "")

        lines.append(f"Позиция {i+1} «{pos_name}»: {name}, {rev}.")
        lines.append(f"Роль позиции: {pos_desc}")
        lines.append(f"Значение карты: {general}")

        combo_key = f"{i+1}-{i+2}"
        if combo_key in combos:
            lines.append(f"Взаимодействие со следующей картой: {combos[combo_key]}")
        lines.append("")

    lines.append(
        "Для каждой карты дай детальное толкование для её позиции (2–3 предложения) "
        "и связь с общим вопросом (1–2 предложения).\n\n"
        "В конце предоставь:\n"
        "— Общий вывод (4–5 предложений) с тремя ключевыми моментами: "
        "«Что оставить», «Что изменить», «На что обратить особое внимание».\n"
        "— Ключевой совет в формате: «Действуй так: [действие]. "
        "Причина: [почему]. Предостережение: [чего избегать]. Причина: [почему]».\n"
        "— 1–2 потенциальные опасности или скрытые факторы.\n\n"
        "Обрати внимание на Старшие Арканы в ключевых позициях. "
        "Для Младших Арканов укажи стихию (Кубки — вода, Мечи — воздух, "
        "Пентакли — земля, Жезлы — огонь) и её влияние на толкование. "
        "Учитывай взаимодействия между картами."
    )

    return "\n".join(lines)


async def get_celtic_summary(
    cards: list[dict],
    combos: dict,
    cross_request: str
) -> str:
    token = await get_access_token()
    prompt = build_celtic_prompt(cards, combos, cross_request)

    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(
            GIGACHAT_API_URL,
            headers={"Authorization": f"Bearer {token}",
                     "Content-Type": "application/json"},
            json={
                "model": "GigaChat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.85,
                "max_tokens": 1500,  # кельтский крест длиннее
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"].strip()