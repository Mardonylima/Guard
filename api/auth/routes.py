# routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from . import schemas, security
from users.models import User
from django.contrib.auth.hashers import make_password
from django.db.utils import IntegrityError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest):
    user = security.authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos")
    token = security.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def me(current_user = Depends(security.get_current_user)):
    name = getattr(current_user, "name", None)
    return {"id": current_user.id, "email": current_user.email, "name": name}

# Novo endpoint de registro
@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.RegisterRequest):
    try:
        user = User.objects.create(
            name=payload.name,
            email=payload.email,
            password=make_password(payload.password)
        )
        return {"id": user.id, "email": user.email, "name": user.name}
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="E-mail já cadastrado")