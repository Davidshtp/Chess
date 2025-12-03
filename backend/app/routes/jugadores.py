from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Usuario, Jugador, Direccion, TorneoOrganizador, InscripcionTorneoOrganizador
from app.schemas.schemas import JugadorCreate, JugadorResponse, JugadorUpdate
from app.routes.auth import hash_password
from app.security import get_current_jugador
from app.exceptions import EmailYaExiste, DatosInvalidos, AccesoDenegado

router = APIRouter()


@router.post("/registrar", response_model=JugadorResponse, status_code=status.HTTP_201_CREATED)
def registrar_jugador(jugador_data: JugadorCreate, db: Session = Depends(get_db)):
    """
    Registrar un nuevo jugador.
    Crea un usuario y un jugador.
    
    Validaciones:
    - La dirección debe existir
    - El email debe ser único
    - El nombre y apellido solo pueden contener letras
    - La contraseña debe tener mínimo 6 caracteres
    """
    # Validar que la dirección existe
    direccion = db.query(Direccion).filter(Direccion.id_direccion == jugador_data.fk_direccion_id).first()
    if not direccion:
        raise DatosInvalidos("Dirección no encontrada")
    
    # Validar que el email no exista (case-insensitive)
    usuario_existente = db.query(Usuario).filter(
        Usuario.email.ilike(jugador_data.email)
    ).first()
    if usuario_existente:
        raise EmailYaExiste()
    
    # Crear usuario
    nuevo_usuario = Usuario(
        email=jugador_data.email,
        contraseña=hash_password(jugador_data.contraseña),
        tipo_usuario="jugador",
        activo=True
    )
    db.add(nuevo_usuario)
    db.flush()  # Para obtener el id sin commitear
    
    # Crear jugador
    nuevo_jugador = Jugador(
        nombre=jugador_data.nombre,
        apellido=jugador_data.apellido,
        telefono=jugador_data.telefono,
        fk_direccion_id=jugador_data.fk_direccion_id,
        fk_usuario_id=nuevo_usuario.id_usuario
    )
    db.add(nuevo_jugador)
    db.commit()
    db.refresh(nuevo_jugador)
    
    return nuevo_jugador


@router.get("/torneo/{id_torneo_organizador}")
def listar_jugadores_por_torneo(
    id_torneo_organizador: int,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """Obtener lista de jugadores inscritos en un torneo específico."""
    # Validar que el torneo_organizador existe
    torneo_org = db.query(TorneoOrganizador).filter(
        TorneoOrganizador.id_torneo_organizador == id_torneo_organizador
    ).first()
    
    if not torneo_org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )
    
    # Obtener jugadores inscritos
    inscripciones = db.query(InscripcionTorneoOrganizador).filter(
        InscripcionTorneoOrganizador.fk_torneo_organizador_id == id_torneo_organizador
    ).all()
    
    jugadores = [inscripcion.jugador for inscripcion in inscripciones]
    return jugadores


@router.get("/{id_jugador}", response_model=JugadorResponse)
def obtener_jugador(
    id_jugador: int,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """Obtener un jugador específico por su ID (solo autenticados)."""
    jugador = db.query(Jugador).filter(Jugador.id_jugador == id_jugador).first()
    
    if not jugador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado"
        )
    
    return jugador


@router.put("/{id_jugador}", response_model=JugadorResponse)
def actualizar_jugador(
    id_jugador: int,
    jugador_data: JugadorUpdate,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """Actualizar datos de un jugador (solo el jugador autenticado)."""
    payload = current_user["payload"]
    
    # Validar que solo puede actualizar sus propios datos
    if payload.get("id_jugador") != id_jugador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este jugador"
        )
    
    jugador = db.query(Jugador).filter(Jugador.id_jugador == id_jugador).first()
    
    if not jugador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado"
        )
    
    # Validar que la dirección existe si se intenta cambiar
    if jugador_data.fk_direccion_id:
        direccion = db.query(Direccion).filter(Direccion.id_direccion == jugador_data.fk_direccion_id).first()
        if not direccion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dirección no encontrada"
            )
    
    # Actualizar solo los campos que se envían
    datos = jugador_data.dict(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(jugador, campo, valor)
    
    db.add(jugador)
    db.commit()
    db.refresh(jugador)
    
    return jugador


@router.delete("/{id_jugador}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_jugador(
    id_jugador: int,
    current_user = Depends(get_current_jugador),
    db: Session = Depends(get_db)
):
    """Eliminar un jugador (solo el jugador autenticado)."""
    payload = current_user["payload"]
    
    # Validar que solo puede eliminar su propia cuenta
    if payload.get("id_jugador") != id_jugador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este jugador"
        )
    
    jugador = db.query(Jugador).filter(Jugador.id_jugador == id_jugador).first()
    
    if not jugador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado"
        )
    
    # También eliminar el usuario asociado
    usuario = db.query(Usuario).filter(Usuario.id_usuario == jugador.fk_usuario_id).first()
    if usuario:
        db.delete(usuario)
    
    db.delete(jugador)
    db.commit()
