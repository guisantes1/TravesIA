import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Construir ruta absoluta a travesia.db dentro del directorio back/
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, '../travesia.db')

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Intentar activar modo WAL (es opcional, pero recomendable)
try:
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
except Exception as e:
    print("⚠️ No se pudo establecer WAL mode:", e)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
