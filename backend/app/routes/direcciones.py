from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Direccion, Ciudad
from app.schemas.schemas import DireccionCreate, DireccionResponse
from app.security import get_current_user_from_header

router = APIRouter()


@router.get("/", response_model=list[DireccionResponse])
def listar_direcciones(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener lista de todas las direcciones (requiere autenticación)."""
    direcciones = db.query(Direccion).offset(skip).limit(limit).all()
    return direcciones


@router.get("/{id_direccion}", response_model=DireccionResponse)
def obtener_direccion(
    id_direccion: int,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener una dirección específica por su ID (requiere autenticación)."""
    direccion = db.query(Direccion).filter(Direccion.id_direccion == id_direccion).first()
    
    if not direccion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección no encontrada"
        )
    
    return direccion


@router.get("/ciudad/{id_ciudad}", response_model=list[DireccionResponse])
def listar_direcciones_por_ciudad(
    id_ciudad: int,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener todas las direcciones de una ciudad específica (requiere autenticación)."""
    # Validar que la ciudad existe
    ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == id_ciudad).first()
    if not ciudad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciudad no encontrada"
        )
    
    direcciones = db.query(Direccion).filter(Direccion.fk_ciudad_id == id_ciudad).all()
    return direcciones
