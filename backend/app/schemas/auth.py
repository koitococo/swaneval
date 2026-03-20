import uuid

from pydantic import BaseModel

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.viewer


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    nickname: str = ""
    role: UserRole
    is_active: bool


class UpdateProfileRequest(BaseModel):
    nickname: str | None = None
    email: str | None = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class AdminUpdateUserRequest(BaseModel):
    nickname: str | None = None
    email: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
