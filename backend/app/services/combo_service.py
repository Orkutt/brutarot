# app/services/combo_service.py
import json
from pathlib import Path
from itertools import combinations

COMBOS_JSON_PATH = Path(__file__).parent.parent.parent.parent / "combos.json"

_combos: dict[str, str] = {}

def load_combos() -> dict[str, str]:
    global _combos
    if not _combos:
        with open(COMBOS_JSON_PATH, encoding="utf-8") as f:
            data = json.load(f)
        _combos = data.get("combinations", {})
    return _combos


def find_combo(id1: str, id2: str) -> str | None:
    """
    Ищет комбинацию для двух карт.
    Пробует оба порядка: m00-m02 и m02-m00.
    """
    combos = load_combos()
    key1 = f"{id1}-{id2}"
    key2 = f"{id2}-{id1}"
    return combos.get(key1) or combos.get(key2)


def find_all_combos(ids: list[str]) -> dict[str, str]:
    """
    Для списка из N карт возвращает все найденные парные комбинации.
    Ключ результата — 'id1-id2', значение — текст комбинации.
    """
    combos = load_combos()
    result = {}
    for id1, id2 in combinations(ids, 2):
        text = find_combo(id1, id2)
        if text:
            result[f"{id1}-{id2}"] = text
    return result