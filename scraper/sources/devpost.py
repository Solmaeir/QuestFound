"""
Scraper for Devpost hackathons listing.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from typing import Optional

from models import Competition, Category

DEVPOST_URL = "https://devpost.com/hackathons?challenge_type[]=online&open_to[]=public"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; QuestFoundBot/1.0; +https://questfound.io)",
    "Accept": "text/html,application/xhtml+xml",
}


def parse_prize(prize_str: str) -> tuple[Optional[str], str]:
    if not prize_str:
        return None, "USD"

    currency_map = {"$": "USD", "€": "EUR", "£": "GBP", "₺": "TRY", "₹": "INR"}
    currency = "USD"
    for symbol, code in currency_map.items():
        if symbol in prize_str:
            currency = code
            break

    amount = re.sub(r"[^\d,.]", "", prize_str).replace(",", "")
    return amount if amount else None, currency


def parse_date(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None
    parts = date_str.split("-")
    if len(parts) == 2:
        end_part = parts[1].strip()
        for fmt in ["%b %d, %Y", "%b %d %Y", "%B %d, %Y"]:
            try:
                return datetime.strptime(end_part, fmt)
            except ValueError:
                continue
    return None


def scrape() -> list[Competition]:
    results = []
    try:
        resp = requests.get(DEVPOST_URL, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        tiles = soup.select("article.hackathon-tile, li.hackathon-tile")
        if not tiles:
            tiles = soup.select("[class*='hackathon']")

        for tile in tiles[:20]:
            title_el = tile.select_one("h2, h3, .hackathon-name, .title")
            title = title_el.get_text(strip=True) if title_el else ""
            if not title:
                continue

            link_el = tile.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = f"https://devpost.com{link}"

            date_el = tile.select_one(".submission-period, [class*='date']")
            date_str = date_el.get_text(strip=True) if date_el else ""
            deadline = parse_date(date_str)

            prize_el = tile.select_one("[class*='prize']")
            prize_str = prize_el.get_text(strip=True) if prize_el else ""
            reward, currency = parse_prize(prize_str)

            comp = Competition(
                title=title,
                organization="Devpost",
                description=f"Devpost hackathon: {title}. {date_str}",
                category=Category.HACKATHON,
                reward=reward,
                currency=currency,
                deadline=deadline,
                application_url=link,
                source_url=link or DEVPOST_URL,
                country="International",
                tags=["hackathon", "devpost", "online"],
            )
            results.append(comp)

        print(f"Devpost: scraped {len(results)} hackathons")
    except Exception as e:
        print(f"Error scraping Devpost: {e}")

    return results
