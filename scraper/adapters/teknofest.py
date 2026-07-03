"""
TEKNOFEST adapter — fetch_method: static.

Tek sayfada tüm yarışmalar listeleniyor.
Özellikler:
  - Bağlantı metninin SONUNDA durum ifadesi var → ayrıştırılıyor
  - Aynı source_url birden fazla kez tekrarlanabiliyor (sekme duplikasyonu) →
    sadece ilk görülen tutuluyor (sayfa içi tekilleştirme)
  - prize ve deadline liste sayfasında yok → None / ""
"""
import logging
import os
from typing import Optional

from http_client import fetch_static
from schema import FetchedRecord

logger = logging.getLogger(__name__)

SOURCE_NAME = "teknofest"
LISTING_URL = "https://teknofest.org/tr/yarismalar"

# Bağlantı metninin sonuna yapışan olası durum ifadeleri (uzundan kısaya sıralı —
# önek eşleşmesini önlemek için).
STATUS_SUFFIXES = [
    "Başvuru Tamamlandı",
    "Başvuru Aşaması",
    "Henüz Başlamadı",
    "Devam Ediyor",
    "Sonuçlandı",
    "Değerlendirme Aşaması",
]

# Yarışma bağlantıları için sırayla denenir.
LINK_SELECTORS = [
    "a[href*='/yarismalar/']",    # /yarismalar/ içeren bağlantılar
    "a[href*='/competitions/']",  # İngilizce versiyon
    ".competition-card a",
    ".card a",
    ".yarismalar a",
    "main a[href]",
]


def _split_title_status(text: str) -> tuple[str, Optional[str]]:
    """
    'Sağlıkta Yapay ZekaHenüz Başlamadı' → ('Sağlıkta Yapay Zeka', 'Henüz Başlamadı')
    Eşleşen suffix yoksa → (text, None)
    """
    for suffix in STATUS_SUFFIXES:
        if text.endswith(suffix):
            title = text[: -len(suffix)].strip()
            return title, suffix
    return text.strip(), None


def fetch(
    listing_urls: Optional[list[str]] = None,
    debug_dir: Optional[str] = None,
) -> list[FetchedRecord]:
    """
    TEKNOFEST yarışmalar sayfasını çeker, FetchedRecord listesi döndürür.
    """
    urls = listing_urls or [LISTING_URL]
    all_records: list[FetchedRecord] = []
    seen_urls: set[str] = set()   # sayfa içi tekilleştirme

    for url in urls:
        logger.info("[teknofest] Sayfa çekiliyor: %s", url)

        debug_path = os.path.join(debug_dir, "teknofest.html") if debug_dir else None

        try:
            soup = fetch_static(url, debug_path=debug_path)
        except Exception as e:
            logger.error("[teknofest] Sayfa çekilemedi (%s): %s", url, e)
            continue

        # Bağlantı elementlerini bul
        links = []
        used_selector = None
        for sel in LINK_SELECTORS:
            links = soup.select(sel)
            if links:
                used_selector = sel
                logger.info("[teknofest] Selector: %s → %d bağlantı", sel, len(links))
                break

        if not links:
            logger.warning("[teknofest] Hiçbir link selector çalışmadı: %s", url)
            if not debug_dir:
                logger.warning(
                    "[teknofest] İpucu: --debug-dir ile HTML'i kaydedin, "
                    "sonra doğru selector'ı bulun."
                )
            continue

        page_count = 0
        for a in links:
            raw_text = a.get_text(strip=True)
            if not raw_text:
                continue

            href = a.get("href", "")
            if not href:
                continue
            full_url = href if href.startswith("http") else f"https://teknofest.org{href}"

            # Tekilleştirme: aynı URL ilk kez görülüyorsa al, sonrakini atla
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            title, status = _split_title_status(raw_text)
            if not title:
                continue

            all_records.append(
                FetchedRecord(
                    title=title,
                    description="",
                    source_url=full_url,
                    deadline="",       # liste sayfasında tarih yok
                    prize=None,        # liste sayfasında ödül yok
                    category=status,   # "Başvuru Aşaması" gibi
                    source_name=SOURCE_NAME,
                    fetched_at="",     # run_fetch.py tarafından doldurulur
                )
            )
            page_count += 1

        logger.info("[teknofest] %d benzersiz kayıt çıkarıldı.", page_count)

    logger.info("[teknofest] Toplam %d kayıt.", len(all_records))
    return all_records
