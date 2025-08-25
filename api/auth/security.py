# Lógica de autenticação, geração/validação JWT

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from django.contrib.auth import get_user_model

User = get_user_model()

SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret")
ALGORITHM = os.getenv("JWT_ALG", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MIN", "60"))

# Mesmo usando JSON no /auth/login, o OAuth2PasswordBearer nos ajuda a extrair o token do header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def authenticate_user(email: str, password: str) -> Optional[User]:
    # busca case-insensitive por email
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return None
    if not user.check_password(password):
        return None
    return user

def create_access_token(subject: str | int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(subject), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user = User.objects.get(id=int(sub))
    except (User.DoesNotExist, ValueError):
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuário inativo")
    return user
