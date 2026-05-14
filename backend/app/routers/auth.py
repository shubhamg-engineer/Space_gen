"""Auth router — login endpoint that issues JWT tokens."""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.auth import verify_password, create_access_token
from app.config import settings

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Owner login — username + password → JWT access token."""
    if form_data.username != settings.OWNER_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, settings.OWNER_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(
        data={"sub": settings.OWNER_USERNAME},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=token, token_type="bearer", username=settings.OWNER_USERNAME)
