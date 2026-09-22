from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Asset
from ..schemas import AssetCreate, AssetResponse


router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)


@router.post("/", response_model=AssetResponse)
def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db)
):
    existing_asset = (
        db.query(Asset)
        .filter(Asset.asset_id == asset.asset_id)
        .first()
    )

    if existing_asset:
        raise HTTPException(
            status_code=400,
            detail="Asset ID already exists"
        )

    new_asset = Asset(
        **asset.model_dump()
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    return new_asset


@router.get("/", response_model=list[AssetResponse])
def get_assets(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asset)

    if status:
        query = query.filter(Asset.status == status)

    return query.all()


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return asset


@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset: AssetCreate,
    db: Session = Depends(get_db)
):
    existing_asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not existing_asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    duplicate_asset = (
        db.query(Asset)
        .filter(
            Asset.asset_id == asset.asset_id,
            Asset.id != asset_id
        )
        .first()
    )

    if duplicate_asset:
        raise HTTPException(
            status_code=400,
            detail="Asset ID already exists"
        )

    existing_asset.asset_id = asset.asset_id
    existing_asset.asset_name = asset.asset_name
    existing_asset.asset_type = asset.asset_type
    existing_asset.serial_number = asset.serial_number
    existing_asset.purchase_date = asset.purchase_date
    existing_asset.status = asset.status
    existing_asset.remarks = asset.remarks

    db.commit()
    db.refresh(existing_asset)

    return existing_asset


@router.delete("/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    db.delete(asset)
    db.commit()

    return {
        "message": "Asset deleted successfully"
    }