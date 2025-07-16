from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/opiniones",
    tags=["opiniones"]
)

@router.get("/{ubicacion_id}", response_model=List[schemas.OpinionOut])
def get_opiniones(ubicacion_id: int, db: Session = Depends(get_db)):
    return crud.get_opiniones_by_ubicacion(db, ubicacion_id)

@router.post("/", response_model=schemas.OpinionOut)
def crear_opinion(opinion: schemas.OpinionCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return crud.create_opinion(db, opinion, user.id, user.username)

@router.delete("/{opinion_id}")
def eliminar_opinion(opinion_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_opinion(db, opinion_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Opinión no encontrada")
    return {"ok": True}
