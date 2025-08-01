"""
Schemas for validating inputs and outputs for the operations during DB CRUD
"""

from pydantic import BaseModel, EmailStr

# User Creation Validation
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# User Out Pydantic Model (We cant expose all the user details in the API)
class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes= True
        
