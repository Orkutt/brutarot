# app/routers/cards.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.card_service import draw_random_card, draw_triple, get_all_cards
from app.services.gigachat_service import get_llm_summary
from app.services.cache_service import get_cached, set_cached
from app.bot import send_spread_result
from app.bot_instance import get_bot              # ← из синглтона, не из main

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
    try:
        cached = get_cached(req.cards, req.context)
        if cached:
            return {"summary": cached, "from_cache": True}
        summary = await get_llm_summary(req.cards, req.combos, req.context)
        set_cached(req.cards, req.context, summary)
        return {"summary": summary, "from_cache": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка LLM: {e}")


class SendResultRequest(BaseModel):
    user_id: int
    cards: list[dict]
    summary: str


@router.post("/send-result")
async def send_result(req: SendResultRequest):
    print(f"📨 send-result: user_id={req.user_id}, summary_len={len(req.summary)}")
    try:
        bot = get_bot()                          # ← берём живой экземпляр
        if bot is None:
            raise HTTPException(status_code=503, detail="Бот не инициализирован")
        await send_spread_result(
            user_id=req.user_id,
            cards=req.cards,
            summary=req.summary,
            bot=bot
        )
        print(f"✅ Сообщение отправлено пользователю {req.user_id}")
        return {"ok": True}
    except Exception as e:
        print(f"❌ Ошибка отправки: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cards")
def list_cards():
    return {"total": len(get_all_cards()), "cards": get_all_cards()}