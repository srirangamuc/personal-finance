from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    type: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: UUID
    is_default: bool
    
    class Config:
        from_attributes = True
        
class CategoryUpdate(BaseModel):
    name: str = Field(...,max_length=100)
    type: Literal["income","expense"]