import os
import django
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ------------------------------------------------------------
# Configuração do Django
# ------------------------------------------------------------
# Define o settings module do Django (ajuste conforme o nome real do seu projeto)
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    os.getenv("DJANGO_SETTINGS_MODULE", "app_backend.settings")
)

# Inicializa o Django antes de importar modelos ou routers
django.setup()

# ------------------------------------------------------------
# Inicializa FastAPI
# ------------------------------------------------------------
app = FastAPI(title="Guard API", version="1.0.0")

# ------------------------------------------------------------
# CORS
# ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite
        "http://127.0.0.1:5173",   # Vite com IP
        "http://localhost:3000",   # React CRA (se usar)
        "http://127.0.0.1:3000",   # React CRA com IP
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=None,
    expose_headers=["Access-Control-Allow-Origin"],
)

@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# ------------------------------------------------------------
# Rotas básicas
# ------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ------------------------------------------------------------
# Import tardio dos routers para garantir que Django já esteja setupado
# ------------------------------------------------------------
from auth.routes import router as auth_router  # noqa: E402
from contacts.routes import router as contacts_router  # noqa: E402

# Inclui os routers no FastAPI
app.include_router(auth_router, prefix="")
app.include_router(contacts_router,)

# cria a pasta media se não existir
os.makedirs("media", exist_ok=True)

app.mount("/media", StaticFiles(directory="media"), name="media")