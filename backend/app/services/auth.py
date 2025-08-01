"""
Auth services for the application
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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

async def create_user(user_data: UserCreate, db: AsyncSession):
    hashed = hash_password(user_data.password)
    user = User(email=user_data.email, hashed_password=hashed)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

"""
Authenticate the user from the details
"""
async def authenticate_user(email: str, password: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user