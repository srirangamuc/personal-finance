"""
Auth API's based on the services written
"""
from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.schemas.user import UserCreate
from app.services import auth as auth_service
from app.core.jwt import create_access_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user_data:UserCreate,db:Session = Depends(get_db)):
    """
        Route : /register
        Function : Registers an user
    """
    user = auth_service.create_user(user_data,db)
    return {"id":user.id,"email":user.email}

@router.post("/login")
def login(user_data:UserCreate, db:Session = Depends(get_db)):      
    """
        Route : /login
        Function : Authenticates an user
    """
    user = auth_service.authenticate_user(user_data.email,user_data.password,db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Credentials.Please Check and try again")
    token = create_access_token(data={"sub":user.email})
    return {"access_token":token,"token_type":"bearer"}
