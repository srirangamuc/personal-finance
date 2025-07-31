"""
Defines the base class for SQLAlchemy models using DeclarativeBase.

Author : Srirangam Umesh Chandra
Created on : 2025-07-31
"""

from sqlalchemy.orm import DeclarativeBase


## Parent Class for all the ORM model classes
## Automatically Collects Model Metadata
## Used for table creations and migrations.
class Base(DeclarativeBase):
    pass