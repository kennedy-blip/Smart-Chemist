import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import medical, therapy

# Initialize the FastAPI app
app = FastAPI(
    title="SmartChemist AI Hub",
    description="A dual-engine AI for Medical Analysis and Mental Health Support.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers we created in the /api folder
app.include_router(medical.router, prefix="/api/v1/medical", tags=["Medical Engine"])
app.include_router(therapy.router, prefix="/api/v1/therapy", tags=["Therapy Engine"])

# Global Exception Handler for a cleaner API experience
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An internal error occurred", "details": str(exc)},
    )

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "SmartChemist",
        "endpoints": {
            "medical": "/api/v1/medical/analyze",
            "therapy": "/api/v1/therapy/session"
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Use the PORT environment variable if available (required for Render)
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)