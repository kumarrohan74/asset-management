from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Employee, AssetAssignment
from ..schemas import EmployeeCreate, EmployeeResponse


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post("/", response_model=EmployeeResponse)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing_employee = (
        db.query(Employee)
        .filter(Employee.employee_id == employee.employee_id)
        .first()
    )

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    new_employee = Employee(
        **employee.model_dump()
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db)
):
    return db.query(Employee).all()


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing_employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not existing_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    duplicate_employee = (
        db.query(Employee)
        .filter(
            Employee.employee_id == employee.employee_id,
            Employee.id != employee_id
        )
        .first()
    )

    if duplicate_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    existing_employee.employee_id = employee.employee_id
    existing_employee.name = employee.name
    existing_employee.email = employee.email
    existing_employee.department = employee.department
    existing_employee.designation = employee.designation
    existing_employee.phone = employee.phone
    existing_employee.status = employee.status

    db.commit()
    db.refresh(existing_employee)

    return existing_employee


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    assignment_history = (
        db.query(AssetAssignment)
        .filter(AssetAssignment.employee_id == employee_id)
        .first()
    )

    if assignment_history:
        raise HTTPException(
            status_code=400,
            detail="Employee has assignment history and cannot be deleted"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }