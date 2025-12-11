from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Direccion, Ciudad
from app.schemas.schemas import DireccionCreate, DireccionResponse
from app.security import get_current_user_from_header

router = APIRouter()


@router.post("/", response_model=DireccionResponse)
def crear_direccion(
    direccion_data: DireccionCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva dirección (endpoint público para registro)."""
    # Validar que la ciudad existe
    ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == direccion_data.fk_ciudad_id).first()
    if not ciudad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciudad no encontrada"
        )
    
    # Crear la dirección
    nueva_direccion = Direccion(
        direccion=direccion_data.direccion,
        fk_ciudad_id=direccion_data.fk_ciudad_id
    )
    db.add(nueva_direccion)
    db.commit()
    db.refresh(nueva_direccion)
    
    return nueva_direccion


@router.get("/", response_model=list[DireccionResponse])
def listar_direcciones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener lista de todas las direcciones (endpoint público)."""
    direcciones = db.query(Direccion).offset(skip).limit(limit).all()
    return direcciones


@router.get("/{id_direccion}", response_model=DireccionResponse)
def obtener_direccion(
    id_direccion: int,
    db: Session = Depends(get_db)
):
    """Obtener una dirección específica por su ID (endpoint público)."""
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
    db: Session = Depends(get_db)
):
    """Obtener todas las direcciones de una ciudad específica (endpoint público)."""
    # Validar que la ciudad existe
    ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == id_ciudad).first()
    if not ciudad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciudad no encontrada"
        )
    
    direcciones = db.query(Direccion).filter(Direccion.fk_ciudad_id == id_ciudad).all()
    return direcciones
