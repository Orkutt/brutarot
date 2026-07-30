# app/main.py
import asyncio, os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.bot import get_bot_and_dispatcher, setup_webhook, remove_webhook
from app.bot_instance import set_bot          # ← импортируем setter
from app.routers import cards

WEBHOOK_URL   = os.getenv("WEBHOOK_URL", "")
CARDS_ROOT    = Path(os.getenv("DATA_DIR", Path(__file__).parent.parent.parent)) / "cards"
FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

class NgrokSkipWarningMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["ngrok-skip-browser-warning"] = "true"
        return response

polling_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global polling_task
    bot, dp = get_bot_and_dispatcher()
    set_bot(bot)                              # ← сохраняем в синглтон

    if WEBHOOK_URL:
        await setup_webhook(bot, WEBHOOK_URL)
        print(f"✅ Бот запущен в режиме webhook: {WEBHOOK_URL}")
    else:
        polling_task = asyncio.create_task(dp.start_polling(bot))
        print("✅ Бот запущен в режиме polling")

    yield

    if WEBHOOK_URL:
        await remove_webhook(bot)
    elif polling_task:
        polling_task.cancel()
    await bot.session.close()
    print("🛑 Бот остановлен")


app = FastAPI(lifespan=lifespan)
app.add_middleware(NgrokSkipWarningMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

if CARDS_ROOT.exists():
    app.mount("/cards", StaticFiles(directory=CARDS_ROOT), name="cards")

app.include_router(cards.router)

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(FRONTEND_DIST / "index.html")

@app.post("/webhook")
async def webhook(request: Request):
    from aiogram.types import Update
    from app.bot import get_bot_and_dispatcher
    from app.bot_instance import get_bot
    _, dp = get_bot_and_dispatcher()
    bot = get_bot()
    data = await request.json()
    update = Update.model_validate(data)
    await dp.feed_update(bot, update)
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}