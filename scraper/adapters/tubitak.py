"""
TÜBİTAK adapter — fetch_method: static.

TÜBİTAK haber/duyuru listeleme sayfalarını BeautifulSoup ile tarar.
Şimdilik ilk 1-2 sayfa ile sınırlı (sayfa sayısı sources_registry.json'dan gelir).
prize alanı her zaman None — bireysel program sayfalarında olsa da liste görünümünde yok.
"""
import logging
import os
import time
from typing import Optional

from http_client import fetch_static, polite_sleep
from schema import FetchedRecord

logger = logging.getLogger(__name__)

SOURCE_NAME = "tubitak"
BASE_URL = "https://www.tubitak.gov.tr"

# Sayfalı URL'ler — run_fetch.py sources_registry'den okuyacak;
# bu liste sadece bu modül doğrudan çalıştırıldığında fallback olarak kullanılır.
DEFAULT_PAGES = [
    "https://www.tubitak.gov.tr/tr/haber/arsiv?page=1",
    "https://www.tubitak.gov.tr/tr/haber/arsiv?page=2",
]

# Duyuru/haber listesi kapsayıcısı için sırayla denenir.
CONTAINER_SELECTORS = [
    ".views-rows",         # Drupal tabanlı TÜBİTAK sitesinde yaygın
    ".view-content",
    ".news-list",
    ".haber-listesi",
    "ul.liste",
    "main ul",
    "main",
]

# Kapsayıcı içindeki tekil öğe selector'ları.
ITEM_SELECTORS = [
    ".views-row",
    "article",
    "li",
]

# Başlık + link için selector'lar (item içinde).
TITLE_LINK_SELECTORS = [
    "h2 a", "h3 a", "h4 a",
    ".field-content a",
    ".views-field-title a",
    "a.haber-baslik",
    "a",                   # son çare: item içindeki ilk link
]

# Tarih için selector'lar.
DATE_SELECTORS = [
    ".date-display-single",
    ".views-field-created",
    ".field-name-post-date",
    "time",
    "[class*='date']",
    "[class*='tarih']",
]

# Kısa açıklama/özet için selector'lar.
DESC_SELECTORS = [
    ".views-field-body",
    ".field-name-body",
    ".ozet",
    "p",
]


def _extract_items(soup, page_url: str) -> list[FetchedRecord]:
    """Tek bir sayfa soup'undan kayıt listesi çıkarır."""
    records: list[FetchedRecord] = []

    # 1. Kapsayıcıyı bul
    container = None
    for sel in CONTAINER_SELECTORS:
        container = soup.select_one(sel)
        if container:
            logger.debug("[tubitak] Kapsayıcı bulundu: %s", sel)
            break

    if not container:
        logger.warning("[tubitak] %s — hiçbir kapsayıcı selector çalışmadı.", page_url)
        container = soup  # tüm sayfa üzerinden dene

    # 2. Öğeleri bul
    items = []
    for sel in ITEM_SELECTORS:
        items = container.select(sel)
        if items:
            logger.debug("[tubitak] Öğe selector: %s → %d öğe", sel, len(items))
            break

    if not items:
        logger.warning("[tubitak] %s — öğe bulunamadı.", page_url)
        return []

    for item in items:
        # Başlık + link
        title = ""
        link = ""
        for sel in TITLE_LINK_SELECTORS:
            el = item.select_one(sel)
            if el:
                title = el.get_text(strip=True)
                href = el.get("href", "")
                if href:
                    link = href if href.startswith("http") else BASE_URL + href
                if title:
                    break

        if not title:
            continue  # başlığı olmayan öğeleri atla

        # Tarih
        date_str = ""
        for sel in DATE_SELECTORS:
            el = item.select_one(sel)
            if el:
                date_str = el.get_text(strip=True)
                if date_str:
                    break

        # Açıklama
        desc = ""
        for sel in DESC_SELECTORS:
            el = item.select_one(sel)
            if el:
                desc = el.get_text(strip=True)
                if desc:
                    break

        records.append(
            FetchedRecord(
                title=title,
                description=desc,
                source_url=link if link else page_url,
                deadline=date_str,
                prize=None,            # liste sayfasında ödül bilgisi yok
                category="TUBITAK",
                source_name=SOURCE_NAME,
                fetched_at="",         # run_fetch.py tarafından doldurulur
            )
        )

    return records


def fetch(
    page_urls: Optional[list[str]] = None,
    debug_dir: Optional[str] = None,
) -> list[FetchedRecord]:
    """
    Verilen TÜBİTAK liste sayfalarını tek tek çeker, FetchedRecord listesi döndürür.
    Bir sayfa hata verirse loglanır ve diğerine devam edilir.
    """
    urls = page_urls or DEFAULT_PAGES
    all_records: list[FetchedRecord] = []

    for i, url in enumerate(urls):
        logger.info("[tubitak] Sayfa çekiliyor (%d/%d): %s", i + 1, len(urls), url)

        # İsteğe bağlı debug kayıt yolu
        debug_path = None
        if debug_dir:
            page_num = i + 1
            debug_path = os.path.join(debug_dir, f"tubitak_p{page_num}.html")

        try:
            soup = fetch_static(url, debug_path=debug_path)
            page_records = _extract_items(soup, url)
            logger.info("[tubitak] Sayfa %d → %d kayıt", i + 1, len(page_records))
            all_records.extend(page_records)
        except Exception as e:
            logger.error("[tubitak] Sayfa %d başarısız (%s): %s", i + 1, url, e)

        # Son sayfadan sonra beklemeye gerek yok
        if i < len(urls) - 1:
            polite_sleep(1.5)

    logger.info("[tubitak] Toplam %d kayıt çıkarıldı.", len(all_records))
    return all_records
