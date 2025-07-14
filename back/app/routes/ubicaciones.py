from fastapi import APIRouter, Depends, Query, HTTPException, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, crud

router = APIRouter()

@router.post("/ubicaciones/")
def create_ubicacion(ubicacion: schemas.UbicacionCreate, db: Session = Depends(get_db)):
    db_ubicacion = models.Ubicacion(
        nombre=ubicacion.nombre,
        tipo=ubicacion.tipo,
        descripcion=ubicacion.descripcion,
        lat=ubicacion.lat,
        lon=ubicacion.lon,
        fotos="[]",
        ruta_id=ubicacion.ruta_id
    )
    db.add(db_ubicacion)
    db.commit()
    db.refresh(db_ubicacion)
    return db_ubicacion

@router.get("/ubicaciones/")
def get_ubicaciones(ruta_id: int = Query(None), db: Session = Depends(get_db)):
    if ruta_id is not None:
        return db.query(models.Ubicacion).filter(models.Ubicacion.ruta_id == ruta_id).all()
    return db.query(models.Ubicacion).all()

from fastapi import HTTPException

@router.post("/ubicaciones/lote/")
def create_ubicaciones_lote(ubicaciones: list[schemas.UbicacionCreate], db: Session = Depends(get_db)):
    try:
        print(f"📥 Recibidas {len(ubicaciones)} ubicaciones:")
        objs = []
        for ubicacion in ubicaciones:
            print(f" - {ubicacion.nombre} ({ubicacion.lat}, {ubicacion.lon})")
            objs.append(models.Ubicacion(
                nombre=ubicacion.nombre,
                tipo=ubicacion.tipo or "otro",
                descripcion=ubicacion.descripcion or "",
                lat=ubicacion.lat,
                lon=ubicacion.lon,
                fotos="[]",
                ruta_id=ubicacion.ruta_id
            ))
        for obj in objs:
            db.add(obj)
        db.commit()
        return {"insertados": len(objs)}
    except Exception as e:
        db.rollback()
        print("❌ Error al insertar lote:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/ubicaciones/{id}")
def actualizar_ubicacion(id: int, ubicacion: schemas.UbicacionUpdate, db: Session = Depends(get_db)):
    db_ubicacion = crud.get_ubicacion(db, id=id)
    if not db_ubicacion:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    return crud.update_ubicacion(db, db_ubicacion, ubicacion)

@router.delete("/ubicaciones/{id}")
def delete_ubicacion(id: int = Path(...), db: Session = Depends(get_db)):
    ubicacion = db.query(models.Ubicacion).filter(models.Ubicacion.id == id).first()
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")

    db.delete(ubicacion)
    db.commit()
    return {"ok": True, "msg": "Ubicación eliminada"}



