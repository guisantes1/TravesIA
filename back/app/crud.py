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



def get_opiniones_by_ubicacion(db: Session, ubicacion_id: int):
    return db.query(models.Opinion).filter(models.Opinion.ubicacion_id == ubicacion_id).all()

def create_opinion(db: Session, opinion: schemas.OpinionCreate, user_id: int, username: str):
    db_opinion = models.Opinion(
        ubicacion_id=opinion.ubicacion_id,
        texto=opinion.texto,
        fotos=opinion.fotos,
        usuario_id=user_id,
        nombre_usuario=username
    )
    db.add(db_opinion)
    db.commit()
    db.refresh(db_opinion)
    return db_opinion

def delete_opinion(db: Session, opinion_id: int):
    db_opinion = db.query(models.Opinion).filter(models.Opinion.id == opinion_id).first()
    if db_opinion:
        db.delete(db_opinion)
        db.commit()
    return db_opinion
