"""
Basic User model for sign in and sign up
"""

from sqlalchemy import Column,Integer,String,DateTime
from app.db.base import Base
from datetime import datetime,timezone
from uuid import uuid4
from sqlalchemy.dialects.postgresql import UUID

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True),primary_key=True,index=True,default=uuid4)
    email = Column(String,unique=True,index=True,nullable=True)
    hashed_password = Column(String,nullable=True)
    created_at = Column(DateTime,default=datetime.now(timezone.utc))
