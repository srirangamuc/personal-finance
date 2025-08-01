from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID
from app.db.models.models import Transaction
from app.db.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionRead

from datetime import datetime, timezone

async def create_transaction(db: AsyncSession, data: TransactionCreate, user_id: UUID) -> TransactionRead:
    new_trans = Transaction(
        **data.model_dump(),
        user_id=user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_trans)
    await db.commit()
    await db.refresh(new_trans)
    return TransactionRead.model_validate(new_trans, from_attributes=True)


async def get_transaction(db: AsyncSession, trans_id: UUID, user_id: UUID) -> TransactionRead | None:
    result = await db.execute(
        select(Transaction).where(Transaction.id == trans_id, Transaction.user_id == user_id)
    )
    trans = result.scalar_one_or_none()
    if trans:
        return TransactionRead.model_validate(trans)
    return None

async def get_all_transactions(db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 20) -> List[TransactionRead]:
    try:
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.date.desc())
            .offset(skip)
            .limit(limit)
        )
        transactions = result.scalars().all()
        return [TransactionRead.model_validate(t) for t in transactions]
    except Exception as e:
        raise RuntimeError(f"Database error in get_all_transactions : {str(e)}")

async def update_transaction(db: AsyncSession, trans_id: UUID, data: TransactionUpdate, user_id: UUID) -> TransactionRead | None:
    result = await db.execute(
        select(Transaction).where(Transaction.id == trans_id, Transaction.user_id == user_id)
    )
    trans = result.scalar_one_or_none()
    if not trans:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(trans, key, value)
    await db.commit()
    await db.refresh(trans)
    return TransactionRead.model_validate(trans)

async def delete_transaction(db: AsyncSession, trans_id: UUID, user_id: UUID) -> TransactionRead | None:
    result = await db.execute(
        select(Transaction).where(Transaction.id == trans_id, Transaction.user_id == user_id)
    )
    trans = result.scalar_one_or_none()
    if not trans:
        return None
    await db.delete(trans)
    await db.commit()
    return TransactionRead.model_validate(trans)
    