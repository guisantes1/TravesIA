from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    username: str             # Añade este campo obligatorio
    password: str
    full_name: str | None = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str  # Añadido
    full_name: str | None

class Config:
    orm_mode = True


class UserLogin(BaseModel):
    username: str  # Cambiado de email a username para login
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class UserLogin(BaseModel):
    username: str  # Cambiado de email a username para login
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Schema para Opinion
class OpinionBase(BaseModel):
    texto: str
    fotos: Optional[str] = None  # Podrías usar JSON str con URLs
    fecha: Optional[datetime] = None

class OpinionCreate(OpinionBase):
    ubicacion_id: int
    usuario_id: int
    nombre_usuario: str

class OpinionOut(OpinionBase):
    id: int
    ubicacion_id: int
    usuario_id: int
    nombre_usuario: str
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)

# Schema para Ubicacion
class UbicacionBase(BaseModel):
    nombre: str
    lat: float
    lon: float
    tipo: Optional[str] = None  # tipo waypoint (peak, collado, río...)

class UbicacionCreate(UbicacionBase):
    ruta_id: int

class UbicacionOut(UbicacionBase):
    id: int
    ruta_id: int
    opiniones: List[OpinionOut] = []

    model_config = ConfigDict(from_attributes=True)

# Schema para Ruta
class RutaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha: Optional[datetime] = None  # 🆕

class RutaCreate(RutaBase):
    usuario_id: int

class RutaOut(RutaBase):
    id: int
    usuario_id: int
    ubicaciones: List[UbicacionOut] = []

    model_config = ConfigDict(from_attributes=True)
