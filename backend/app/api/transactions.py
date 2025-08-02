from fastapi import APIRouter,Depends,HTTPException, status,Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.db.session import get_db
from app.db.schemas.transaction import TransactionCreate,TransactionUpdate,TransactionRead
from app.services.transaction import create_transaction,get_all_transactions_for_user,get_transaction,get_all_transactions,update_transaction,delete_transaction
from app.db.models.models import User
from app.api.deps import get_current_user
from app.services.parsing import process_receipt

router = APIRouter()

import traceback

@router.post("/")
async def create_transaction_route(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Pass current_user.id to create_transaction if needed
        trans = await create_transaction(db, data, user_id=current_user.id)
        return trans
    except Exception as e:
        print("Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to create transaction record.")

@router.get("/")
async def list_transactions_route(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_all_transactions(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/all", response_model=List[TransactionRead])
async def get_all_transactions_for_user_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_all_transactions_for_user(db, user_id=current_user.id)

@router.post("/parse-receipt")
async def parse_receipt_route(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts a PDF receipt file, parses it, and returns the extracted JSON.
    """
    try:
        result = await process_receipt(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{trans_id}")
async def get_transaction_by_id(
    trans_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = await get_transaction(db, trans_id, user_id=current_user.id)
    if not trans:
        raise HTTPException(status_code=404, detail="Transaction Not found")
    return trans

@router.put("/{txn_id}", response_model=TransactionRead)
async def update_transaction_route(
    txn_id: UUID,
    data: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = await update_transaction(db, txn_id, data, user_id=current_user.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn



@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction_route(
    txn_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = await delete_transaction(db, txn_id, user_id=current_user.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None