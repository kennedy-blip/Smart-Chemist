from fastapi import APIRouter, HTTPException
from app.services.groq_client import get_ai_response
from pydantic import BaseModel

router = APIRouter()

class MedicalRequest(BaseModel):
    symptoms: str

@router.post("/analyze")
async def analyze_symptoms(request: MedicalRequest):
    # This calls the Groq engine
    result = await get_ai_response(request.symptoms, mode="medical")
    
    if "Error" in result:
        raise HTTPException(status_code=500, detail=result)
        
    return {"data": result} # This sends the REAL AI response to React