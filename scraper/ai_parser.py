"""
Uses OpenAI GPT-4o to extract structured competition data from raw HTML/text.
"""
import json
import os
from datetime import datetime
from typing import Optional

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore

from models import Competition, Category

SYSTEM_PROMPT = """
You are a data extraction assistant. Given raw HTML or text from a competition/hackathon/grant page,
extract structured information and respond ONLY with valid JSON matching this schema:

{
  "title": "string",
  "organization": "string",
  "description": "string (2-3 sentences summarizing the competition)",
  "category": "TUBITAK | HACKATHON | STARTUP | AI_ML | DESIGN | OTHER",
  "reward": "string (number only, e.g. '10000') or null",
  "currency": "USD | EUR | TRY | GBP or null",
  "deadline": "ISO 8601 date string or null",
  "application_url": "URL string or null",
  "source_url": "URL string",
  "country": "string or 'International'",
  "tags": ["array", "of", "relevant", "tags"]
}

Rules:
- deadline must be a future date if parseable, else null
- reward is just the numeric amount as string, no currency symbols
- tags should be lowercase, relevant keywords (max 6)
- category must match the enum exactly
"""


def parse_with_ai(raw_text: str, source_url: str) -> Optional[Competition]:
    if OpenAI is None:
        print("openai package not installed. pip install openai")
        return None

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")

    client = OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Source URL: {source_url}\n\nContent:\n{raw_text[:8000]}",
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        data = json.loads(response.choices[0].message.content)
        data["source_url"] = source_url

        if data.get("deadline"):
            try:
                data["deadline"] = datetime.fromisoformat(data["deadline"].replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                data["deadline"] = None

        return Competition(**data)

    except Exception as e:
        print(f"AI parsing error for {source_url}: {e}")
        return None
