from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Ciudad, Pais
from app.schemas.schemas import CiudadCreate, CiudadResponse

router = APIRouter()


@router.get("/", response_model=list[CiudadResponse])
def listar_ciudades(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener lista de todas las ciudades (endpoint público)."""
    ciudades = db.query(Ciudad).offset(skip).limit(limit).all()
    return ciudades


@router.get("/{id_ciudad}", response_model=CiudadResponse)
def obtener_ciudad(
    id_ciudad: int,
    db: Session = Depends(get_db)
):
    """Obtener una ciudad específica por su ID (endpoint público)."""
    ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == id_ciudad).first()
    
    if not ciudad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciudad no encontrada"
        )
    
    return ciudad


@router.get("/pais/{id_pais}", response_model=list[CiudadResponse])
def listar_ciudades_por_pais(
    id_pais: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las ciudades de un país específico (endpoint público)."""
    # Validar que el país existe
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="País no encontrado"
        )
    
    ciudades = db.query(Ciudad).filter(Ciudad.fk_pais_id == id_pais).all()
    return ciudades
