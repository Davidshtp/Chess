"""
Excepciones personalizadas para la API.
"""

from fastapi import HTTPException, status


class EmailYaExiste(HTTPException):
    """El email ya está registrado"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este email ya está registrado. Usa otro email o inicia sesión."
        )


class FechaPasada(HTTPException):
    """La fecha no puede ser en el pasado"""
    def __init__(self, campo: str = "fecha"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La {campo} no puede ser en el pasado"
        )


class CostoInvalido(HTTPException):
    """El costo debe ser mayor a 0"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El costo debe ser mayor a 0"
        )


class TorneoLleno(HTTPException):
    """El torneo ha alcanzado el límite de jugadores"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este torneo ha alcanzado el límite de jugadores inscritos"
        )


class YaInscrito(HTTPException):
    """El jugador ya está inscrito en este torneo"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya estás inscrito en este torneo"
        )


class TorneoNoEncontrado(HTTPException):
    """El torneo no existe"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El torneo no fue encontrado"
        )


class JugadorNoEncontrado(HTTPException):
    """El jugador no existe"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El jugador no fue encontrado"
        )


class UsuarioNoEncontrado(HTTPException):
    """El usuario no existe"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no fue encontrado"
        )


class AccesoDenegado(HTTPException):
    """El usuario no tiene permiso para esta operación"""
    def __init__(self, detail: str = "No tienes permiso para realizar esta operación"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class DatosInvalidos(HTTPException):
    """Los datos proporcionados son inválidos"""
    def __init__(self, detail: str = "Los datos proporcionados no son válidos"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )
