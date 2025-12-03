from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Usuario, Jugador, Organizador
from app.schemas.schemas import UsuarioLogin, UsuarioResponse
import bcrypt
from datetime import datetime, timedelta
import jwt
import os

router = APIRouter()

# Configuración JWT
SECRET_KEY = os.getenv("SECRET_KEY", "tu-clave-secreta-super-segura-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas


def hash_password(password: str) -> str:
    """Hashear contraseña con bcrypt"""
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña con bcrypt"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Crear token JWT"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def verify_token(token: str):
    """Verificar y decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )


def get_current_user(token: str = None, db: Session = Depends(get_db)):
    """Dependency para obtener usuario actual validando JWT"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado"
        )
    
    payload = verify_token(token)
    usuario_id = payload.get("id_usuario")
    
    if usuario_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return usuario


@router.post("/login")
def login(usuario_login: UsuarioLogin, db: Session = Depends(get_db)):
    """
    Login de usuario (jugador u organizador).
    Retorna JWT token con toda la información del usuario.
    """
    # Buscar usuario por email
    usuario = db.query(Usuario).filter(Usuario.email == usuario_login.email).first()
    
    if not usuario or not verify_password(usuario_login.contraseña, usuario.contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado"
        )
    
    # Construir payload con toda la información del usuario
    payload = {
        "id_usuario": usuario.id_usuario,
        "email": usuario.email,
        "tipo_usuario": usuario.tipo_usuario,
        "foto_perfil": usuario.foto_perfil,
        "activo": usuario.activo,
        "fecha_creacion": usuario.fecha_creacion.isoformat()
    }
    
    # Agregar información específica según tipo de usuario
    if usuario.tipo_usuario == "jugador":
        jugador = db.query(Jugador).filter(Jugador.fk_usuario_id == usuario.id_usuario).first()
        if jugador:
            payload["id_jugador"] = jugador.id_jugador
            payload["nombre"] = jugador.nombre
            payload["apellido"] = jugador.apellido
            payload["telefono"] = jugador.telefono
            payload["fk_direccion_id"] = jugador.fk_direccion_id
    
    elif usuario.tipo_usuario == "organizador":
        organizador = db.query(Organizador).filter(Organizador.fk_usuario_id == usuario.id_usuario).first()
        if organizador:
            payload["id_organizador"] = organizador.id_organizador
            payload["nombre_organizador"] = organizador.nombre_organizador
            payload["fk_direccion_id"] = organizador.fk_direccion_id
    
    # Crear token JWT
    access_token = create_access_token(payload)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": payload,
        "mensaje": "Login exitoso"
    }


@router.post("/verify-token")
def verify_token_endpoint(token: str, db: Session = Depends(get_db)):
    """
    Endpoint para verificar y decodificar un JWT.
    El frontend puede usar esto para validar que el token es válido.
    """
    payload = verify_token(token)
    return {
        "valido": True,
        "usuario": payload,
        "mensaje": "Token válido"
    }


@router.get("/me")
def get_current_user_info(token: str = None, db: Session = Depends(get_db)):
    """
    Obtener información del usuario actual.
    Requiere token en query parameter o header Authorization.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado"
        )
    
    payload = verify_token(token)
    
    return {
        "usuario": payload,
        "mensaje": "Usuario autenticado"
    }
