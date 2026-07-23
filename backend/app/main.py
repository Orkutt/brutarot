# app/main.py
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.bot import get_bot_and_dispatcher
from app.routers import cards
import os


CARDS_ROOT = Path(os.getenv("DATA_DIR", Path(__file__).parent.parent.parent)) / "cards"

FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

bot_instance = None
dp_instance = None
polling_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global bot_instance, dp_instance, polling_task
    bot_instance, dp_instance = get_bot_and_dispatcher()
    polling_task = asyncio.create_task(
        dp_instance.start_polling(bot_instance)
    )
    print("✅ Бот запущен в режиме polling")
    yield
    polling_task.cancel()
    await bot_instance.session.close()
    print("🛑 Бот остановлен")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Раздаём всю папку cards — внутри могут быть classic/, botanical/ и т.д.
if CARDS_ROOT.exists():
    app.mount("/cards", StaticFiles(directory=CARDS_ROOT), name="cards")
else:
    print(f"⚠️  Папка с картами не найдена: {CARDS_ROOT}")

# Подключаем роутер
app.include_router(cards.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}


if FRONTEND_DIST.exists():
    # Раздаём статику фронта (JS, CSS, картинки сборки)
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    # Все остальные пути → index.html (SPA-роутинг)
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        index = FRONTEND_DIST / "index.html"
        return FileResponse(index)