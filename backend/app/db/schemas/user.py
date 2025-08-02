"""
Schemas for validating inputs and outputs for the operations during DB CRUD
"""

from pydantic import BaseModel, EmailStr

# User Creation Validation
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# User Out Pydantic Model (We cant expose all the user details in the API)
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes= True
        
