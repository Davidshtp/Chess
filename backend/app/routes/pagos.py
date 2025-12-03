from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Pago, InscripcionTorneoOrganizador
from app.schemas.schemas import PagoResponse
from app.security import get_current_user_from_header

router = APIRouter()


@router.get("/{id_pago}", response_model=PagoResponse)
def obtener_pago(
    id_pago: int,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener detalles de un pago específico (requiere autenticación)."""
    pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    return pago


@router.get("/inscripcion/{id_inscripcion}", response_model=PagoResponse)
def obtener_pago_por_inscripcion(
    id_inscripcion: int,
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Obtener el pago asociado a una inscripción (requiere autenticación)."""
    # Validar que la inscripción existe
    inscripcion = db.query(InscripcionTorneoOrganizador).filter(
        InscripcionTorneoOrganizador.id_inscripcion == id_inscripcion
    ).first()
    
    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada"
        )
    
    pago = db.query(Pago).filter(Pago.fk_inscripcion_id == id_inscripcion).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    return pago
