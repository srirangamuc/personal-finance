"""
Dependencies for Route Protection (Custom Middlewares)
"""

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from app.core.security import oauth2_scheme
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.core.jwt import decode_access_token
from app.db.models.models import User
from app.db.session import get_db

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:AsyncSession = Depends(get_db),
)-> User:
    try:
        payload = decode_access_token(token)
        email:str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Authentication credentials",headers={"WWW-Authenticate":"Bearer"})
    except JWTError:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Authentication credentials",headers={"WWW-Authenticate":"Bearer"})
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authentication credentials", headers={"WWW-Authenticate": "Bearer"})
    return user