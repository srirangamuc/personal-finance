"""
FastAPI application entrypoint.
Initializes the FastAPI app and includes all API routers.

Author : Srirangam Umesh Chandra
Created on : 2025-07-31
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logger import get_logger
from app.api import auth,users
import subprocess

logger = get_logger("startup")

# Setup startup lifespan event
@asynccontextmanager
async def lifespan(app:FastAPI):
    logger.info("Running Migrations....")
    try:
        subprocess.run(["alembic","upgrade","head"],check=True)
        logger.info("Migrations Complete....")
    except subprocess.CalledProcessError as e:
        logger.error("Alembic migration Falied")
        raise RuntimeError("DB Migration Failed") from e

    yield


# App init
app = FastAPI(title="Personal Finance Assistant",lifespan=lifespan)

# App routes
@app.get("/")
def root():
    """
    Test API to check whether the API is working or not
    """
    return {"status":"OK"}

app.include_router(auth.router,prefix="/auth",tags=["Auth"])
app.include_router(users.router,prefix="/users",tags=["Users"])