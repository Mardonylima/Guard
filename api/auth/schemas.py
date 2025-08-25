 # Definições de Pydantic para requests/responses

from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None

class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str

    model_config = {
        "from_attributes": True  # antes era orm_mode = True
    }