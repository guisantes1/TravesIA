from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=False)
    confirmation_token = Column(String, default=lambda: str(uuid.uuid4()))

    rutas = relationship("Ruta", back_populates="usuario")  # Relación con rutas


class Ruta(Base):
    __tablename__ = 'rutas'
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    nombre = Column(String, index=True)
    descripcion = Column(String, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow)  # 🆕 Añadido

    usuario = relationship("User", back_populates="rutas")
    ubicaciones = relationship("Ubicacion", back_populates="ruta")


class Ubicacion(Base):
    __tablename__ = "ubicaciones"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    tipo = Column(String)
    descripcion = Column(Text, nullable=True)
    lat = Column(Float)
    lon = Column(Float)
    fotos = Column(Text)  # JSON string con las URLs
    ruta_id = Column(Integer, ForeignKey("rutas.id"))
    
    ruta = relationship("Ruta", back_populates="ubicaciones")
    opiniones = relationship("Opinion", back_populates="ubicacion", cascade="all, delete")

class Opinion(Base):
    __tablename__ = 'opiniones'
    id = Column(Integer, primary_key=True, index=True)
    ubicacion_id = Column(Integer, ForeignKey('ubicaciones.id'))
    usuario_id = Column(Integer, ForeignKey('users.id'))  # ForeignKey para usuario
    nombre_usuario = Column(String)
    fecha = Column(DateTime, default=datetime.utcnow)
    texto = Column(String)
    fotos = Column(String)  # JSON string con URLs

    ubicacion = relationship("Ubicacion", back_populates="opiniones")
    usuario = relationship("User")  # Relación para acceder al usuario que hizo la opinión

