from fastapi import FastAPI, APIRouter, HTTPException, Query
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
import httpx

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

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    company_logo: Optional[str] = None
    location: str
    job_type: str  # CDI, CDD, Freelance, Stage
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    requirements: List[str] = []
    tags: List[str] = []
    posted_date: str
    apply_url: str
    source: str = "Remotely"
    is_remote: bool = True

class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    job_title: str
    company: str
    location: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    apply_url: str
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteCreate(BaseModel):
    job_id: str
    job_title: str
    company: str
    location: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    apply_url: str

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    keywords: str
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    frequency: str = "daily"  # daily, weekly
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class AlertCreate(BaseModel):
    email: str
    keywords: str
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    frequency: str = "daily"

class JobSearchResponse(BaseModel):
    jobs: List[Job]
    total: int
    page: int
    per_page: int

# ============== MOCK DATA ==============

MOCK_JOBS = [
    Job(
        id="1",
        title="Développeur Full Stack React/Node.js",
        company="TechRemote",
        company_logo=None,
        location="France (Remote)",
        job_type="CDI",
        salary_min=45000,
        salary_max=65000,
        description="Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe 100% remote. Vous travaillerez sur des projets innovants avec les dernières technologies.",
        requirements=["3+ ans d'expérience", "React, Node.js", "TypeScript", "MongoDB"],
        tags=["React", "Node.js", "TypeScript", "Remote"],
        posted_date="2026-01-15",
        apply_url="https://example.com/apply/1",
        source="Remotely"
    ),
    Job(
        id="2",
        title="DevOps Engineer",
        company="CloudScale",
        company_logo=None,
        location="Europe (Remote)",
        job_type="CDI",
        salary_min=55000,
        salary_max=80000,
        description="Rejoignez notre équipe DevOps pour automatiser et optimiser notre infrastructure cloud. Travail 100% à distance avec une équipe internationale.",
        requirements=["5+ ans d'expérience", "AWS/GCP", "Kubernetes", "Terraform", "CI/CD"],
        tags=["DevOps", "AWS", "Kubernetes", "Remote"],
        posted_date="2026-01-14",
        apply_url="https://example.com/apply/2",
        source="Remotely"
    ),
    Job(
        id="3",
        title="Product Designer UX/UI",
        company="DesignHub",
        company_logo=None,
        location="Mondial (Remote)",
        job_type="Freelance",
        salary_min=400,
        salary_max=600,
        description="Nous cherchons un designer produit créatif pour concevoir des expériences utilisateur exceptionnelles. Mission longue durée, full remote.",
        requirements=["Portfolio solide", "Figma", "Design System", "User Research"],
        tags=["Design", "UX", "UI", "Figma", "Remote"],
        posted_date="2026-01-13",
        apply_url="https://example.com/apply/3",
        source="Remotely"
    ),
    Job(
        id="4",
        title="Data Scientist Senior",
        company="DataMind",
        company_logo=None,
        location="France (Remote)",
        job_type="CDI",
        salary_min=60000,
        salary_max=90000,
        description="Poste de Data Scientist senior pour développer des modèles ML/AI innovants. Équipe distribuée, culture remote-first.",
        requirements=["5+ ans d'expérience", "Python", "TensorFlow/PyTorch", "SQL", "MLOps"],
        tags=["Data Science", "Python", "ML", "AI", "Remote"],
        posted_date="2026-01-12",
        apply_url="https://example.com/apply/4",
        source="Remotely"
    ),
    Job(
        id="5",
        title="Chef de Projet Digital",
        company="AgileWorks",
        company_logo=None,
        location="Francophone (Remote)",
        job_type="CDI",
        salary_min=50000,
        salary_max=70000,
        description="Pilotez des projets digitaux d'envergure en full remote. Méthodologie Agile, équipe dynamique et projets variés.",
        requirements=["4+ ans de gestion de projet", "Agile/Scrum", "JIRA", "Communication"],
        tags=["Project Management", "Agile", "Scrum", "Remote"],
        posted_date="2026-01-11",
        apply_url="https://example.com/apply/5",
        source="Remotely"
    ),
    Job(
        id="6",
        title="Développeur Backend Python",
        company="PyForge",
        company_logo=None,
        location="Europe (Remote)",
        job_type="CDI",
        salary_min=48000,
        salary_max=68000,
        description="Développez des APIs robustes et scalables avec Python et FastAPI. Environnement technique stimulant, 100% télétravail.",
        requirements=["3+ ans Python", "FastAPI/Django", "PostgreSQL", "Docker"],
        tags=["Python", "FastAPI", "Backend", "Remote"],
        posted_date="2026-01-10",
        apply_url="https://example.com/apply/6",
        source="Remotely"
    ),
    Job(
        id="7",
        title="Customer Success Manager",
        company="SaaSPro",
        company_logo=None,
        location="France (Remote)",
        job_type="CDI",
        salary_min=40000,
        salary_max=55000,
        description="Accompagnez nos clients dans leur succès avec notre solution SaaS. Poste remote avec déplacements occasionnels.",
        requirements=["2+ ans en CSM", "SaaS B2B", "CRM", "Excellent relationnel"],
        tags=["Customer Success", "SaaS", "B2B", "Remote"],
        posted_date="2026-01-09",
        apply_url="https://example.com/apply/7",
        source="Remotely"
    ),
    Job(
        id="8",
        title="Rédacteur Web SEO",
        company="ContentFirst",
        company_logo=None,
        location="Francophone (Remote)",
        job_type="Freelance",
        salary_min=250,
        salary_max=400,
        description="Créez du contenu optimisé SEO de haute qualité. Mission flexible, travail 100% à distance.",
        requirements=["Expérience rédaction web", "SEO", "WordPress", "Créativité"],
        tags=["Content", "SEO", "Writing", "Remote"],
        posted_date="2026-01-08",
        apply_url="https://example.com/apply/8",
        source="Remotely"
    ),
    Job(
        id="9",
        title="Ingénieur QA Automation",
        company="QualityFirst",
        company_logo=None,
        location="Europe (Remote)",
        job_type="CDI",
        salary_min=45000,
        salary_max=65000,
        description="Automatisez les tests et assurez la qualité de nos produits. Stack moderne, équipe agile, full remote.",
        requirements=["3+ ans QA", "Selenium/Playwright", "Python/JS", "CI/CD"],
        tags=["QA", "Automation", "Testing", "Remote"],
        posted_date="2026-01-07",
        apply_url="https://example.com/apply/9",
        source="Remotely"
    ),
    Job(
        id="10",
        title="Développeur Mobile React Native",
        company="MobileFirst",
        company_logo=None,
        location="Mondial (Remote)",
        job_type="CDD",
        salary_min=42000,
        salary_max=58000,
        description="Développez des applications mobiles cross-platform avec React Native. Projet de 12 mois, full remote.",
        requirements=["2+ ans React Native", "iOS/Android", "Redux", "TypeScript"],
        tags=["Mobile", "React Native", "iOS", "Android", "Remote"],
        posted_date="2026-01-06",
        apply_url="https://example.com/apply/10",
        source="Remotely"
    ),
    Job(
        id="11",
        title="Architecte Cloud AWS",
        company="CloudArchitects",
        company_logo=None,
        location="France (Remote)",
        job_type="CDI",
        salary_min=70000,
        salary_max=100000,
        description="Concevez et implémentez des architectures cloud évolutives. Certification AWS requise, poste 100% remote.",
        requirements=["7+ ans d'expérience", "AWS Certified", "Architecture distribuée", "IaC"],
        tags=["Cloud", "AWS", "Architecture", "Remote"],
        posted_date="2026-01-05",
        apply_url="https://example.com/apply/11",
        source="Remotely"
    ),
    Job(
        id="12",
        title="Stage Développeur Frontend",
        company="StartupLab",
        company_logo=None,
        location="France (Remote)",
        job_type="Stage",
        salary_min=800,
        salary_max=1200,
        description="Stage de 6 mois en développement frontend. Encadrement de qualité, projets réels, full remote possible.",
        requirements=["Étudiant Bac+4/5", "HTML/CSS/JS", "React débutant", "Motivation"],
        tags=["Stage", "Frontend", "React", "Remote"],
        posted_date="2026-01-04",
        apply_url="https://example.com/apply/12",
        source="Remotely"
    )
]

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur Remotely API - Recherche d'emploi en télétravail"}

@api_router.get("/jobs", response_model=JobSearchResponse)
async def search_jobs(
    query: str = Query(default="", description="Recherche par mots-clés"),
    job_type: Optional[str] = Query(default=None, description="Type de contrat"),
    location: Optional[str] = Query(default=None, description="Localisation"),
    salary_min: Optional[int] = Query(default=None, description="Salaire minimum"),
    salary_max: Optional[int] = Query(default=None, description="Salaire maximum"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50)
):
    """Recherche d'offres d'emploi avec filtres"""
    filtered_jobs = MOCK_JOBS.copy()
    
    # Filter by query
    if query:
        query_lower = query.lower()
        filtered_jobs = [
            job for job in filtered_jobs
            if query_lower in job.title.lower() 
            or query_lower in job.company.lower()
            or query_lower in job.description.lower()
            or any(query_lower in tag.lower() for tag in job.tags)
        ]
    
    # Filter by job type
    if job_type:
        filtered_jobs = [job for job in filtered_jobs if job.job_type.lower() == job_type.lower()]
    
    # Filter by location
    if location:
        location_lower = location.lower()
        filtered_jobs = [job for job in filtered_jobs if location_lower in job.location.lower()]
    
    # Filter by salary
    if salary_min is not None:
        filtered_jobs = [job for job in filtered_jobs if job.salary_min and job.salary_min >= salary_min]
    
    if salary_max is not None:
        filtered_jobs = [job for job in filtered_jobs if job.salary_max and job.salary_max <= salary_max]
    
    # Pagination
    total = len(filtered_jobs)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_jobs = filtered_jobs[start:end]
    
    return JobSearchResponse(
        jobs=paginated_jobs,
        total=total,
        page=page,
        per_page=per_page
    )

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Récupérer les détails d'une offre d'emploi"""
    for job in MOCK_JOBS:
        if job.id == job_id:
            return job
    raise HTTPException(status_code=404, detail="Offre d'emploi non trouvée")

# ============== FAVORITES ==============

@api_router.get("/favorites", response_model=List[Favorite])
async def get_favorites():
    """Récupérer tous les favoris"""
    favorites = await db.favorites.find({}, {"_id": 0}).to_list(100)
    for fav in favorites:
        if isinstance(fav.get('added_at'), str):
            fav['added_at'] = datetime.fromisoformat(fav['added_at'])
    return favorites

@api_router.post("/favorites", response_model=Favorite)
async def add_favorite(favorite: FavoriteCreate):
    """Ajouter une offre aux favoris"""
    # Check if already exists
    existing = await db.favorites.find_one({"job_id": favorite.job_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Cette offre est déjà dans vos favoris")
    
    fav_obj = Favorite(**favorite.model_dump())
    doc = fav_obj.model_dump()
    doc['added_at'] = doc['added_at'].isoformat()
    
    await db.favorites.insert_one(doc)
    return fav_obj

@api_router.delete("/favorites/{job_id}")
async def remove_favorite(job_id: str):
    """Supprimer une offre des favoris"""
    result = await db.favorites.delete_one({"job_id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouvé")
    return {"message": "Favori supprimé avec succès"}

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
    return {"message": "Alerte supprimée avec succès"}

@api_router.patch("/alerts/{alert_id}/toggle")
async def toggle_alert(alert_id: str):
    """Activer/Désactiver une alerte"""
    alert = await db.alerts.find_one({"id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    
    new_status = not alert.get('is_active', True)
    await db.alerts.update_one({"id": alert_id}, {"$set": {"is_active": new_status}})
    return {"message": f"Alerte {'activée' if new_status else 'désactivée'}", "is_active": new_status}

# ============== STATS ==============

@api_router.get("/stats")
async def get_stats():
    """Statistiques du dashboard"""
    favorites_count = await db.favorites.count_documents({})
    alerts_count = await db.alerts.count_documents({"is_active": True})
    
    return {
        "total_jobs": len(MOCK_JOBS),
        "favorites_count": favorites_count,
        "active_alerts": alerts_count,
        "job_types": {
            "CDI": len([j for j in MOCK_JOBS if j.job_type == "CDI"]),
            "CDD": len([j for j in MOCK_JOBS if j.job_type == "CDD"]),
            "Freelance": len([j for j in MOCK_JOBS if j.job_type == "Freelance"]),
            "Stage": len([j for j in MOCK_JOBS if j.job_type == "Stage"])
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
