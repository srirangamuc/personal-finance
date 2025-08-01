from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class TransactionCreate(BaseModel):
    user_id: UUID
    amount: float
    type: TransactionType
    category_id: Optional[UUID]
    description: Optional[str]
    date: date

class TransactionUpdate(BaseModel):
    amount: Optional[float]
    type: Optional[TransactionType]
    category_id: Optional[UUID]
    description: Optional[str]
    date: Optional[date]

class TransactionRead(BaseModel):
    id: UUID
    user_id: UUID
    amount: float
    type: TransactionType
    category_id: Optional[UUID]
    description: Optional[str]
    date: date
    created_at: datetime

    class Config:
        from_attributes = True
