"""
Ortak çıktı şeması — tüm adapter'lar bu yapıyı döndürür.
Normalleştirme (tarih/ödül biçimi) burada yapılmaz; ham veriler tutulur.
"""
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class FetchedRecord:
    title: str                        # zorunlu
    description: str                  # boş olabilir
    source_url: str                   # zorunlu — o yarışmanın/duyurunun kendi linki
    deadline: str                     # ham haliyle ("Mar 02 - Apr 07, 2026" gibi); boş olabilir
    prize: Optional[str]              # boş/None olabilir
    category: Optional[str]           # ya kategori ("HACKATHON") ya da durum ("Başvuru Aşaması")
    source_name: str                  # "devpost" | "tubitak" | "teknofest"
    fetched_at: str                   # ISO 8601 — run_fetch.py tarafından eklenir


def record_to_dict(record: FetchedRecord) -> dict:
    return asdict(record)
