"""
Auth API's based on the services written
"""

from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.schemas.user import UserCreate
from app.services import auth as auth_service
from app.core.jwt import create_access_tokens

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

