"""
Some functions regarding hashing and de-hashing of details
"""

from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

password_context = CryptContext(schemes=["bcrypt"],deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password:str)-> str:
    return password_context.hash(password)

def verify_password(plain_password:str, hashed_password: str) -> bool:
    return password_context.verify(plain_password,hashed_password)

