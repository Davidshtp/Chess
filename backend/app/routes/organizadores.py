from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Usuario, Organizador, Direccion
from app.schemas.schemas import OrganizadorCreate, OrganizadorResponse, OrganizadorUpdate
from app.routes.auth import hash_password
from app.security import get_current_organizador
from app.exceptions import EmailYaExiste, DatosInvalidos, AccesoDenegado

router = APIRouter()


@router.post("/registrar", response_model=OrganizadorResponse, status_code=status.HTTP_201_CREATED)
def registrar_organizador(organizador_data: OrganizadorCreate, db: Session = Depends(get_db)):
    """
    Registrar un nuevo organizador.
    Crea un usuario y un organizador.
    
    Validaciones:
    - La dirección debe existir
    - El email debe ser único
    - El nombre del organizador debe tener entre 2 y 100 caracteres
    - La contraseña debe tener mínimo 6 caracteres
    """
    # Validar que la dirección existe
    direccion = db.query(Direccion).filter(Direccion.id_direccion == organizador_data.fk_direccion_id).first()
    if not direccion:
        raise DatosInvalidos("Dirección no encontrada")
    
    # Validar que el email no exista (case-insensitive)
    usuario_existente = db.query(Usuario).filter(
        Usuario.email.ilike(organizador_data.email)
    ).first()
    if usuario_existente:
        raise EmailYaExiste()
    
    # Crear usuario
    nuevo_usuario = Usuario(
        email=organizador_data.email,
        contraseña=hash_password(organizador_data.contraseña),
        tipo_usuario="organizador",
        activo=True
    )
    db.add(nuevo_usuario)
    db.flush()
    
    # Crear organizador
    nuevo_organizador = Organizador(
        nombre_organizador=organizador_data.nombre_organizador,
        fk_direccion_id=organizador_data.fk_direccion_id,
        fk_usuario_id=nuevo_usuario.id_usuario
    )
    db.add(nuevo_organizador)
    db.commit()
    db.refresh(nuevo_organizador)
    
    return nuevo_organizador


@router.get("/", response_model=list[OrganizadorResponse])
def listar_organizadores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de todos los organizadores."""
    organizadores = db.query(Organizador).offset(skip).limit(limit).all()
    return organizadores


@router.get("/{id_organizador}", response_model=OrganizadorResponse)
def obtener_organizador(
    id_organizador: int,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """Obtener un organizador específico por su ID (solo autenticados)."""
    organizador = db.query(Organizador).filter(Organizador.id_organizador == id_organizador).first()
    
    if not organizador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizador no encontrado"
        )
    
    return organizador


@router.put("/{id_organizador}", response_model=OrganizadorResponse)
def actualizar_organizador(
    id_organizador: int,
    organizador_data: OrganizadorUpdate,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """Actualizar datos de un organizador (solo el organizador autenticado)."""
    payload = current_user["payload"]
    
    # Validar que solo puede actualizar sus propios datos
    if payload.get("id_organizador") != id_organizador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este organizador"
        )
    
    organizador = db.query(Organizador).filter(Organizador.id_organizador == id_organizador).first()
    
    if not organizador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizador no encontrado"
        )
    
    # Validar que la dirección existe si se intenta cambiar
    if organizador_data.fk_direccion_id:
        direccion = db.query(Direccion).filter(Direccion.id_direccion == organizador_data.fk_direccion_id).first()
        if not direccion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dirección no encontrada"
            )
    
    # Si se envía el texto de la dirección, actualizar la dirección existente
    if organizador_data.direccion:
        direccion_actual = organizador.direccion
        if direccion_actual:
            direccion_actual.direccion = organizador_data.direccion
            db.add(direccion_actual)
    
    # Actualizar solo los campos que se envían (excepto 'direccion' que ya manejamos)
    datos = organizador_data.dict(exclude_unset=True, exclude={'direccion'})
    for campo, valor in datos.items():
        setattr(organizador, campo, valor)
    
    db.add(organizador)
    db.commit()
    db.refresh(organizador)
    
    return organizador


@router.delete("/{id_organizador}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_organizador(
    id_organizador: int,
    current_user = Depends(get_current_organizador),
    db: Session = Depends(get_db)
):
    """Eliminar un organizador (solo el organizador autenticado)."""
    payload = current_user["payload"]
    
    # Validar que solo puede eliminar su propia cuenta
    if payload.get("id_organizador") != id_organizador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este organizador"
        )
    
    organizador = db.query(Organizador).filter(Organizador.id_organizador == id_organizador).first()
    
    if not organizador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizador no encontrado"
        )
    
    # También eliminar el usuario asociado
    usuario = db.query(Usuario).filter(Usuario.id_usuario == organizador.fk_usuario_id).first()
    if usuario:
        db.delete(usuario)
    
    db.delete(organizador)
    db.commit()
