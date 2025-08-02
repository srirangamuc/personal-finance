"""
Loads environment variables and global application settings using Pydantic models

Author: Srirangam Umesh Chandra
Created on : 2025-07-31
"""

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load Environment Variables
load_dotenv()

class Settings(BaseSettings):
    ALEMBIC_DATABASE_URL: str
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    ALGORITHM: str
    GROQ_API_KEY:str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()