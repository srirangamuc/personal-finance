from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, update, delete
from uuid import UUID

from app.db.models.models import Category
from app.db.schemas.categories import CategoryCreate,CategoryUpdate
from fastapi import HTTPException,status

async def create_category(db: AsyncSession, user_id: UUID, category_in: CategoryCreate) -> Category:
    category = Category(
        name=category_in.name,
        type=category_in.type,
        user_id=user_id,
        is_default=False
    )
    db.add(category)
    try:
        await db.commit()
        await db.refresh(category)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return category

async def get_category_by_id(db: AsyncSession, category_id: UUID, user_id: UUID) -> Category:
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            (Category.user_id == user_id) | (Category.is_default == True)
        )
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category Not found")
    return category

async def get_all_categories_for_user(db: AsyncSession, user_id: UUID) -> list[Category]:
    result = await db.execute(
        select(Category).where(
            (Category.user_id == user_id) | (Category.is_default == True)
        )
    )
    return result.scalars().all()

async def delete_category(db: AsyncSession, category_id: UUID, user_id: UUID) -> None:
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id
        )
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found or not owned by user")
    await db.delete(category)
    await db.commit()


async def update_category(db: AsyncSession, category_id: UUID, user_id: UUID, category_in: CategoryUpdate) -> Category:
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id
        )
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = category_in.name
    category.type = category_in.type
    await db.commit()
    await db.refresh(category)
    return category

async def get_default_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.is_default == True)
    )
    return result.scalars().all()