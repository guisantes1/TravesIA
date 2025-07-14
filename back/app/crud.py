from sqlalchemy.orm import Session
from app import models, schemas

def get_ubicacion(db: Session, id: int):
    return db.query(models.Ubicacion).filter(models.Ubicacion.id == id).first()

def update_ubicacion(db: Session, db_ubicacion: models.Ubicacion, datos_update: schemas.UbicacionUpdate):
    for key, value in datos_update.dict().items():
        setattr(db_ubicacion, key, value)
    db.commit()
    db.refresh(db_ubicacion)
    return db_ubicacion
