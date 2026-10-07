from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AssetAssignment, Employee, Asset
from ..schemas import AssignmentCreate, AssignmentResponse


router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)


@router.post("/", response_model=AssignmentResponse)
def create_assignment(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == assignment.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    asset = (
        db.query(Asset)
        .filter(Asset.id == assignment.asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    if asset.status != "Available":
        raise HTTPException(
            status_code=400,
            detail="Asset is not available"
        )

    active_assignment = (
        db.query(AssetAssignment)
        .filter(
            AssetAssignment.asset_id == assignment.asset_id,
            AssetAssignment.returned_date.is_(None)
        )
        .first()
    )

    if active_assignment:
        raise HTTPException(
            status_code=400,
            detail="Asset is already assigned"
        )

    new_assignment = AssetAssignment(
        **assignment.model_dump()
    )

    db.add(new_assignment)

    asset.status = "Assigned"

    db.commit()
    db.refresh(new_assignment)

    return new_assignment


@router.get("/", response_model=list[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db)
):
    return db.query(AssetAssignment).all()


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    assignment = (
        db.query(AssetAssignment)
        .filter(AssetAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    assignment: AssignmentCreate,
    db: Session = Depends(get_db)
):
    existing_assignment = (
        db.query(AssetAssignment)
        .filter(AssetAssignment.id == assignment_id)
        .first()
    )

    if not existing_assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    employee = (
        db.query(Employee)
        .filter(Employee.id == assignment.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    asset = (
        db.query(Asset)
        .filter(Asset.id == assignment.asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    # Prevent changing an already returned assignment
    if existing_assignment.returned_date is not None:
        raise HTTPException(
            status_code=400,
            detail="Returned assignment cannot be modified"
        )

    # If the asset is being changed, the new asset must be available
    if assignment.asset_id != existing_assignment.asset_id:
        if asset.status != "Available":
            raise HTTPException(
                status_code=400,
                detail="Asset is not available"
            )

        active_assignment = (
            db.query(AssetAssignment)
            .filter(
                AssetAssignment.asset_id == assignment.asset_id,
                AssetAssignment.returned_date.is_(None),
                AssetAssignment.id != assignment_id
            )
            .first()
        )

        if active_assignment:
            raise HTTPException(
                status_code=400,
                detail="Asset is already assigned"
            )

        old_asset = (
            db.query(Asset)
            .filter(Asset.id == existing_assignment.asset_id)
            .first()
        )

        if old_asset:
            old_asset.status = "Available"

        asset.status = "Assigned"

    # Handle returning the assignment
    if assignment.returned_date is not None:
        asset.status = "Available"

    existing_assignment.employee_id = assignment.employee_id
    existing_assignment.asset_id = assignment.asset_id
    existing_assignment.assigned_date = assignment.assigned_date
    existing_assignment.returned_date = assignment.returned_date
    existing_assignment.remarks = assignment.remarks

    db.commit()
    db.refresh(existing_assignment)

    return existing_assignment


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    assignment = (
        db.query(AssetAssignment)
        .filter(AssetAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    asset = (
        db.query(Asset)
        .filter(Asset.id == assignment.asset_id)
        .first()
    )

    if asset:
        asset.status = "Available"

    db.delete(assignment)
    db.commit()

    return {
        "message": "Assignment deleted successfully"
    }