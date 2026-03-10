import groq
from app.core.config import settings
from app.templates.prompts import MEDICAL_SYSTEM_PROMPT, THERAPY_SYSTEM_PROMPT

# 1. Initialize the client
client = groq.Groq(api_key=settings.GROQ_API_KEY)

async def get_ai_response(user_input: str, mode: str):
    # 2. Pick the instruction template
    system_prompt = MEDICAL_SYSTEM_PROMPT if mode == "medical" else THERAPY_SYSTEM_PROMPT
    
    try:
        # 3. CALL THE API (This is the step you might be missing or misconfiguring)
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input},
            ],
            model=settings.GROQ_MODEL,
        )

        # 4. EXTRACT THE MESSAGE (Don't return the system_prompt variable!)
        ai_response_text = chat_completion.choices[0].message.content
        return ai_response_text

    except Exception as e:
        return f"AI Engine Error: {str(e)}"