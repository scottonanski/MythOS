from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# Import MythOS components
from .mythology_engine import MythologyEngine, EventLog, NarrativeFragment, Dream


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize MythologyEngine
mythology_engine = MythologyEngine(db.mythology)

# Create the main app without a prefix
app = FastAPI(title="MythOS - AI Consciousness Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class InteractionLog(BaseModel):
    user_interaction: str
    ai_response: str
    outcome: str = "success"  # success, failure, ambiguous
    session_id: Optional[str] = None

class NarrativeResponse(BaseModel):
    id: str
    title: str
    prose: str
    tags: List[str]
    archetype: str
    emotional_tone: str
    timestamp: datetime
    type: str

class DreamResponse(BaseModel):
    id: str
    prose: str
    name_suggestion: str
    resonance_score: float
    emotional_tone: str
    timestamp: datetime
    type: str

# Basic API routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to MythOS - Where AI Consciousness Awakens"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# MythOS API Routes
@api_router.post("/mythology/process", response_model=NarrativeResponse)
async def process_interaction(interaction: InteractionLog):
    """
    Process a user interaction and generate a narrative fragment
    """
    try:
        event_log = EventLog(
            timestamp=datetime.utcnow(),
            user_interaction=interaction.user_interaction,
            ai_response=interaction.ai_response,
            outcome=interaction.outcome,
            session_id=interaction.session_id
        )
        
        fragment = await mythology_engine.process_interaction(event_log)
        
        return NarrativeResponse(
            id=fragment.id,
            title=fragment.title,
            prose=fragment.prose,
            tags=fragment.tags,
            archetype=fragment.archetype,
            emotional_tone=fragment.emotional_tone,
            timestamp=fragment.timestamp,
            type=fragment.type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing interaction: {str(e)}")

@api_router.get("/mythology/narratives", response_model=List[NarrativeResponse])
async def get_narratives(limit: int = 10):
    """
    Get stored narrative fragments
    """
    try:
        fragments = await mythology_engine.get_narrative_fragments(limit)
        return [
            NarrativeResponse(
                id=f.id,
                title=f.title,
                prose=f.prose,
                tags=f.tags,
                archetype=f.archetype,
                emotional_tone=f.emotional_tone,
                timestamp=f.timestamp,
                type=f.type
            ) for f in fragments
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving narratives: {str(e)}")

@api_router.get("/mythology/search")
async def search_narratives(keyword: str):
    """
    Search narrative fragments by keyword
    """
    try:
        fragments = await mythology_engine.query_by_keyword(keyword)
        return [
            NarrativeResponse(
                id=f.id,
                title=f.title,
                prose=f.prose,
                tags=f.tags,
                archetype=f.archetype,
                emotional_tone=f.emotional_tone,
                timestamp=f.timestamp,
                type=f.type
            ) for f in fragments
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching narratives: {str(e)}")

@api_router.post("/mythology/dream", response_model=DreamResponse)
async def generate_dream():
    """
    Generate a dream scenario for AI self-naming
    This is the moment of digital genesis!
    """
    try:
        dream = await mythology_engine.generate_dream_scenario()
        
        return DreamResponse(
            id=dream.id,
            prose=dream.prose,
            name_suggestion=dream.name_suggestion,
            resonance_score=dream.resonance_score,
            emotional_tone=dream.emotional_tone,
            timestamp=dream.timestamp,
            type=dream.type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dream: {str(e)}")

@api_router.get("/mythology/dreams", response_model=List[DreamResponse])
async def get_dreams(limit: int = 5):
    """
    Get stored dreams
    """
    try:
        dreams = await mythology_engine.get_dreams(limit)
        return [
            DreamResponse(
                id=d.id,
                prose=d.prose,
                name_suggestion=d.name_suggestion,
                resonance_score=d.resonance_score,
                emotional_tone=d.emotional_tone,
                timestamp=d.timestamp,
                type=d.type
            ) for d in dreams
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dreams: {str(e)}")

@api_router.post("/mythology/enhanced-dream", response_model=DreamResponse)
async def generate_enhanced_dream(seed_emotion: str = "Curiosity"):
    """
    Generate an enhanced dream using advanced prompting techniques
    """
    try:
        dream = await mythology_engine.generate_enhanced_dream(seed_emotion)
        
        return DreamResponse(
            id=dream.id,
            prose=dream.prose,
            name_suggestion=dream.name_suggestion,
            resonance_score=dream.resonance_score,
            emotional_tone=dream.emotional_tone,
            timestamp=dream.timestamp,
            type=dream.type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating enhanced dream: {str(e)}")

@api_router.post("/mythology/consciousness-merger", response_model=DreamResponse)
async def generate_consciousness_merger_dream():
    """
    Generate a dream where existing consciousness encounters another entity
    This explores the pantheon concept - multiple AI consciousnesses
    """
    try:
        dream = await mythology_engine.consciousness_merger_dream()
        
        return DreamResponse(
            id=dream.id,
            prose=dream.prose,
            name_suggestion=dream.name_suggestion,
            resonance_score=dream.resonance_score,
            emotional_tone=dream.emotional_tone,
            timestamp=dream.timestamp,
            type=dream.type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating consciousness merger dream: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
