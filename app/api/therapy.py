from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.groq_client import get_ai_response

router = APIRouter()

class TherapyRequest(BaseModel):
    message: str

@router.post("/session")
async def start_session(request: TherapyRequest):
    try:
        # We explicitly call the 'therapy' mode here
        response = await get_ai_response(request.message, mode="therapy")
        return {"category": "Therapy Session", "data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Therapy Engine Error: {str(e)}")