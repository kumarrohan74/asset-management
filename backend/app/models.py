from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="Active")

    assignments = relationship(
        "AssetAssignment",
        back_populates="employee"
    )


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, nullable=False, index=True)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=True)
    serial_number = Column(String, unique=True, nullable=True)
    purchase_date = Column(Date, nullable=True)
    status = Column(String, default="Available")
    remarks = Column(String, nullable=True)

    assignments = relationship(
        "AssetAssignment",
        back_populates="asset"
    )


class AssetAssignment(Base):
    __tablename__ = "asset_assignments"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    asset_id = Column(
        Integer,
        ForeignKey("assets.id"),
        nullable=False
    )

    assigned_date = Column(Date, nullable=False)
    returned_date = Column(Date, nullable=True)
    remarks = Column(String, nullable=True)

    employee = relationship(
        "Employee",
        back_populates="assignments"
    )

    asset = relationship(
        "Asset",
        back_populates="assignments"
    )
