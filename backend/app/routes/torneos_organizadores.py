from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.database import get_db
from app.models.models import (
    TorneoOrganizador, Torneo, Organizador, Ciudad, 
    InscripcionTorneoOrganizador, Jugador, Pago
)
from app.schemas.schemas import TorneoOrganizadorCreate, TorneoOrganizadorResponse, TorneoOrganizadorDetalle
from app.security import get_current_organizador
from app.exceptions import TorneoNoEncontrado, AccesoDenegado, DatosInvalidos
from datetime import date

router = APIRouter()


@router.post("/", response_model=TorneoOrganizadorResponse, status_code=status.HTTP_201_CREATED)
def crear_torneo_organizador(
    torneo_org_data: TorneoOrganizadorCreate,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """
    Crear una nueva instancia de torneo (organizador crea su propia versión).
    Solo el organizador autenticado puede crear sus propios torneos.
    Validaciones:
    - La fecha no puede ser en el pasado
    - El costo debe ser > 0
    - El límite de jugadores debe estar entre 2 y 1000
    """
    payload = current_user["payload"]
    id_organizador = payload.get("id_organizador")
    
    # Validaciones del schema ya se hacen automáticamente con pydantic
    # Pero agregamos validación adicional aquí si es necesario
    
    # Validar que el torneo existe
    torneo = db.query(Torneo).filter(Torneo.id_torneo == torneo_org_data.fk_torneo_id).first()
    if not torneo:
        raise TorneoNoEncontrado()
    
    # Validar que el organizador existe
    organizador = db.query(Organizador).filter(Organizador.id_organizador == id_organizador).first()
    if not organizador:
        raise DatosInvalidos("Organizador no encontrado")
    
    # Validar que la ciudad existe
    ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == torneo_org_data.fk_ciudad_id).first()
    if not ciudad:
        raise DatosInvalidos("Ciudad no encontrada")
    
    # Crear instancia del torneo
    nuevo_torneo_org = TorneoOrganizador(
        fk_torneo_id=torneo_org_data.fk_torneo_id,
        fk_organizador_id=id_organizador,
        fecha_torneo=torneo_org_data.fecha_torneo,
        costo=torneo_org_data.costo,
        fk_ciudad_id=torneo_org_data.fk_ciudad_id,
        limite_jugadores=torneo_org_data.limite_jugadores
    )
    db.add(nuevo_torneo_org)
    db.commit()
    db.refresh(nuevo_torneo_org)
    
    return nuevo_torneo_org


@router.get("/", response_model=list[TorneoOrganizadorDetalle])
def listar_torneos_organizadores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de todas las instancias de torneos disponibles."""
    torneos_org = db.query(TorneoOrganizador).offset(skip).limit(limit).all()
    
    resultado = []
    for to in torneos_org:
        resultado.append({
            "id_torneo_organizador": to.id_torneo_organizador,
            "torneo": {"id_torneo": to.torneo.id_torneo, "nombre_torneo": to.torneo.nombre_torneo},
            "organizador": {
                "id_organizador": to.organizador.id_organizador,
                "nombre_organizador": to.organizador.nombre_organizador,
                "fk_direccion_id": to.organizador.fk_direccion_id,
                "fk_usuario_id": to.organizador.fk_usuario_id,
                "usuario": {
                    "id_usuario": to.organizador.usuario.id_usuario,
                    "email": to.organizador.usuario.email,
                    "tipo_usuario": to.organizador.usuario.tipo_usuario,
                    "foto_perfil": to.organizador.usuario.foto_perfil,
                    "activo": to.organizador.usuario.activo,
                    "fecha_creacion": to.organizador.usuario.fecha_creacion
                }
            },
            "fecha_torneo": to.fecha_torneo,
            "costo": float(to.costo),
            "ciudad_nombre": to.ciudad.nombre_ciudad
        })
    
    return resultado


@router.get("/{id_torneo_organizador}", response_model=TorneoOrganizadorDetalle)
def obtener_torneo_organizador(id_torneo_organizador: int, db: Session = Depends(get_db)):
    """Obtener detalles de una instancia específica de torneo."""
    torneo_org = db.query(TorneoOrganizador).filter(
        TorneoOrganizador.id_torneo_organizador == id_torneo_organizador
    ).first()
    
    if not torneo_org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instancia de torneo no encontrada"
        )
    
    return {
        "id_torneo_organizador": torneo_org.id_torneo_organizador,
        "torneo": {"id_torneo": torneo_org.torneo.id_torneo, "nombre_torneo": torneo_org.torneo.nombre_torneo},
        "organizador": {
            "id_organizador": torneo_org.organizador.id_organizador,
            "nombre_organizador": torneo_org.organizador.nombre_organizador,
            "fk_direccion_id": torneo_org.organizador.fk_direccion_id,
            "fk_usuario_id": torneo_org.organizador.fk_usuario_id,
            "usuario": {
                "id_usuario": torneo_org.organizador.usuario.id_usuario,
                "email": torneo_org.organizador.usuario.email,
                "tipo_usuario": torneo_org.organizador.usuario.tipo_usuario,
                "foto_perfil": torneo_org.organizador.usuario.foto_perfil,
                "activo": torneo_org.organizador.usuario.activo,
                "fecha_creacion": torneo_org.organizador.usuario.fecha_creacion
            }
        },
        "fecha_torneo": torneo_org.fecha_torneo,
        "costo": float(torneo_org.costo),
        "ciudad_nombre": torneo_org.ciudad.nombre_ciudad
    }


@router.get("/{id_torneo_organizador}/jugadores-inscritos")
def listar_jugadores_inscritos(
    id_torneo_organizador: int,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """
    Obtener lista de jugadores inscritos en un torneo (solo el organizador dueño).
    Muestra estado de pago y monto.
    """
    payload = current_user["payload"]
    id_organizador = payload.get("id_organizador")
    
    # Validar que el torneo_organizador existe
    torneo_org = db.query(TorneoOrganizador).filter(
        TorneoOrganizador.id_torneo_organizador == id_torneo_organizador
    ).first()
    
    if not torneo_org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instancia de torneo no encontrada"
        )
    
    # Validar que el organizador logueado es el dueño
    if torneo_org.fk_organizador_id != id_organizador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta información"
        )
    
    # Obtener inscripciones con sus pagos
    inscripciones = db.query(InscripcionTorneoOrganizador).filter(
        InscripcionTorneoOrganizador.fk_torneo_organizador_id == id_torneo_organizador
    ).all()
    
    resultado = []
    for inscripcion in inscripciones:
        jugador = inscripcion.jugador
        pago = inscripcion.pago
        
        resultado.append({
            "id_inscripcion": inscripcion.id_inscripcion,
            "jugador_nombre": jugador.nombre,
            "jugador_apellido": jugador.apellido,
            "telefono": jugador.telefono,
            "fecha_inscripcion": inscripcion.fecha_inscripcion,
            "estado_pago": pago.estado_pago if pago else "Sin pago",
            "monto": float(pago.monto) if pago else 0,
            "medio_pago": pago.medio_pago if pago else "N/A"
        })
    
    return resultado
