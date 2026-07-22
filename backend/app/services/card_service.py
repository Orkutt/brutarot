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

CONTEXT_LABELS = {
    "one_card":      "Одна карта",
    "card_of_the_day": "Карта дня",
    "relationships": "Отношения и любовь",
    "career":        "Работа и карьера",
    "finance":       "Финансы",
    "health":        "Здоровье",
    "answer":        "Ответ на вопрос / Ситуация",
    "advice":        "Совет",
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


def normalize_card(card: dict, is_reversed: bool, context: str, deck: str = "classic") -> dict:
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
        "img":      f"{deck}/{card.get('img', '')}",  # теперь путь включает папку колоды
        "keywords": card.get("keywords", []),
        "numerology": card.get("Numerology", ""),
        "elemental":  card.get("Elemental", ""),
        "reversed":   is_reversed,
        "context":    context,
        "interpretation":           interpretation,
        "meaning_general":          meaning_general,
        "meanings_by_context_value": by_context_value,  # ← новое
    }


def build_llm_package(cards: list[dict], combos: dict, context: str) -> str:
    """
    Формирует текстовый пакет для LLM.
    Структура: название, положение, общее значение, значение по запросу,
    комбо с следующей картой (если есть).
    """
    context_label = CONTEXT_LABELS.get(context, context)
    position_labels = ["Первая карта", "Вторая карта", "Третья карта"]
    combo_keys = {1: "1-2", 2: "2-3"}  # после какой карты вставить комбо

    lines = [f"Контекст гадания: {context_label}\n"]

    for i, card in enumerate(cards):
        pos_label = position_labels[i]
        reversed_label = "перевёрнутая" if card["reversed"] else "прямая"

        lines.append(f"{pos_label}: {card['name_ru']} ({card['name_en']})")
        lines.append(f"Положение: {reversed_label}")
        lines.append(f"Общее значение: {card['meaning_general']}")

        if card.get("meanings_by_context_value"):
            lines.append(f"Значение по запросу ({context_label}): {card['meanings_by_context_value']}")

        # Комбо между этой и следующей картой
        combo_key = combo_keys.get(i + 1)
        if combo_key and combo_key in combos:
            lines.append(f"Взаимодействие с следующей картой: {combos[combo_key]}")

        lines.append("")  # пустая строка между картами

    return "\n".join(lines)

_cards: list[dict] = []

def get_all_cards() -> list[dict]:
    global _cards
    if not _cards:
        _cards = load_cards()
    return _cards


def draw_random_card(context: str = "", deck: str = "classic") -> dict:
    cards = get_all_cards()
    card = random.choice(cards)
    is_reversed = random.random() > 0.5
    return normalize_card(card, is_reversed, context, deck)


def draw_triple(context: str = "", deck: str = "classic") -> dict:
    all_cards = get_all_cards()
    chosen = random.sample(all_cards, 3)
    cards_out = [normalize_card(c, random.random() > 0.5, context, deck) for c in chosen]

    # Комбо только в прямом порядке!
    combos = {}
    pairs = [(0, 1, "1-2"), (1, 2, "2-3"), (0, 2, "1-3")]
    for i, j, key in pairs:
        text = find_combo(cards_out[i]["id"], cards_out[j]["id"])
        if text:
            combos[key] = text

    # Формируем LLM-пакет
    llm_package = build_llm_package(cards_out, combos, context)

    return {
        "cards": cards_out,
        "combos": combos,
        "context": context,
        "llm_summary": "",
        "llm_package": llm_package,
    }