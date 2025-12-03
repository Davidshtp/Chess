"""
Servicio para manejar subida de archivos a Cloudinary.
"""

import cloudinary
import cloudinary.uploader
import os
from fastapi import HTTPException, status

# Configurar Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


def upload_profile_image(file) -> str:
    """
    Subir imagen de perfil a Cloudinary.
    Retorna la URL de la imagen.
    """
    try:
        # Validar que se tienen las credenciales
        if not all([
            os.getenv("CLOUDINARY_CLOUD_NAME"),
            os.getenv("CLOUDINARY_API_KEY"),
            os.getenv("CLOUDINARY_API_SECRET")
        ]):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cloudinary no está configurado"
            )
        
        # Subir archivo a Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="chess-app/profile-pictures",
            resource_type="auto",
            quality="auto",
            fetch_format="auto"
        )
        
        return result.get("secure_url")
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al subir imagen: {str(e)}"
        )


def delete_profile_image(image_url: str) -> bool:
    """
    Eliminar imagen de Cloudinary por su URL.
    """
    try:
        if not image_url:
            return False
        
        # Extraer el public_id de la URL
        # Formato: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].ext
        # Ejemplo: https://res.cloudinary.com/dh2dq18lb/image/upload/v1234567890/chess-app/profile-pictures/abc123.jpg
        
        # Obtener la parte después de /upload/
        if "/upload/" in image_url:
            parts = image_url.split("/upload/")
            path = parts[1]  # Obtener: v1234567890/chess-app/profile-pictures/abc123.jpg
            
            # Remover la versión (v1234567890/)
            if path.startswith("v"):
                path = "/".join(path.split("/")[1:])  # chess-app/profile-pictures/abc123.jpg
            
            # Remover extensión
            public_id = ".".join(path.split(".")[:-1])  # chess-app/profile-pictures/abc123
            
            # Eliminar de Cloudinary
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        
        return False
    
    except Exception as e:
        print(f"Error al eliminar imagen: {str(e)}")
        return False
