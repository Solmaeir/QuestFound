"""
QuestFound scraper orchestrator.

Usage:
  python main.py                   # scrape all sources
  python main.py --source tubitak  # scrape specific source
  python main.py --dry-run         # print without pushing to DB
"""
import argparse
import json
import os
import sys
from datetime import datetime

import requests

sys.path.insert(0, os.path.dirname(__file__))

from sources import tubitak, devpost
from models import Competition

API_BASE = os.environ.get("QUESTFOUND_API_URL", "http://localhost:3000")

SCRAPERS = {
    "tubitak": tubitak.scrape,
    "devpost": devpost.scrape,
}


def push_to_api(competition: Competition) -> bool:
    payload = {
        "title": competition.title,
        "organization": competition.organization,
        "description": competition.description,
        "category": competition.category.value,
        "reward": competition.reward,
        "currency": competition.currency,
        "deadline": competition.deadline.isoformat() if competition.deadline else None,
        "applicationUrl": competition.application_url,
        "sourceUrl": competition.source_url,
        "country": competition.country,
        "tags": competition.tags,
    }
    try:
        resp = requests.post(f"{API_BASE}/api/competitions", json=payload, timeout=10)
        return resp.status_code in (200, 201)
    except Exception as e:
        print(f"  Failed to push {competition.title}: {e}")
        return False


def save_to_json(competitions: list[Competition], path: str = "scraped_output.json") -> None:
    data = []
    for c in competitions:
        d = c.model_dump()
        if d.get("deadline") and isinstance(d["deadline"], datetime):
            d["deadline"] = d["deadline"].isoformat()
        data.append(d)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} items to {path}")


def main():
    parser = argparse.ArgumentParser(description="QuestFound scraper")
    parser.add_argument("--source", choices=list(SCRAPERS.keys()), help="Run a specific source only")
    parser.add_argument("--dry-run", action="store_true", help="Print results without pushing to API")
    parser.add_argument("--output", default="scraped_output.json", help="Output JSON path for dry run")
    args = parser.parse_args()

    sources_to_run = {args.source: SCRAPERS[args.source]} if args.source else SCRAPERS
    all_competitions: list[Competition] = []

    for name, scraper_fn in sources_to_run.items():
        print(f"\n{'='*40}")
        print(f"Running scraper: {name}")
        print(f"{'='*40}")
        try:
            results = scraper_fn()
            all_competitions.extend(results)
            print(f"  → {len(results)} competitions found")
        except Exception as e:
            print(f"  ERROR in {name}: {e}")

    print(f"\nTotal: {len(all_competitions)} competitions scraped")

    if args.dry_run:
        save_to_json(all_competitions, args.output)
    else:
        pushed = 0
        for comp in all_competitions:
            if push_to_api(comp):
                pushed += 1
                print(f"  ✓ {comp.title}")
            else:
                print(f"  ✗ {comp.title}")
        print(f"\nPushed {pushed}/{len(all_competitions)} to API")


if __name__ == "__main__":
    main()
