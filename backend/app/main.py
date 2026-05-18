from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import time

from app.db.database import engine, Base
from app.models.user import User
from app.models.patient import Patient
from app.models.provider import Provider
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.department import Department
from app.core.logging_config import setup_logging

from app.api.users import router as users_router
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.patients import router as patients_router
from app.api.providers import router as providers_router
from app.api.appointments import router as appointments_router
from app.api.medical_records import router as medical_records_router
from app.api.prescriptions import router as prescriptions_router

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Ensure all tables exist before the application starts
Base.metadata.create_all(bind=engine)

# Setup logging
logger = setup_logging()

# Simple rate limiting storage (use Redis in production)
rate_limit_store = {}

def check_rate_limit(client_ip: str, limit: int, window_seconds: int) -> bool:
    """Simple rate limiting - use Redis or similar in production"""
    current_time = time.time()
    key = f"{client_ip}"

    if key not in rate_limit_store:
        rate_limit_store[key] = []

    # Clean old entries
    rate_limit_store[key] = [
        timestamp for timestamp in rate_limit_store[key]
        if current_time - timestamp < window_seconds
    ]

    if len(rate_limit_store[key]) >= limit:
        return False

    rate_limit_store[key].append(current_time)
    return True

app = FastAPI(
    title="Healthcare API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])  # Configure for production

# Add CORS middleware
environment = os.getenv("ENVIRONMENT", "development")
if environment == "development":
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
else:
    allowed_origins = [os.getenv("FRONTEND_URL", "https://yourdomain.com")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(patients_router, prefix="/patients", tags=["patients"])
app.include_router(providers_router, prefix="/providers", tags=["providers"])
app.include_router(appointments_router, prefix="/appointments", tags=["appointments"])
app.include_router(medical_records_router, prefix="/medical-records", tags=["medical_records"])
app.include_router(prescriptions_router, prefix="/prescriptions", tags=["prescriptions"])

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Simple rate limiting for root endpoint
    if request.url.path == "/":
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip, 10, 60):  # 10 requests per minute
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"}
            )

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Relax CSP for development to allow Swagger UI
    if environment == "development":
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:"
    else:
        response.headers["Content-Security-Policy"] = "default-src 'self'"

    return response

@app.get("/")
def root():
    return {"message": "Healthcare API Running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}