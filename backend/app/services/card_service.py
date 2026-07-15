# app/services/card_service.py
import json
import random
from pathlib import Path
from typing import Any
from app.services.combo_service import find_combo

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
    position = "reversed" if is_reversed else "upright"
    context_key = CONTEXT_MAP.get(context, "")

    # Значение из meanings_by_context для конкретного контекста
    by_context_value = ""
    if context_key:
        by_context = card.get("meanings_by_context", {})
        by_context_value = by_context.get(position, {}).get(context_key, "").strip()

    # Общее значение
    general = card.get("meanings_general", {})
    meaning_general = general.get(position, "").strip()

    # Итоговая интерпретация: если есть контекстное — используем его,
    # иначе падаем на общее
    interpretation = by_context_value or meaning_general or "Интерпретация недоступна."

    return {
        "id":       card.get("id", ""),
        "name_ru":  name.get("ru", ""),
        "name_en":  name.get("en", ""),
        "number":   card.get("number", ""),
        "arcana":   card.get("arcana", ""),
        "suit":     card.get("suit", ""),
        "img":      card.get("img", ""),
        "keywords": card.get("keywords", []),
        "numerology": card.get("Numerology", ""),
        "elemental":  card.get("Elemental", ""),
        "reversed":   is_reversed,
        "context":    context,
        "interpretation":           interpretation,
        "meaning_general":          meaning_general,
        "meanings_by_context_value": by_context_value,  # ← новое
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


def draw_triple(context: str = "") -> dict:
    """Тянет три разные карты и ищет комбинации между ними."""
    all_cards = get_all_cards()
    chosen = random.sample(all_cards, 3)   # sample — без повторений

    cards_out = []
    for card in chosen:
        is_reversed = random.random() > 0.5
        cards_out.append(normalize_card(card, is_reversed, context))

    # Ищем комбинации: 1-2, 2-3, 1-3
    ids = [c["id"] for c in cards_out]
    combos = {}
    pairs = [(0, 1), (1, 2), (0, 2)]
    pair_keys = ["1-2", "2-3", "1-3"]
    for (i, j), key in zip(pairs, pair_keys):
        text = find_combo(ids[i], ids[j])
        if text:
            combos[key] = text

    return {
        "cards":    cards_out,
        "combos":   combos,   # {"1-2": "текст", "2-3": "текст", ...}
        "context":  context,
        "llm_summary": "",    # заглушка — заполним в шаге 7
    }