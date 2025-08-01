
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.db.schemas.categories import CategoryCreate, CategoryOut, CategoryUpdate
from app.services import categories
from .deps import get_current_user
from app.db.models.models import User
from app.db.session import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter()


@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return await categories.create_category(db, user.id, category_data)


@router.get("/", response_model=List[CategoryOut])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return await categories.get_all_categories_for_user(db, user.id)


@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return await categories.update_category(db, category_id, user.id, category_data)



@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    await categories.delete_category(db, category_id, user.id)