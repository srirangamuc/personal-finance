import tempfile
from typing import List
import fitz
import httpx
from dotenv import load_dotenv
import os
import json

load_dotenv()

GROQ_API_KEY=os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-8b-8192"

def extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    return "\n".join(page.get_text() for page in doc)

async def parse_and_categorize_with_groq(text: str) -> List[dict]:
    prompt = (
        "You are a smart finance assistant. Given a raw POS receipt text, extract the **total amount spent** on that receipt.\n"
        "Return a JSON object with:\n"
        "- amount (float): the total amount spent\n"
        "- date (today's date as YYYY-MM-DD)\n"
        "- suggested_category (string): suggest one category for the overall receipt.\n\n"
        "The suggested_category must be one of the following:\n"
        "- \"Food & Dining\"\n"
        "- \"Transportation\"\n"
        "- \"Shopping\"\n"
        "- \"Entertainment\"\n"
        "- \"Bills & Utilities\"\n"
        "- \"Healthcare\"\n\n"
        "Only return valid JSON. Example:\n"
        "{\n"
        "  \"amount\": 432.50,\n"
        "  \"date\": \"2025-08-01\",\n"
        "  \"suggested_category\": \"Food & Dining\"\n"
        "}"
    )    
    messages = [
        {"role":"system","content":prompt},
        {"role":"user","content":f"Receipt Text:\n{text.strip()}"}
    ]
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Authorization":f"Bearer {GROQ_API_KEY}",
                "Content-Type":"application/json",
            },
            json={
                "model":GROQ_MODEL,
                "messages":messages,
                "temperature":0.2,
            },
            timeout=30
        )
    data = response.json()
    import re
    reply = data["choices"][0]["message"]["content"]
    try:
        # Extract JSON block from reply
        match = re.search(r"{[\s\S]*}", reply)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        else:
            raise ValueError("No JSON found in Groq reply. Got:\n" + reply)
    except Exception:
        raise ValueError("Groq returned an invalid JSON. Got:\n" + reply)

async def process_receipt(file) -> List[dict]:
    with tempfile.NamedTemporaryFile(delete=False,suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp.flush()
        text = extract_text_from_pdf(tmp.name)
    
    return await parse_and_categorize_with_groq(text)