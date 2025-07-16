import os
import base64
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud, models
from app.database import get_db
from app.auth import get_current_user

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads", "opiniones")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter()

@router.get("/opiniones/{ubicacion_id}", response_model=List[schemas.OpinionOut])
def get_opiniones(ubicacion_id: int, db: Session = Depends(get_db)):
    return crud.get_opiniones_by_ubicacion(db, ubicacion_id)

@router.post("/opiniones", response_model=schemas.OpinionOut)
def crear_opinion(
    opinion: schemas.OpinionCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    # Primero creamos la opinión en la base de datos (sin foto aún)
    nueva_opinion = crud.create_opinion(db, opinion, user.id, user.username)

    # Guardar imagen si existe
    if opinion.fotos:
        try:
            # tomamos solo la primera imagen
            foto_base64 = json.loads(opinion.fotos)[0]
            ruta_destino = os.path.join(UPLOAD_FOLDER, f"{nueva_opinion.id}.jpg")
            with open(ruta_destino, "wb") as f:
                f.write(base64.b64decode(foto_base64))

            # Actualizamos el campo fotos con la URL accesible desde el frontend
            nueva_opinion.fotos = json.dumps([f"/static/opiniones/{nueva_opinion.id}.jpg"])
            db.commit()
            db.refresh(nueva_opinion)

        except Exception as e:
            print("⚠️ Error al guardar imagen:", str(e))

    return nueva_opinion

@router.delete("/opiniones/{opinion_id}")
def eliminar_opinion(opinion_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_opinion(db, opinion_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Opinión no encontrada")
    return {"ok": True}
