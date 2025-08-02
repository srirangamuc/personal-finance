"""
Basic User model for sign in and sign up
"""

from sqlalchemy import Column, String, Enum,Boolean, ForeignKey, Numeric, Text, Date, DateTime
from app.db.base import Base
from uuid import uuid4
from sqlalchemy.dialects.postgresql import UUID
import enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True),primary_key=True,index=True,default=uuid4)
    email = Column(String,unique=True,index=True,nullable=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String,nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(),nullable=False)
    transactions = relationship("Transaction", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id= Column(UUID(as_uuid=True),primary_key=True,default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"),nullable=False)
    amount = Column(Numeric(10,2),nullable=False)
    type = Column(Enum(TransactionType),nullable=False)
    category= Column(String(50),nullable=True)
    description= Column(Text)
    date = Column(Date,nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(),nullable=False)
    
    user = relationship("User", back_populates="transactions")
    