from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum


# ================== ENUMS ==================

class TipoUsuarioEnum(str, Enum):
    jugador = "jugador"
    organizador = "organizador"


class EstadoPagoEnum(str, Enum):
    pendiente = "Pendiente"
    pagado = "Pagado"


class MedioPagoEnum(str, Enum):
    tarjeta = "Tarjeta"
    efectivo = "Efectivo"
    transferencia = "Transferencia"


# ================== USUARIO ==================

class UsuarioCreate(BaseModel):
    email: EmailStr
    contraseña: str = Field(..., min_length=6, description="Contraseña mínimo 6 caracteres")
    tipo_usuario: TipoUsuarioEnum


class UsuarioLogin(BaseModel):
    email: EmailStr
    contraseña: str


class UsuarioResponse(BaseModel):
    id_usuario: int
    email: str
    tipo_usuario: str
    foto_perfil: Optional[str]
    activo: bool
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True


# ================== PAÍS ==================

class PaisCreate(BaseModel):
    nombre_pais: str


class PaisResponse(BaseModel):
    id_pais: int
    nombre_pais: str
    
    class Config:
        from_attributes = True


# ================== CIUDAD ==================

class CiudadCreate(BaseModel):
    nombre_ciudad: str
    fk_pais_id: int


class CiudadResponse(BaseModel):
    id_ciudad: int
    nombre_ciudad: str
    fk_pais_id: int
    
    class Config:
        from_attributes = True


# ================== DIRECCIÓN ==================

class DireccionCreate(BaseModel):
    direccion: str
    fk_ciudad_id: int


class DireccionResponse(BaseModel):
    id_direccion: int
    direccion: str
    fk_ciudad_id: int
    
    class Config:
        from_attributes = True


# ================== JUGADOR ==================

class JugadorCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=50)
    apellido: str = Field(..., min_length=2, max_length=50)
    telefono: str = Field(..., min_length=7, max_length=20)
    fk_direccion_id: int
    # Datos del usuario
    email: EmailStr
    contraseña: str = Field(..., min_length=6, description="Contraseña mínimo 6 caracteres")
    
    @field_validator('nombre', 'apellido')
    @classmethod
    def validate_name(cls, v):
        if not v.isalpha():
            raise ValueError('El nombre solo puede contener letras')
        return v


class JugadorUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    fk_direccion_id: Optional[int] = None
    direccion: Optional[str] = None


class JugadorResponse(BaseModel):
    id_jugador: int
    nombre: str
    apellido: str
    telefono: str
    fk_direccion_id: int
    fk_usuario_id: int
    usuario: UsuarioResponse
    
    class Config:
        from_attributes = True


# ================== ORGANIZADOR ==================

class OrganizadorCreate(BaseModel):
    nombre_organizador: str = Field(..., min_length=2, max_length=100)
    fk_direccion_id: int
    # Datos del usuario
    email: EmailStr
    contraseña: str = Field(..., min_length=6, description="Contraseña mínimo 6 caracteres")


class OrganizadorUpdate(BaseModel):
    nombre_organizador: Optional[str] = None
    fk_direccion_id: Optional[int] = None
    direccion: Optional[str] = None


class OrganizadorResponse(BaseModel):
    id_organizador: int
    nombre_organizador: str
    fk_direccion_id: int
    fk_usuario_id: int
    usuario: UsuarioResponse
    
    class Config:
        from_attributes = True


# ================== TORNEO ==================

class TorneoCreate(BaseModel):
    nombre_torneo: str


class TorneoResponse(BaseModel):
    id_torneo: int
    nombre_torneo: str
    
    class Config:
        from_attributes = True


# ================== TORNEO ORGANIZADOR ==================

class TorneoOrganizadorCreate(BaseModel):
    fk_torneo_id: int
    fecha_torneo: date = Field(..., description="Fecha del torneo (no puede ser en el pasado)")
    costo: float = Field(..., gt=0, description="Costo debe ser mayor a 0")
    fk_ciudad_id: int
    
    @field_validator('fecha_torneo')
    @classmethod
    def validate_fecha(cls, v):
        from datetime import date as date_type
        if v < date_type.today():
            raise ValueError('La fecha del torneo no puede ser en el pasado')
        return v
    
    @field_validator('costo')
    @classmethod
    def validate_costo(cls, v):
        if v <= 0:
            raise ValueError('El costo debe ser mayor a 0')
        if v > 999999:
            raise ValueError('El costo no puede ser tan alto')
        return round(v, 2)


class TorneoOrganizadorResponse(BaseModel):
    id_torneo_organizador: int
    fk_torneo_id: int
    fk_organizador_id: int
    fecha_torneo: date
    costo: float
    fk_ciudad_id: int
    
    class Config:
        from_attributes = True


class TorneoOrganizadorDetalle(BaseModel):
    id_torneo_organizador: int
    torneo: TorneoResponse
    organizador: Optional[OrganizadorResponse] = None
    fecha_torneo: date
    costo: float
    ciudad_nombre: str
    inscripciones_count: int = 0
    limite_jugadores: int = 100
    
    class Config:
        from_attributes = True


# ================== INSCRIPCIÓN TORNEO ORGANIZADOR ==================

class InscripcionCreate(BaseModel):
    fk_torneo_organizador_id: int
    medio_pago: MedioPagoEnum


class InscripcionResponse(BaseModel):
    id_inscripcion: int
    fk_jugador_id: int
    fk_torneo_organizador_id: int
    fecha_inscripcion: datetime
    
    class Config:
        from_attributes = True


class InscripcionConPago(BaseModel):
    id_inscripcion: int
    jugador_nombre: str
    jugador_apellido: str
    telefono: str
    fecha_inscripcion: datetime
    estado_pago: str
    monto: float
    medio_pago: str
    
    class Config:
        from_attributes = True


# ================== PAGO ==================

class PagoCreate(BaseModel):
    fk_inscripcion_id: int
    medio_pago: MedioPagoEnum
    monto: float


class PagoResponse(BaseModel):
    id_pago: int
    fk_inscripcion_id: int
    medio_pago: str
    estado_pago: str
    monto: float
    fecha_pago: datetime
    
    class Config:
        from_attributes = True
