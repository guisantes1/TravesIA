from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/ubicaciones/")
def create_ubicacion(ubicacion: schemas.UbicacionCreate, db: Session = Depends(get_db)):
    db_ubicacion = models.Ubicacion(
        nombre=ubicacion.nombre,
        tipo=ubicacion.tipo,
        descripcion=ubicacion.descripcion,
        lat=ubicacion.lat,
        lon=ubicacion.lon,
        fotos="[]",  # Ajusta si hay fotos
        ruta_id=ubicacion.ruta_id
    )
    db.add(db_ubicacion)
    db.commit()
    db.refresh(db_ubicacion)
    return db_ubicacion

@router.get("/ubicaciones/")
def get_ubicaciones(db: Session = Depends(get_db)):
    return db.query(models.Ubicacion).all()

