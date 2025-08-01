"""
Utility functions for JWT creation.
"""
from datetime import datetime,timedelta,timezone
from jose import jwt
from app.core.config import settings

"""
Utility function to create access tokens for a request

Args:
    - data : dict -> Data to be encoded
    - expires_delta : timedelta -> Expiration Time 

Returns:
    - jwt : str -> JWT Token of the data encoded
"""
def create_access_token(data: dict, expires_delta:timedelta = None):
    to_encode = data.copy()
    expires = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp":expires})
    return jwt.encode(to_encode,settings.JWT_SECRET_KEY,algorithm=settings.ALGORITHM)

"""
Decode the given token to retrieve data

Args:
    - token:str -> Token to be decoded

Returns:
    - data:dict -> Data decoded from the token 
"""

def decode_access_token(token:str):
    return jwt.decode(token,settings.JWT_SECRET_KEY,algorithms=[settings.ALGORITHM])