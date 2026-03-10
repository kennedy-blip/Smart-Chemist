import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SmartChemist AI"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    # Updated to the latest 2026 stable model
    GROQ_MODEL: str = "llama-3.3-70b-versatile" 

# Create the instance here
settings = Settings()