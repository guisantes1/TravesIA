from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, rutas, ubicaciones, opiniones  # Añadido rutas
from app.models import Base
from app.database import engine

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TravesIA Backend")

# Configuración de CORS para permitir el frontend React
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ← prueba abierta
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluir las rutas de usuarios y rutas
app.include_router(users.router, prefix="/api/users")
app.include_router(rutas.router, prefix="/api")
app.include_router(ubicaciones.router, prefix="/api")
app.include_router(opiniones.router, prefix="/api")



@app.get("/")
def root():
    return {"message": "Bienvenido a la API de TravesIA"}

from fastapi.staticfiles import StaticFiles
import os

# Asegúrate de que la carpeta exista
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Montar los archivos estáticos (accesibles vía /static/...)
app.mount("/static", StaticFiles(directory=UPLOAD_FOLDER), name="static")
