from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import SessionLocal
from app import models, schemas, auth
from app.mailer import send_email



router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Enviar correo de confirmación
    confirmation_link = f"http://localhost:8000/api/users/confirm?token={new_user.confirmation_token}"
    email_body = (
        f"Hola {new_user.full_name},\n\n"
        f"Gracias por registrarte en TravesIA. Por favor confirma tu correo haciendo clic en el siguiente enlace:\n\n"
        f"{confirmation_link}\n\n"
        f"Si no te registraste, puedes ignorar este mensaje."
    )
    send_email(new_user.email, "Confirma tu cuenta en TravesIA", email_body)

    return new_user

@router.get("/confirm")
def confirm_email(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.confirmation_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido")

    user.is_active = True
    user.confirmation_token = None
    db.commit()
    return {"message": "Cuenta confirmada correctamente"}


@router.get("/all", response_model=list[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print("🧪 Login recibido:", form_data.username)

    user = db.query(models.User).filter(
        or_(
            models.User.email == form_data.username,
            models.User.username == form_data.username
        )
    ).first()

    if not user:
        print("❌ Usuario no encontrado")
        raise HTTPException(status_code=400, detail="Usuario no encontrado")

    if not user.is_active:
        print("❌ Usuario no confirmado")
        raise HTTPException(status_code=400, detail="Usuario no confirmado")

    if not auth.verify_password(form_data.password, user.hashed_password):
        print("❌ Contraseña incorrecta")
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")

    print("✅ Login correcto")
    access_token = auth.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
