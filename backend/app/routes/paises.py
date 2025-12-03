from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Pais
from app.schemas.schemas import PaisCreate, PaisResponse

router = APIRouter()


@router.get("/", response_model=list[PaisResponse])
def listar_paises(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener lista de todos los países (endpoint público)."""
    paises = db.query(Pais).offset(skip).limit(limit).all()
    return paises


@router.get("/{id_pais}", response_model=PaisResponse)
def obtener_pais(
    id_pais: int,
    db: Session = Depends(get_db)
):
    """Obtener un país específico por su ID (endpoint público)."""
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    
    if not pais:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="País no encontrado"
        )
    
    return pais
