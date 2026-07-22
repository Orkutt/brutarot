# app/routers/cards.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.card_service import draw_random_card, draw_triple, get_all_cards
from app.services.gigachat_service import get_llm_summary
from app.services.cache_service import get_cached, set_cached

router = APIRouter(prefix="/api", tags=["cards"])


@router.get("/draw-card")
def draw_card(context: str = Query(default=""), deck: str = Query(default="classic")):
    try:
        return draw_random_card(context=context, deck=deck)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/draw-triple")
def draw_triple_endpoint(context: str = Query(default=""), deck: str = Query(default="classic")):
    try:
        return draw_triple(context=context, deck=deck)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class InterpretRequest(BaseModel):
    cards: list[dict]
    combos: dict[str, str]
    context: str


@router.post("/interpret")
async def interpret(req: InterpretRequest):
    """
    Получает LLM-интерпретацию расклада.
    Сначала проверяет кэш — если расклад уже встречался, возвращает сохранённый ответ.
    """
    try:
        # Проверяем кэш
        cached = get_cached(req.cards, req.context)
        if cached:
            return {"summary": cached, "from_cache": True}

        # Запрашиваем GigaChat
        summary = await get_llm_summary(req.cards, req.combos, req.context)

        # Сохраняем в кэш
        set_cached(req.cards, req.context, summary)

        return {"summary": summary, "from_cache": False}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка LLM: {e}")


@router.get("/cards")
def list_cards():
    cards = get_all_cards()
    return {"total": len(cards), "cards": cards}