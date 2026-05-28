from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, HttpUrl


class Category(str, Enum):
    TUBITAK = "TUBITAK"
    HACKATHON = "HACKATHON"
    STARTUP = "STARTUP"
    AI_ML = "AI_ML"
    DESIGN = "DESIGN"
    OTHER = "OTHER"


class Competition(BaseModel):
    title: str
    organization: str
    description: str
    category: Category = Category.OTHER
    reward: Optional[str] = None
    currency: Optional[str] = "USD"
    deadline: Optional[datetime] = None
    application_url: Optional[str] = None
    source_url: str
    country: Optional[str] = "International"
    tags: list[str] = []
    is_active: bool = True
