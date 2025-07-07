from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, rutas  # Añadido rutas
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
    allow_origins=origins,  # Permite solo el frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas de usuarios y rutas
app.include_router(users.router, prefix="/api/users")
app.include_router(rutas.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Bienvenido a la API de TravesIA"}
