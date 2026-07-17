import os

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

API_KEY_NAME = "X-Admin-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_admin_token(x_admin_token: str = Depends(api_key_header)):
    """
    Security dependency to verify the operator admin secret token.
    Raises 401 HTTP exception if the token is invalid or missing.
    """
    expected_token = os.getenv("ADMIN_SECRET_KEY", "stadiumflow-admin-secret-token")
    if not x_admin_token or x_admin_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized operator token. X-Admin-Token header missing or incorrect."
        )
