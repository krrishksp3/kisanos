from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Farmer full name")
    phone: str = Field(..., min_length=10, max_length=20, description="Mobile phone number")
    language: str = Field(default="hi", max_length=10, description="Preferred language (hi/en)")
    location: Optional[str] = Field(default=None, max_length=255, description="Village, District, State")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")


class UserLogin(BaseModel):
    phone: str = Field(..., description="Registered mobile number")
    password: str = Field(..., description="Password")


class UserOut(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
