"""
Utilidades de seguridad y autenticación.
Incluye decoradores y dependencias para proteger endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Usuario
from app.routes.auth import verify_token

security = HTTPBearer(auto_error=False)


def get_current_user_from_header(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Obtener usuario actual desde el header Authorization.
    En Swagger: Click en "Authorize" y pasa el token (sin "Bearer")
    O en el header: Authorization: Bearer {token}
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        payload = verify_token(token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    usuario_id = payload.get("id_usuario")
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return {"usuario": usuario, "payload": payload}


def get_current_jugador(current_user = Depends(get_current_user_from_header)):
    """
    Validar que el usuario actual es un jugador.
    """
    payload = current_user["payload"]
    
    if payload.get("tipo_usuario") != "jugador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso solo para jugadores"
        )
    
    return current_user


def get_current_organizador(current_user = Depends(get_current_user_from_header)):
    """
    Validar que el usuario actual es un organizador.
    """
    payload = current_user["payload"]
    
    if payload.get("tipo_usuario") != "organizador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso solo para organizadores"
        )
    
    return current_user
