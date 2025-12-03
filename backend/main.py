from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.models import Base
import uvicorn

# Crear tablas automáticamente
Base.metadata.create_all(bind=engine)

# Crear aplicación FastAPI
app = FastAPI(
    title="Chess Tournament Management API",
    description="API para la gestión de torneos de ajedrez",
    version="1.0.0"
)

# Configurar CORS
origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar routers después de crear la app
from app.routes import (
    auth,
    jugadores,
    organizadores,
    paises,
    ciudades,
    direcciones,
    torneos,
    torneos_organizadores,
    inscripciones,
    pagos,
    fotos
)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(jugadores.router, prefix="/api/jugadores", tags=["Jugadores"])
app.include_router(organizadores.router, prefix="/api/organizadores", tags=["Organizadores"])
app.include_router(paises.router, prefix="/api/paises", tags=["Países"])
app.include_router(ciudades.router, prefix="/api/ciudades", tags=["Ciudades"])
app.include_router(direcciones.router, prefix="/api/direcciones", tags=["Direcciones"])
app.include_router(torneos.router, prefix="/api/torneos", tags=["Torneos"])
app.include_router(torneos_organizadores.router, prefix="/api/torneos-organizadores", tags=["Torneos Organizadores"])
app.include_router(inscripciones.router, prefix="/api/inscripciones", tags=["Inscripciones"])
app.include_router(pagos.router, prefix="/api/pagos", tags=["Pagos"])
app.include_router(fotos.router, prefix="/api/fotos", tags=["Fotos"])


@app.get("/")
def read_root():
    """Endpoint raíz que devuelve un mensaje de bienvenida."""
    return {
        "mensaje": "Bienvenido a la API de gestión de torneos de ajedrez",
        "documentacion": "/docs",
        "documentacion_alternativa": "/redoc"
    }


@app.get("/health")
def health_check():
    """Verificar el estado de la API."""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
