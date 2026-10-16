import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

# ----------------- User & Multi-Tenant Organization -----------------

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="owner")  # owner, manager, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    # Relationships
    memberships = relationship("OrganizationMember", back_populates="user", cascade="all, delete-orphan")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    plan_tier = Column(String(50), default="starter")  # starter, pro, agency
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    # Relationships
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    businesses = relationship("Business", back_populates="organization", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="organization", cascade="all, delete-orphan")

class OrganizationMember(Base):
    __tablename__ = "organization_members"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), default="owner")
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="members")
