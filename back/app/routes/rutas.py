from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/rutas/", response_model=schemas.Ruta)
def create_ruta(ruta: schemas.RutaCreate, db: Session = Depends(get_db)):
    db_ruta = models.Ruta(
        nombre=ruta.nombre,
        descripcion=ruta.descripcion,
        fecha=ruta.fecha,  # 🆕 Añadido
        usuario_id=ruta.usuario_id  # 🆕 Estaba faltando si usas auth
    )
    db.add(db_ruta)
    db.commit()
    db.refresh(db_ruta)
    return db_ruta


@router.get("/rutas/{ruta_id}", response_model=schemas.RutaOut)
def read_ruta(ruta_id: int, db: Session = Depends(get_db)):
    db_ruta = db.query(models.Ruta).filter(models.Ruta.id == ruta_id).first()
    if not db_ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return db_ruta
