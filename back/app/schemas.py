from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict
from typing import List, Optional
from datetime import datetime

# -------------------- USER --------------------

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# -------------------- OPINIÓN --------------------

class OpinionBase(BaseModel):
    texto: str
    fotos: Optional[str] = None
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

# -------------------- UBICACIÓN --------------------

class UbicacionBase(BaseModel):
    nombre: str
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    lat: float
    lon: float
    fotos: List[str] = []

class UbicacionCreate(BaseModel):
    nombre: str
    tipo: str
    descripcion: Optional[str] = None
    lat: float
    lon: float
    ruta_id: int


class UbicacionUpdate(BaseModel):
    nombre: str
    tipo: Optional[str] = None
    descripcion: Optional[str] = None

    class Config:
        orm_mode = True


class UbicacionOut(UbicacionBase):
    id: int
    ruta_id: int
    opiniones: List[OpinionOut] = []

    model_config = ConfigDict(from_attributes=True)

# -------------------- RUTA --------------------

class RutaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha: Optional[datetime] = None

class RutaCreate(RutaBase):
    usuario_id: int
    ubicaciones: List[UbicacionCreate] = []

class RutaOut(RutaBase):
    id: int
    usuario_id: int
    ubicaciones: List[UbicacionOut] = []

    model_config = ConfigDict(from_attributes=True)
