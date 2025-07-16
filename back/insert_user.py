# insert_user.py
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash
from datetime import datetime

db = SessionLocal()

# Borra si ya existe
db.query(User).filter(User.username == "demo").delete()

# Crea el nuevo
user = User(
    email="demo@demo.com",
    username="demo",
    full_name="User Demo",
    hashed_password=get_password_hash("1234"),
    is_active=True,
    confirmation_token=None,
    created_at=datetime.utcnow()
)

db.add(user)
db.commit()
db.refresh(user)

print("✅ Usuario demo insertado:", user.username)
