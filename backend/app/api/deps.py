"""
Dependencies for Route Protection (Custom Middlewares)
"""

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session
from app.core.security import oauth2_scheme
from app.core.jwt import decode_access_token
from app.db.session import SessionLocal
from app.db.models.user import User

def get_db():
    db : Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:Session = Depends(get_db),
)-> User:
    try:
        payload = decode_access_token(token)
        email:str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Authentication credentials",headers={"WWW-Authenticate":"Bearer"})
    except JWTError:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Authentication credentials",headers={"WWW-Authenticate":"Bearer"})
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Authentication credentials",headers={"WWW-Authenticate":"Bearer"})
    
    return user