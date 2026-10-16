from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str

class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan_tier: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    organization: Optional[OrganizationResponse] = None

    class Config:
        from_attributes = True

class AuthSuccessResponse(BaseModel):
    user: UserResponse
    token: Token
