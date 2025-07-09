from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str             # Campo obligatorio
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Schema para Opinion
class OpinionBase(BaseModel):
    texto: str
    fotos: Optional[str] = None  # URLs en string JSON posible
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
    tipo: Optional[str] = None

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
    fecha: Optional[datetime] = None

class RutaCreate(RutaBase):
    usuario_id: int

class RutaOut(RutaBase):
    id: int
    usuario_id: int
    ubicaciones: List[UbicacionOut] = []

    model_config = ConfigDict(from_attributes=True)
