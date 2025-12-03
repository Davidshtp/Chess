from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Usuario
from app.security import get_current_user_from_header
from app.cloudinary_service import upload_profile_image, delete_profile_image

router = APIRouter()


@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """
    Subir foto de perfil a Cloudinary.
    Solo el usuario autenticado puede subir su propia foto.
    """
    payload = current_user["payload"]
    usuario_id = payload.get("id_usuario")
    
    # Obtener usuario
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Validar tipo de archivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen"
        )
    
    # Validar tamaño (máx 5MB)
    file.file.seek(0, 2)  # Ir al final
    file_size = file.file.tell()
    file.file.seek(0)  # Volver al inicio
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La imagen debe ser menor a 5MB"
        )
    
    # Eliminar foto anterior si existe
    if usuario.foto_perfil:
        delete_profile_image(usuario.foto_perfil)
    
    # Subir nueva foto
    foto_url = upload_profile_image(file)
    
    # Guardar URL en BD
    usuario.foto_perfil = foto_url
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    return {
        "mensaje": "Foto de perfil actualizada",
        "foto_url": foto_url,
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "foto_perfil": usuario.foto_perfil
        }
    }


@router.delete("/profile-picture")
async def delete_profile_picture(
    current_user = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """
    Eliminar foto de perfil.
    Solo el usuario autenticado puede eliminar su propia foto.
    """
    payload = current_user["payload"]
    usuario_id = payload.get("id_usuario")
    
    # Obtener usuario
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if not usuario.foto_perfil:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no tiene foto de perfil"
        )
    
    # Eliminar de Cloudinary
    delete_profile_image(usuario.foto_perfil)
    
    # Limpiar en BD
    usuario.foto_perfil = None
    db.add(usuario)
    db.commit()
    
    return {
        "mensaje": "Foto de perfil eliminada",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "foto_perfil": None
        }
    }
