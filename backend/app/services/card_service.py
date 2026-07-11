# app/services/card_service.py
import json
import random
from pathlib import Path
from typing import Any

CARDS_JSON_PATH = Path(__file__).parent.parent.parent.parent / "tarot-images.json"

# Маппинг контекстов фронтенда → ключи в JSON
CONTEXT_MAP = {
    "relationships": "relationships",
    "career":        "career",
    "finance":       "finance",
    "health":        "health",
    "answer":        "answer",
    "card_of_the_day": "card_of_the_day",
    "advice":        "advice",
}

def load_cards() -> list[dict[str, Any]]:
    with open(CARDS_JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)
    return data["cards"]


def get_interpretation(card: dict, is_reversed: bool, context: str) -> str:
    """
    Приоритет: сначала ищем конкретный контекст в meanings_by_context,
    если поле пустое или контекст не передан — падаем на meanings_general.
    """
    position = "reversed" if is_reversed else "upright"
    context_key = CONTEXT_MAP.get(context, "")

    # Пробуем контекстное значение
    if context_key:
        by_context = card.get("meanings_by_context", {})
        position_dict = by_context.get(position, {})
        value = position_dict.get(context_key, "").strip()
        if value:
            return value

    # Fallback: общее значение
    general = card.get("meanings_general", {})
    return general.get(position, "Интерпретация недоступна.").strip()


def normalize_card(card: dict, is_reversed: bool, context: str) -> dict:
    name = card.get("name", {})
    return {
        "name_ru": name.get("ru", ""),
        "name_en": name.get("en", ""),
        "number":  card.get("number", ""),
        "arcana":  card.get("arcana", ""),
        "suit":    card.get("suit", ""),
        "img":     card.get("img", ""),
        "keywords":   card.get("keywords", []),
        "numerology": card.get("Numerology", ""),
        "elemental":  card.get("Elemental", ""),
        "reversed":   is_reversed,
        "context":    context,
        "interpretation": get_interpretation(card, is_reversed, context),
        "meaning_general": card.get("meanings_general", {}).get(
            "reversed" if is_reversed else "upright", ""
        ),
    }


_cards: list[dict] = []

def get_all_cards() -> list[dict]:
    global _cards
    if not _cards:
        _cards = load_cards()
    return _cards


def draw_random_card(context: str = "") -> dict:
    cards = get_all_cards()
    card = random.choice(cards)
    is_reversed = random.random() > 0.5
    return normalize_card(card, is_reversed, context)