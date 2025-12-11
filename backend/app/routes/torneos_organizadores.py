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


@router.post("/", response_model=TorneoOrganizadorDetalle, status_code=status.HTTP_201_CREATED)
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
        fk_ciudad_id=torneo_org_data.fk_ciudad_id
    )
    db.add(nuevo_torneo_org)
    db.commit()
    db.refresh(nuevo_torneo_org)
    
    # Cargar relaciones para poder retornar el objeto completo
    db.refresh(nuevo_torneo_org)
    from sqlalchemy.orm import joinedload
    nuevo_torneo_org = db.query(TorneoOrganizador)\
        .options(
            joinedload(TorneoOrganizador.torneo),
            joinedload(TorneoOrganizador.ciudad)
        )\
        .filter(TorneoOrganizador.id_torneo_organizador == nuevo_torneo_org.id_torneo_organizador)\
        .first()
    
    return {
        "id_torneo_organizador": nuevo_torneo_org.id_torneo_organizador,
        "torneo": {"id_torneo": nuevo_torneo_org.torneo.id_torneo, "nombre_torneo": nuevo_torneo_org.torneo.nombre_torneo},
        "organizador": {
            "id_organizador": nuevo_torneo_org.organizador.id_organizador,
            "nombre_organizador": nuevo_torneo_org.organizador.nombre_organizador,
            "fk_direccion_id": nuevo_torneo_org.organizador.fk_direccion_id,
            "fk_usuario_id": nuevo_torneo_org.organizador.fk_usuario_id,
            "usuario": {
                "id_usuario": nuevo_torneo_org.organizador.usuario.id_usuario,
                "email": nuevo_torneo_org.organizador.usuario.email,
                "tipo_usuario": nuevo_torneo_org.organizador.usuario.tipo_usuario,
                "foto_perfil": nuevo_torneo_org.organizador.usuario.foto_perfil,
                "activo": nuevo_torneo_org.organizador.usuario.activo,
                "fecha_creacion": nuevo_torneo_org.organizador.usuario.fecha_creacion
            }
        },
        "fecha_torneo": nuevo_torneo_org.fecha_torneo,
        "costo": float(nuevo_torneo_org.costo),
        "ciudad_nombre": nuevo_torneo_org.ciudad.nombre_ciudad,
        "inscripciones_count": 0
    }


@router.get("/", response_model=list[TorneoOrganizadorDetalle])
def listar_torneos_organizadores(
    skip: int = 0, 
    limit: int = 100, 
    jugador_id: int = None,
    organizador_id: int = None,
    db: Session = Depends(get_db)
):
    """Obtener lista de todas las instancias de torneos disponibles.
    Si se proporciona jugador_id, filtra los torneos en los que ya está inscrito.
    Si se proporciona organizador_id, devuelve solo los torneos de ese organizador."""
    from sqlalchemy.orm import joinedload
    
    # Obtener torneos con relaciones eager loaded
    query = db.query(TorneoOrganizador)\
        .options(
            joinedload(TorneoOrganizador.torneo),
            joinedload(TorneoOrganizador.organizador).joinedload(Organizador.usuario),
            joinedload(TorneoOrganizador.ciudad)
        )
    
    # Filtrar por organizador_id si se proporciona
    if organizador_id:
        query = query.filter(TorneoOrganizador.fk_organizador_id == organizador_id)
    
    torneos_org = query.offset(skip).limit(limit).all()
    
    # Si se proporciona jugador_id, filtrar los torneos donde ya está inscrito
    if jugador_id:
        # Obtener IDs de torneos en los que el jugador ya está inscrito
        from app.models.models import Inscripcion
        torneos_inscritos = db.query(InscripcionTorneoOrganizador.fk_torneo_organizador_id)\
            .join(Inscripcion, Inscripcion.id_inscripcion == InscripcionTorneoOrganizador.fk_inscripcion_id)\
            .filter(Inscripcion.fk_jugador_id == jugador_id).all()
        torneos_inscritos_ids = {t[0] for t in torneos_inscritos}
        torneos_org = [t for t in torneos_org if t.id_torneo_organizador not in torneos_inscritos_ids]
    
    # Obtener conteos en UNA sola query
    conteos = db.query(
        InscripcionTorneoOrganizador.fk_torneo_organizador_id,
        func.count(InscripcionTorneoOrganizador.id_inscripcion_relacion).label('count')
    ).group_by(InscripcionTorneoOrganizador.fk_torneo_organizador_id).all()
    
    conteos_dict = {id_torneo: count for id_torneo, count in conteos}
    
    resultado = []
    for to in torneos_org:
        inscritos = conteos_dict.get(to.id_torneo_organizador, 0)
        
        # Si se filtra por organizador_id, incluir datos más completos
        # Si no, solo datos básicos para no sobrecargar
        if organizador_id:
            resultado.append({
                "id_torneo_organizador": to.id_torneo_organizador,
                "torneo": {"id_torneo": to.torneo.id_torneo, "nombre_torneo": to.torneo.nombre_torneo},
                "fecha_torneo": to.fecha_torneo,
                "costo": float(to.costo),
                "ciudad_nombre": to.ciudad.nombre_ciudad,
                "inscripciones_count": inscritos,
                "limite_jugadores": 100
            })
        else:
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
                "ciudad_nombre": to.ciudad.nombre_ciudad,
                "inscripciones_count": inscritos,
                "limite_jugadores": 100
            })
    
    return resultado


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
    for inscripcion_relacion in inscripciones:
        inscripcion = inscripcion_relacion.inscripcion
        jugador = inscripcion.jugador
        usuario = jugador.usuario
        pago = inscripcion.pago
        
        resultado.append({
            "id_inscripcion": inscripcion.id_inscripcion,
            "nombre_usuario": f"{jugador.nombre} {jugador.apellido}",
            "correo_usuario": usuario.email,
            "telefono_usuario": jugador.telefono,
            "fecha_inscripcion": inscripcion.fecha_inscripcion.isoformat() if inscripcion.fecha_inscripcion else None,
            "estado_pago": pago.estado_pago.value if pago else "Sin pago",
            "monto": float(pago.monto) if pago else 0,
            "medio_pago": pago.medio_pago.value if pago else "N/A"
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


@router.put("/{id_torneo_organizador}", response_model=TorneoOrganizadorDetalle)
def actualizar_torneo_organizador(
    id_torneo_organizador: int,
    torneo_data: TorneoOrganizadorCreate,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """
    Actualizar un torneo (solo el organizador propietario).
    """
    payload = current_user["payload"]
    id_organizador = payload.get("id_organizador")
    
    # Validar que el torneo existe
    torneo_org = db.query(TorneoOrganizador).filter(
        TorneoOrganizador.id_torneo_organizador == id_torneo_organizador
    ).first()
    
    if not torneo_org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )
    
    # Validar que el organizador logueado es el propietario
    if torneo_org.fk_organizador_id != id_organizador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este torneo"
        )
    
    # Validar que el torneo base existe
    torneo = db.query(Torneo).filter(Torneo.id_torneo == torneo_data.fk_torneo_id).first()
    if not torneo:
        raise TorneoNoEncontrado()
    
    # Validar que la ciudad existe
    ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == torneo_data.fk_ciudad_id).first()
    if not ciudad:
        raise DatosInvalidos("Ciudad no encontrada")
    
    # Actualizar campos
    torneo_org.fk_torneo_id = torneo_data.fk_torneo_id
    torneo_org.fecha_torneo = torneo_data.fecha_torneo
    torneo_org.costo = torneo_data.costo
    torneo_org.fk_ciudad_id = torneo_data.fk_ciudad_id
    
    db.commit()
    db.refresh(torneo_org)
    
    # Cargar relaciones para poder retornar el objeto completo
    from sqlalchemy.orm import joinedload
    torneo_org = db.query(TorneoOrganizador)\
        .options(
            joinedload(TorneoOrganizador.torneo),
            joinedload(TorneoOrganizador.ciudad)
        )\
        .filter(TorneoOrganizador.id_torneo_organizador == id_torneo_organizador)\
        .first()
    
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
        "ciudad_nombre": torneo_org.ciudad.nombre_ciudad,
        "inscripciones_count": 0
    }


@router.delete("/{id_torneo_organizador}", status_code=status.HTTP_200_OK)
def eliminar_torneo_organizador(
    id_torneo_organizador: int,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """
    Eliminar un torneo (solo el organizador propietario).
    Solo se puede eliminar si no tiene inscripciones.
    """
    payload = current_user["payload"]
    id_organizador = payload.get("id_organizador")
    
    # Validar que el torneo existe
    torneo_org = db.query(TorneoOrganizador).filter(
        TorneoOrganizador.id_torneo_organizador == id_torneo_organizador
    ).first()
    
    if not torneo_org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )
    
    # Validar que el organizador logueado es el propietario
    if torneo_org.fk_organizador_id != id_organizador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este torneo"
        )
    
    # Validar que no tiene inscripciones
    inscripciones = db.query(InscripcionTorneoOrganizador).filter(
        InscripcionTorneoOrganizador.fk_torneo_organizador_id == id_torneo_organizador
    ).count()
    
    if inscripciones > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No puedes cancelar este torneo. Tiene {inscripciones} jugador(es) inscrito(s). Todos los jugadores deben cancelar su inscripción primero."
        )
    
    db.delete(torneo_org)
    db.commit()
    
    return {"message": "Torneo eliminado exitosamente"}
