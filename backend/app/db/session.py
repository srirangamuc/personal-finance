"""
Initialized SQLAlchemy database engine and session pool.

Author : Srirangam Umesh Chandra
Created on : 2025-07-31
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

## Use asyncpg for async operations. Make sure your DATABASE_URL starts with 'postgresql+asyncpg://'
engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db