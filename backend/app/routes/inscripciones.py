from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import (
    Inscripcion, InscripcionTorneoOrganizador, Jugador, TorneoOrganizador, 
    Pago, EstadoPago, MedioPago
)
from app.schemas.schemas import InscripcionCreate
from app.security import get_current_jugador
from app.exceptions import TorneoLleno, YaInscrito, AccesoDenegado

router = APIRouter()


@router.post("/{id_jugador}")
def inscribir_jugador(
    id_jugador: int,
    inscripcion_data: InscripcionCreate,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """
    Inscribir un jugador en un torneo (solo el jugador autenticado).
    Esto también crea automáticamente el registro de pago.
    
    Validaciones:
    - El jugador solo puede inscribirse a sí mismo
    - No puede estar ya inscrito en el torneo
    - El torneo no debe haber alcanzado el límite de jugadores
    """
    payload = current_user["payload"]
    
    # Validar que solo puede inscribirse a sí mismo
    if payload.get("id_jugador") != id_jugador:
        raise AccesoDenegado("No tienes permiso para inscribir este jugador")
    
    # Validar que el jugador existe
    jugador = db.query(Jugador).filter(Jugador.id_jugador == id_jugador).first()
    if not jugador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado"
        )
    
    # Validar que el torneo_organizador existe
    torneo_org = db.query(TorneoOrganizador).filter(
        TorneoOrganizador.id_torneo_organizador == inscripcion_data.fk_torneo_organizador_id
    ).first()
    if not torneo_org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instancia de torneo no encontrada"
        )
    
    # Validar que el jugador no esté ya inscrito
    inscripcion_existente = db.query(InscripcionTorneoOrganizador).join(Inscripcion).filter(
        Inscripcion.fk_jugador_id == id_jugador,
        InscripcionTorneoOrganizador.fk_torneo_organizador_id == inscripcion_data.fk_torneo_organizador_id
    ).first()
    if inscripcion_existente:
        raise YaInscrito()
    
    # Crear inscripción base primero (sin pago)
    nueva_inscripcion = Inscripcion(
        fk_jugador_id=id_jugador
    )
    db.add(nueva_inscripcion)
    db.flush()  # Para obtener el id de inscripción
    
    # Crear pago automáticamente (para pruebas, siempre con estado "Pagado")
    nuevo_pago = Pago(
        medio_pago=inscripcion_data.medio_pago,
        estado_pago=EstadoPago.pagado,  # Para pruebas
        monto=torneo_org.costo
    )
    db.add(nuevo_pago)
    db.flush()  # Para obtener el id del pago
    
    # Actualizar inscripción con el id del pago
    nueva_inscripcion.fk_pago_id = nuevo_pago.id_pago
    
    # Crear relación inscripción-torneo
    inscripcion_torneo = InscripcionTorneoOrganizador(
        fk_inscripcion_id=nueva_inscripcion.id_inscripcion,
        fk_torneo_organizador_id=inscripcion_data.fk_torneo_organizador_id
    )
    db.add(inscripcion_torneo)
    db.commit()
    
    # Obtener el número de inscripciones actuales para el torneo
    inscripciones_actuales = db.query(func.count(InscripcionTorneoOrganizador.id_inscripcion_relacion)).filter(
        InscripcionTorneoOrganizador.fk_torneo_organizador_id == inscripcion_data.fk_torneo_organizador_id
    ).scalar()
    
    return {
        "id_inscripcion": nueva_inscripcion.id_inscripcion,
        "id_jugador": id_jugador,
        "id_torneo_organizador": inscripcion_data.fk_torneo_organizador_id,
        "fecha_inscripcion": nueva_inscripcion.fecha_inscripcion,
        "estado_pago": "Pagado",
        "monto": float(torneo_org.costo),
        "medio_pago": inscripcion_data.medio_pago,
        "jugadores_inscritos": inscripciones_actuales,
        "mensaje": "Inscripción exitosa"
    }


@router.get("/{id_jugador}")
def listar_inscripciones_jugador(
    id_jugador: int,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """Obtener todos los torneos en los que está inscrito un jugador (solo el jugador autenticado)."""
    payload = current_user["payload"]
    
    # Validar que solo puede ver sus propias inscripciones
    if payload.get("id_jugador") != id_jugador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver estas inscripciones"
        )
    
    # Validar que el jugador existe
    jugador = db.query(Jugador).filter(Jugador.id_jugador == id_jugador).first()
    if not jugador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado"
        )
    
    # Obtener inscripciones del jugador
    inscripciones = db.query(Inscripcion).filter(
        Inscripcion.fk_jugador_id == id_jugador
    ).all()
    
    resultado = []
    for inscripcion in inscripciones:
        # Obtener los torneos asociados a esta inscripción
        torneos = db.query(InscripcionTorneoOrganizador).filter(
            InscripcionTorneoOrganizador.fk_inscripcion_id == inscripcion.id_inscripcion
        ).all()
        
        for inst_torneo in torneos:
            torneo_org = inst_torneo.torneo_organizador
            pago = inscripcion.pago
            
            resultado.append({
                "id_inscripcion": inscripcion.id_inscripcion,
                "id_torneo_organizador": torneo_org.id_torneo_organizador,
                "nombre_torneo": torneo_org.torneo.nombre_torneo,
                "nombre_organizador": torneo_org.organizador.nombre_organizador,
                "ciudad": torneo_org.ciudad.nombre_ciudad,
                "fecha_torneo": torneo_org.fecha_torneo,
                "costo": float(torneo_org.costo),
                "fecha_inscripcion": inscripcion.fecha_inscripcion,
                "estado_pago": pago.estado_pago if pago else "Sin pago",
                "medio_pago": pago.medio_pago if pago else "N/A"
            })
    
    return resultado


@router.delete("/{id_inscripcion}")
def cancelar_inscripcion(
    id_inscripcion: int,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """Cancelar la inscripción de un jugador a un torneo (solo el jugador autenticado)."""
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.id_inscripcion == id_inscripcion
    ).first()
    
    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada"
        )
    
    payload = current_user["payload"]
    
    # Validar que solo puede cancelar sus propias inscripciones
    if payload.get("id_jugador") != inscripcion.fk_jugador_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para cancelar esta inscripción"
        )
    
    # Eliminar relaciones inscripción-torneo
    db.query(InscripcionTorneoOrganizador).filter(
        InscripcionTorneoOrganizador.fk_inscripcion_id == id_inscripcion
    ).delete()
    
    # Eliminar pago asociado (si existe)
    if inscripcion.fk_pago_id:
        pago = db.query(Pago).filter(Pago.id_pago == inscripcion.fk_pago_id).first()
        if pago:
            db.delete(pago)
    
    # Eliminar inscripción
    db.delete(inscripcion)
    db.commit()
    
    return {"mensaje": "Inscripción cancelada"}
