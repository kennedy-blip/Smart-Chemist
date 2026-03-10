import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import medical, therapy

app = FastAPI(
    title="SmartChemist API",
    description="Medical Diagnostic and Therapy AI Engine powered by Groq",
    version="1.0.0"
)

# --- 1. CONFIGURE CORS ---
# This allows your React frontend (hosted on Render or Vercel) 
# to communicate with this API without being blocked.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For tighter security, replace "*" with your frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. INCLUDE ROUTERS ---
# Prefixing with v1 is standard practice for Data Science APIs
app.include_router(medical.router, prefix="/api/v1/medical", tags=["Medical"])
app.include_router(therapy.router, prefix="/api/v1/therapy", tags=["Therapy"])

# --- 3. HEALTH CHECK ENDPOINT ---
@app.get("/")
async def root():
    return {
        "status": "online",
        "project": "SmartChemist",
        "author": "Kennedy Mokaya",
        "engine": "Llama 3.3 via Groq"
    }

# --- 4. RENDER DEPLOYMENT CONFIG ---
if __name__ == "__main__":
    import uvicorn
    # Render provides a $PORT environment variable
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)