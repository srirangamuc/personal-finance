"""
Auth services for the application
"""

from sqlalchemy.orm import Session
from app.db.models.models import User
from app.db.schemas.user import UserCreate
from app.core.security import hash_password,verify_password

"""
Registers a new user

Args:
    - user_data:UserCreate -> User Input data after validation for creation
    - db: Session -> Database connection pool session

Returns:
    - user: User -> Created User Object
"""

def create_user(user_data: UserCreate,db:Session):
    hashed = hash_password(user_data.password)
    user = User(email=user_data.email,hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

"""
Authenticate the user from the details
"""
def authenticate_user(email:str , password:str,db:Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password,user.hashed_password):
        return None
    return user