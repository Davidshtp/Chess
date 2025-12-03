from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Torneo
from app.schemas.schemas import TorneoCreate, TorneoResponse
from app.security import get_current_user_from_header

router = APIRouter()


@router.post("/", response_model=TorneoResponse, status_code=status.HTTP_201_CREATED)
def crear_torneo(torneo_data: TorneoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo torneo base (catálogo)."""
    # Validar que no exista
    torneo_existente = db.query(Torneo).filter(Torneo.nombre_torneo == torneo_data.nombre_torneo).first()
    if torneo_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Torneo ya existe"
        )
    
    nuevo_torneo = Torneo(nombre_torneo=torneo_data.nombre_torneo)
    db.add(nuevo_torneo)
    db.commit()
    db.refresh(nuevo_torneo)
    
    return nuevo_torneo


@router.get("/", response_model=list[TorneoResponse])
def listar_torneos(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener lista de todos los torneos base disponibles (requiere autenticación)."""
    torneos = db.query(Torneo).offset(skip).limit(limit).all()
    return torneos


@router.get("/{id_torneo}", response_model=TorneoResponse)
def obtener_torneo(
    id_torneo: int,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener un torneo base específico por su ID (requiere autenticación)."""
    torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
    
    if not torneo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )
    
    return torneo
