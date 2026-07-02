# app/routers/cards.py
from fastapi import APIRouter, HTTPException
from app.services.card_service import draw_random_card, get_all_cards

router = APIRouter(prefix="/api", tags=["cards"])


@router.get("/draw-card")
def draw_card():
    """Вытаскивает случайную карту из колоды."""
    try:
        card = draw_random_card()
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при выборе карты: {e}")


@router.get("/cards")
def list_cards():
    """Возвращает список всех карт. Пригодится для отладки."""
    cards = get_all_cards()
    return {"total": len(cards), "cards": cards}