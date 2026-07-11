# app/routers/cards.py
from fastapi import APIRouter, HTTPException, Query
from app.services.card_service import draw_random_card, get_all_cards

router = APIRouter(prefix="/api", tags=["cards"])

@router.get("/draw-card")
def draw_card(context: str = Query(default="", description="Контекст гадания")):
    try:
        card = draw_random_card(context=context)
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cards")
def list_cards():
    cards = get_all_cards()
    return {"total": len(cards), "cards": cards}