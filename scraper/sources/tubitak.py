"""
Scraper for TÜBİTAK announcement pages.
"""
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional

from models import Competition, Category

BASE_URL = "https://www.tubitak.gov.tr"
PROGRAMS = [
    {
        "url": "https://www.tubitak.gov.tr/tr/burslar/lisans/burs-programlari/icerik-2209-universite-ogrencileri-arastirma-projeleri-destekleme-programi",
        "title": "TÜBİTAK 2209-A",
        "organization": "TÜBİTAK",
        "category": Category.TUBITAK,
        "tags": ["research", "undergraduate", "tubitak"],
    },
    {
        "url": "https://www.tubitak.gov.tr/tr/burslar/lisans/burs-programlari/icerik-2209-b",
        "title": "TÜBİTAK 2209-B",
        "organization": "TÜBİTAK",
        "category": Category.TUBITAK,
        "tags": ["industry", "thesis", "tubitak"],
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; QuestFoundBot/1.0; +https://questfound.io)",
}


def scrape_tubitak_page(url: str) -> Optional[str]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        content_div = soup.find("div", class_="page-content") or soup.find("div", class_="content-area") or soup.find("main")
        if content_div:
            return content_div.get_text(separator="\n", strip=True)
        return soup.get_text(separator="\n", strip=True)
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None


def extract_deadline(text: str) -> Optional[datetime]:
    patterns = [
        r"(\d{1,2})[./](\d{1,2})[./](\d{4})",
        r"(\d{4})-(\d{2})-(\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                groups = match.groups()
                if len(groups[0]) == 4:
                    return datetime(int(groups[0]), int(groups[1]), int(groups[2]))
                else:
                    return datetime(int(groups[2]), int(groups[1]), int(groups[0]))
            except ValueError:
                continue
    return None


def scrape() -> list[Competition]:
    results = []
    for program in PROGRAMS:
        print(f"Scraping {program['title']}...")
        text = scrape_tubitak_page(program["url"])
        if not text:
            continue

        deadline = extract_deadline(text)
        description = " ".join(text.split()[:80]) + "..."

        comp = Competition(
            title=program["title"],
            organization=program["organization"],
            description=description,
            category=program["category"],
            source_url=program["url"],
            country="Turkey",
            tags=program["tags"],
            deadline=deadline,
            currency="TRY",
        )
        results.append(comp)
        print(f"  OK: {comp.title}")

    return results
