from typing import Optional
from datetime import date
from pydantic import BaseModel, EmailStr, ConfigDict


class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    status: str = "Active"


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AssetBase(BaseModel):
    asset_id: str
    asset_name: str
    asset_type: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    status: str = "Available"
    remarks: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetResponse(AssetBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AssignmentBase(BaseModel):
    employee_id: int
    asset_id: int
    assigned_date: date
    returned_date: Optional[date] = None
    remarks: Optional[str] = None


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentResponse(AssignmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)