"""
Initialized SQLAlchemy database engine and session pool.

Author : Srirangam Umesh Chandra
Created on : 2025-07-31
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

## Initializing DB connection pool with default params and pre ping for stable connections with the DB
engine = create_engine(settings.DATABASE_URL,pool_pre_ping=True)

SessionLocal = sessionmaker(
        bind=engine,
        autocommit=False, # Explicit Commit to the DB to avoid mishaps
        autoflush=False, # No Automatic Flushes of sessions
        expire_on_commit=False #Keep objects alive after commit
    )
