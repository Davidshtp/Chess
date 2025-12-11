from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, Date, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class TipoUsuario(str, enum.Enum):
    jugador = "jugador"
    organizador = "organizador"


class EstadoPago(str, enum.Enum):
    pendiente = "Pendiente"
    pagado = "Pagado"


class MedioPago(str, enum.Enum):
    tarjeta = "Tarjeta"
    efectivo = "Efectivo"
    transferencia = "Transferencia"


class Usuario(Base):
    __tablename__ = "usuario"
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    contraseña = Column(String(255), nullable=False)
    tipo_usuario = Column(Enum(TipoUsuario), nullable=False)
    foto_perfil = Column(String(255), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    activo = Column(Boolean, default=True)
    
    # Relaciones
    jugador = relationship("Jugador", back_populates="usuario", uselist=False)
    organizador = relationship("Organizador", back_populates="usuario", uselist=False)


class Pais(Base):
    __tablename__ = "pais"
    
    id_pais = Column(Integer, primary_key=True, index=True)
    nombre_pais = Column(String(50), nullable=False, unique=True)
    
    # Relaciones
    ciudades = relationship("Ciudad", back_populates="pais")


class Ciudad(Base):
    __tablename__ = "ciudad"
    
    id_ciudad = Column(Integer, primary_key=True, index=True)
    nombre_ciudad = Column(String(50), nullable=False)
    fk_pais_id = Column(Integer, ForeignKey("pais.id_pais"), nullable=False)
    
    # Relaciones
    pais = relationship("Pais", back_populates="ciudades")
    direcciones = relationship("Direccion", back_populates="ciudad")
    torneos_organizadores = relationship("TorneoOrganizador", back_populates="ciudad")


class Direccion(Base):
    __tablename__ = "direccion"
    
    id_direccion = Column(Integer, primary_key=True, index=True)
    direccion = Column(String(100), nullable=False)
    fk_ciudad_id = Column(Integer, ForeignKey("ciudad.id_ciudad"), nullable=False)
    
    # Relaciones
    ciudad = relationship("Ciudad", back_populates="direcciones")
    jugadores = relationship("Jugador", back_populates="direccion")
    organizadores = relationship("Organizador", back_populates="direccion")


class Jugador(Base):
    __tablename__ = "jugador"
    
    id_jugador = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    telefono = Column(String(20), nullable=False)
    fk_direccion_id = Column(Integer, ForeignKey("direccion.id_direccion"), nullable=False)
    fk_usuario_id = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False, unique=True)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="jugador")
    direccion = relationship("Direccion", back_populates="jugadores")
    inscripciones = relationship("Inscripcion", back_populates="jugador")


class Organizador(Base):
    __tablename__ = "organizador"
    
    id_organizador = Column(Integer, primary_key=True, index=True)
    nombre_organizador = Column(String(100), nullable=False)
    fk_direccion_id = Column(Integer, ForeignKey("direccion.id_direccion"), nullable=False)
    fk_usuario_id = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False, unique=True)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="organizador")
    direccion = relationship("Direccion", back_populates="organizadores")
    torneos_organizadores = relationship("TorneoOrganizador", back_populates="organizador")


class Torneo(Base):
    __tablename__ = "torneo"
    
    id_torneo = Column(Integer, primary_key=True, index=True)
    nombre_torneo = Column(String(100), nullable=False, unique=True)
    
    # Relaciones
    torneos_organizadores = relationship("TorneoOrganizador", back_populates="torneo")


class TorneoOrganizador(Base):
    __tablename__ = "torneo_organizador"
    
    id_torneo_organizador = Column(Integer, primary_key=True, index=True)
    fk_torneo_id = Column(Integer, ForeignKey("torneo.id_torneo"), nullable=False)
    fk_organizador_id = Column(Integer, ForeignKey("organizador.id_organizador"), nullable=False)
    fecha_torneo = Column(Date, nullable=False)
    costo = Column(Numeric(10, 2), nullable=False)
    fk_ciudad_id = Column(Integer, ForeignKey("ciudad.id_ciudad"), nullable=False)
    
    # Relaciones
    torneo = relationship("Torneo", back_populates="torneos_organizadores")
    organizador = relationship("Organizador", back_populates="torneos_organizadores")
    ciudad = relationship("Ciudad", back_populates="torneos_organizadores")
    inscripciones_torneo = relationship("InscripcionTorneoOrganizador", back_populates="torneo_organizador")


class Inscripcion(Base):
    __tablename__ = "inscripcion"
    
    id_inscripcion = Column(Integer, primary_key=True, index=True)
    fk_jugador_id = Column(Integer, ForeignKey("jugador.id_jugador"), nullable=False)
    fk_pago_id = Column(Integer, ForeignKey("pago.id_pago"), nullable=True)
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    jugador = relationship("Jugador", back_populates="inscripciones")
    pago = relationship("Pago", uselist=False, cascade="all, delete-orphan", foreign_keys=[fk_pago_id], single_parent=True)
    torneos = relationship("InscripcionTorneoOrganizador", back_populates="inscripcion", cascade="all, delete-orphan")


class InscripcionTorneoOrganizador(Base):
    __tablename__ = "inscripcion_torneo_organizador"
    
    id_inscripcion_relacion = Column(Integer, primary_key=True, index=True)
    fk_inscripcion_id = Column(Integer, ForeignKey("inscripcion.id_inscripcion"), nullable=False)
    fk_torneo_organizador_id = Column(Integer, ForeignKey("torneo_organizador.id_torneo_organizador"), nullable=False)
    
    # Relaciones
    inscripcion = relationship("Inscripcion", back_populates="torneos")
    torneo_organizador = relationship("TorneoOrganizador", back_populates="inscripciones_torneo")


class Pago(Base):
    __tablename__ = "pago"
    
    id_pago = Column(Integer, primary_key=True, index=True)
    medio_pago = Column(Enum(MedioPago), nullable=False)
    estado_pago = Column(Enum(EstadoPago), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    fecha_pago = Column(DateTime, default=datetime.utcnow)
