"""
Auth API's based on the services written
"""
from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.db.schemas.user import UserCreate, UserLogin
from app.services import auth as auth_service
from app.db.session import get_db
from app.core.jwt import create_access_token

router = APIRouter()

@router.post("/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
        Route : /register
        Function : Registers an user
    """
    user = await auth_service.create_user(user_data, db)
    return {"id": user.id, "email": user.email}


@router.post("/login")
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """
        Route : /login
        Function : Authenticates an user
    """
    user = await auth_service.authenticate_user(user_data.email, user_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials.Please Check and try again")
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
