# app/services/cache_service.py
import json
import hashlib
from pathlib import Path
import os

_base = Path(os.getenv("DATA_DIR", Path(__file__).parent.parent.parent.parent))
CACHE_PATH = _base / "spreads_cache.json"


def _make_key(cards: list[dict], context: str) -> str:
    """
    Ключ кэша: ID карт в порядке расклада + положение + контекст.
    Порядок важен — разные позиции дают разный смысл.
    """
    fingerprint = context + "|" + "|".join(
        f"{c['id']}{'R' if c['reversed'] else 'U'}" for c in cards
    )
    return hashlib.md5(fingerprint.encode()).hexdigest()


def load_cache() -> dict:
    if CACHE_PATH.exists():
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache: dict) -> None:
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def get_cached(cards: list[dict], context: str) -> str | None:
    """Возвращает кэшированный ответ или None."""
    cache = load_cache()
    key = _make_key(cards, context)
    return cache.get(key)


def set_cached(cards: list[dict], context: str, summary: str) -> None:
    """Сохраняет ответ LLM в кэш."""
    cache = load_cache()
    key = _make_key(cards, context)
    cache[key] = summary
    save_cache(cache)