from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

# Statuts de candidature
STATUSES = ["À postuler", "Postulé", "Entretien", "Offre", "Accepté", "Refusé", "Archivé"]

class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    company_logo: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None  # CDI, CDD, Freelance, Stage
    salary: Optional[str] = None
    description: Optional[str] = None
    url: str
    source: str = "manual"  # linkedin, indeed, wttj, remoteok, manual
    status: str = "À postuler"
    notes: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    applied_at: Optional[datetime] = None
    interview_date: Optional[datetime] = None

class JobApplicationCreate(BaseModel):
    title: str
    company: str
    company_logo: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    url: str
    source: str = "manual"
    status: str = "À postuler"
    notes: Optional[str] = None
    tags: List[str] = []

class JobApplicationUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    company_logo: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    applied_at: Optional[str] = None
    interview_date: Optional[str] = None

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    keywords: str
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    frequency: str = "daily"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class AlertCreate(BaseModel):
    email: str
    keywords: str
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    frequency: str = "daily"

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Remotely API - Suivi de candidatures télétravail"}

@api_router.get("/download/extension")
async def download_extension():
    """Télécharger l'extension Chrome"""
    file_path = ROOT_DIR / "static" / "remotely-extension.zip"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Extension non trouvée")
    return FileResponse(
        path=file_path,
        filename="remotely-extension.zip",
        media_type="application/zip"
    )

# ============== JOB APPLICATIONS ==============

@api_router.get("/applications", response_model=List[JobApplication])
async def get_applications(
    status: Optional[str] = Query(default=None, description="Filtrer par statut"),
    source: Optional[str] = Query(default=None, description="Filtrer par source"),
    search: Optional[str] = Query(default=None, description="Recherche par titre/entreprise")
):
    """Récupérer toutes les candidatures"""
    query = {}
    
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}}
        ]
    
    applications = await db.applications.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    for app in applications:
        if isinstance(app.get('created_at'), str):
            app['created_at'] = datetime.fromisoformat(app['created_at'])
        if isinstance(app.get('updated_at'), str):
            app['updated_at'] = datetime.fromisoformat(app['updated_at'])
        if app.get('applied_at') and isinstance(app['applied_at'], str):
            app['applied_at'] = datetime.fromisoformat(app['applied_at'])
        if app.get('interview_date') and isinstance(app['interview_date'], str):
            app['interview_date'] = datetime.fromisoformat(app['interview_date'])
    
    return applications

@api_router.get("/applications/{app_id}", response_model=JobApplication)
async def get_application(app_id: str):
    """Récupérer une candidature par ID"""
    application = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    if isinstance(application.get('created_at'), str):
        application['created_at'] = datetime.fromisoformat(application['created_at'])
    if isinstance(application.get('updated_at'), str):
        application['updated_at'] = datetime.fromisoformat(application['updated_at'])
    
    return application

@api_router.post("/applications", response_model=JobApplication)
async def create_application(app_data: JobApplicationCreate):
    """Créer une nouvelle candidature (depuis l'extension ou manuellement)"""
    # Check if URL already exists
    existing = await db.applications.find_one({"url": app_data.url}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Cette offre est déjà dans votre liste")
    
    app_obj = JobApplication(**app_data.model_dump())
    doc = app_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('applied_at'):
        doc['applied_at'] = doc['applied_at'].isoformat()
    if doc.get('interview_date'):
        doc['interview_date'] = doc['interview_date'].isoformat()
    
    await db.applications.insert_one(doc)
    return app_obj

@api_router.put("/applications/{app_id}", response_model=JobApplication)
async def update_application(app_id: str, update_data: JobApplicationUpdate):
    """Mettre à jour une candidature"""
    application = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Handle status change to "Postulé" - set applied_at date
    if update_dict.get('status') == 'Postulé' and not application.get('applied_at'):
        update_dict['applied_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.applications.update_one({"id": app_id}, {"$set": update_dict})
    
    updated = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    if updated.get('applied_at') and isinstance(updated['applied_at'], str):
        updated['applied_at'] = datetime.fromisoformat(updated['applied_at'])
    
    return updated

@api_router.patch("/applications/{app_id}/status")
async def update_application_status(app_id: str, status: str = Query(...)):
    """Changer le statut d'une candidature"""
    if status not in STATUSES:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs acceptées: {STATUSES}")
    
    application = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    update_dict = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Set applied_at when status changes to "Postulé"
    if status == 'Postulé' and not application.get('applied_at'):
        update_dict['applied_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.applications.update_one({"id": app_id}, {"$set": update_dict})
    
    return {"message": f"Statut mis à jour: {status}", "status": status}

@api_router.delete("/applications/{app_id}")
async def delete_application(app_id: str):
    """Supprimer une candidature"""
    result = await db.applications.delete_one({"id": app_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return {"message": "Candidature supprimée"}

# ============== STATS ==============

@api_router.get("/stats")
async def get_stats():
    """Statistiques du dashboard"""
    total = await db.applications.count_documents({})
    
    # Count by status
    status_counts = {}
    for status in STATUSES:
        count = await db.applications.count_documents({"status": status})
        status_counts[status] = count
    
    # Count by source
    sources = ["linkedin", "indeed", "wttj", "remoteok", "manual", "other"]
    source_counts = {}
    for source in sources:
        count = await db.applications.count_documents({"source": source})
        source_counts[source] = count
    
    # Recent applications (last 7 days)
    from datetime import timedelta
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent = await db.applications.count_documents({
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "total": total,
        "by_status": status_counts,
        "by_source": source_counts,
        "recent_7_days": recent,
        "active_applications": status_counts.get("À postuler", 0) + status_counts.get("Postulé", 0) + status_counts.get("Entretien", 0)
    }

# ============== ALERTS ==============

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts():
    """Récupérer toutes les alertes"""
    alerts = await db.alerts.find({}, {"_id": 0}).to_list(100)
    for alert in alerts:
        if isinstance(alert.get('created_at'), str):
            alert['created_at'] = datetime.fromisoformat(alert['created_at'])
    return alerts

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate):
    """Créer une nouvelle alerte email"""
    alert_obj = Alert(**alert.model_dump())
    doc = alert_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.alerts.insert_one(doc)
    return alert_obj

@api_router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    """Supprimer une alerte"""
    result = await db.alerts.delete_one({"id": alert_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    return {"message": "Alerte supprimée"}

@api_router.patch("/alerts/{alert_id}/toggle")
async def toggle_alert(alert_id: str):
    """Activer/Désactiver une alerte"""
    alert = await db.alerts.find_one({"id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    
    new_status = not alert.get('is_active', True)
    await db.alerts.update_one({"id": alert_id}, {"$set": {"is_active": new_status}})
    return {"message": f"Alerte {'activée' if new_status else 'désactivée'}", "is_active": new_status}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow extension to connect
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
