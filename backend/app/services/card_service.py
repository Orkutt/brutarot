# app/services/card_service.py
import json
import random
from pathlib import Path
from typing import Any

CARDS_JSON_PATH = Path(__file__).parent.parent.parent.parent / "tarot-images.json"


def load_cards() -> list[dict[str, Any]]:
    with open(CARDS_JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)
    # JSON — объект с ключом "cards", а не голый массив
    return data["cards"]


def normalize_card(card: dict, is_reversed: bool) -> dict:
    meanings = card.get("meanings", {})

    # light = прямое значение, shadow = перевёрнутое
    light_list = meanings.get("light", [])
    shadow_list = meanings.get("shadow", [])

    # Берём все пункты и склеиваем в читаемый текст через точку с запятой
    interpretation_upright = "; ".join(light_list) if light_list else "No interpretation available."
    interpretation_reversed = "; ".join(shadow_list) if shadow_list else interpretation_upright

    return {
        "name": card.get("name", "Unknown"),
        "number": card.get("number", ""),
        "arcana": card.get("arcana", ""),
        "suit": card.get("suit", ""),
        "img": card.get("img", ""),
        "keywords": card.get("keywords", []),
        "fortune_telling": card.get("fortune_telling", []),
        "interpretation": interpretation_reversed if is_reversed else interpretation_upright,
        "reversed": is_reversed,
        # Отдаём оба варианта — фронту может пригодиться
        "meanings": {
            "light": light_list,
            "shadow": shadow_list,
        },
        "questions_to_ask": card.get("Questions to Ask", []),
        "elemental": card.get("Elemental", ""),
        "archetype": card.get("Archetype", ""),
    }


_cards: list[dict] = []

def get_all_cards() -> list[dict]:
    global _cards
    if not _cards:
        _cards = load_cards()
    return _cards


def draw_random_card() -> dict:
    cards = get_all_cards()
    card = random.choice(cards)
    is_reversed = random.random() > 0.5
    return normalize_card(card, is_reversed)