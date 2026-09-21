import sys
from pathlib import Path

# Ensure backend root is in sys.path for direct script execution
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.core.exceptions import setup_exception_handlers
from app.api.v1.router import api_router
from app.db.session import SessionLocal
from app.db.init_db import init_db, ensure_schema_columns
from app.db.session import engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("upteky.app")

# Ensure schema columns are up to date on app import
try:
    ensure_schema_columns(engine)
except Exception as e:
    logger.warning(f"ensure_schema_columns check: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler: runs on startup and shutdown."""
    logger.info("Initializing Upteky AI application lifecycle...")
    # Initialize DB tables and seed data
    db = SessionLocal()
    try:
        init_db(db)
    except Exception as e:
        logger.error(f"Error during DB initialization: {e}")
    finally:
        db.close()

    yield
    logger.info("Shutting down Upteky AI application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Upteky AI is an Intelligent Business Automation & Analytics SaaS Platform for SMBs. "
        "Automates customer support, lead management, sales analytics, invoice processing, and reporting."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom and global exception handlers
setup_exception_handlers(app)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also expose direct /api routes as required by Phase 5 (e.g. POST /api/chat, GET /api/conversations)
from app.api.v1.endpoints import chat
app.include_router(chat.router, prefix="/api", tags=["Root API Aliases"])


@app.get("/", tags=["Root"])
def root_info():
    """Root endpoint welcoming users and providing API links."""
    return {
        "platform": "Upteky AI",
        "description": "Intelligent Business Automation & Analytics Platform",
        "version": "1.0.0",
        "api_docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
