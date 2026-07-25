from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth
from loguru import logger
from typing import Optional

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """
    Validates Firebase JWT token. Returns user payload if valid, otherwise raises 401.
    """
    if not credentials:
        # For development, allow bypass if no token is provided but warn. 
        # In a strict production environment, we raise 401.
        # But we'll enforce it as requested by Phase 9.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    try:
        # Verify the Firebase token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.warning(f"Invalid authentication credentials: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """
    Validates Firebase JWT token if present, otherwise returns None.
    """
    if not credentials:
        return None
        
    token = credentials.credentials
    try:
        return auth.verify_id_token(token)
    except Exception:
        return None
