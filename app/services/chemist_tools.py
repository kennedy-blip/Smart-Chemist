def calculate_bmi(weight_kg: float, height_m: float):
    """A precise tool the bot can use instead of hallucinating math."""
    try:
        bmi = weight_kg / (height_m ** 2)
        return round(bmi, 2)
    except ZeroDivisionError:
        return None

def emergency_check(text: str):
    """Check for high-risk keywords to trigger immediate hospital advice."""
    critical_words = ["heart attack", "suicide", "bleeding", "unconscious"]
    return any(word in text.lower() for word in critical_words)