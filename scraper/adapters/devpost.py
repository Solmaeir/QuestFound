"""
Devpost adapter — fetch_method: dynamic (Selenium).

import.py'deki Selenium mantığı korundu:
  - Headless Chrome, bot tespitini zorlaştıran user-agent
  - WebDriverWait ile kartların yüklenmesi bekleniyor
  - scroll_to_bottom ile lazy-load içerik tetikleniyor
  - Birden fazla fallback selector
  - Selector çalışmazsa debug_page.html kaydediliyor
"""
import logging
import os
import time
from typing import Optional

from schema import FetchedRecord

logger = logging.getLogger(__name__)

SOURCE_NAME = "devpost"
LISTING_URL = "https://devpost.com/hackathons?challenge_type[]=online&open_to[]=public"

# Sırasıyla denenir, ilk sonuç veren kullanılır.
TILE_SELECTORS = [
    "article.hackathon-tile",
    "a.tile-anchor",
    ".hackathon-tile",
    "[data-slug]",
]

TITLE_SELECTORS = [".content h2", ".hackathon-name", "h2", "h3", ".title"]
DATE_SELECTORS  = [".submission-period", ".date-range", "time", "[class*='date']"]
PRIZE_SELECTORS = [".prize-amount", "[class*='prize']", ".prize"]


# ---------------------------------------------------------------------------
# Selenium yardımcıları
# ---------------------------------------------------------------------------

def _get_driver():
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service

    try:
        from webdriver_manager.chrome import ChromeDriverManager
        service = Service(ChromeDriverManager().install())
    except Exception:
        # webdriver_manager yüklü değilse PATH'teki chromedriver kullanılır.
        service = Service()

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    return webdriver.Chrome(service=service, options=options)


def _scroll_to_bottom(driver, pause: float = 2.0, max_scrolls: int = 5) -> None:
    """Lazy-load içeriklerini tetiklemek için sayfayı aşağı kaydırır."""
    last_height = driver.execute_script("return document.body.scrollHeight")
    for _ in range(max_scrolls):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


def _safe_text(parent, selectors: list[str]) -> str:
    """parent içinde selector listesini sırayla dener, ilk bulunanın metnini döndürür."""
    from selenium.webdriver.common.by import By
    for sel in selectors:
        try:
            el = parent.find_element(By.CSS_SELECTOR, sel)
            text = el.text.strip()
            if text:
                return text
        except Exception:
            continue
    return ""


def _save_debug_html(html: str, path: str = "debug/devpost.html") -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    logger.warning("Selector çalışmadı — debug HTML kaydedildi: %s", path)


# ---------------------------------------------------------------------------
# Ana fetch+extract fonksiyonu
# ---------------------------------------------------------------------------

def fetch(debug_dir: Optional[str] = None) -> list[FetchedRecord]:
    """
    Devpost hackathon listesini Selenium ile çeker, FetchedRecord listesi döndürür.
    Herhangi bir hata olduğunda loglayıp boş liste döner — çökmez.
    """
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    records: list[FetchedRecord] = []
    driver = None

    try:
        driver = _get_driver()
        logger.info("[devpost] Sayfa açılıyor: %s", LISTING_URL)
        driver.get(LISTING_URL)

        # Kartların JS ile yüklenmesini bekle (max 15 sn)
        wait = WebDriverWait(driver, 15)
        try:
            wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, ", ".join(TILE_SELECTORS[:2]))
                )
            )
        except Exception:
            logger.warning("[devpost] Beklenen elementler 15 sn içinde gelmedi.")
            if debug_dir:
                _save_debug_html(driver.page_source, os.path.join(debug_dir, "devpost.html"))

        # Lazy-load içerik için scroll
        _scroll_to_bottom(driver, pause=2.0, max_scrolls=5)

        # Fallback selector — ilk sonuç veren kullanılır
        tile_elements = []
        used_selector = None
        for sel in TILE_SELECTORS:
            elements = driver.find_elements(By.CSS_SELECTOR, sel)
            if elements:
                tile_elements = elements
                used_selector = sel
                logger.info("[devpost] Selector çalıştı: %s → %d element", sel, len(elements))
                break

        if not tile_elements:
            logger.error("[devpost] Hiçbir selector çalışmadı.")
            if debug_dir:
                _save_debug_html(driver.page_source, os.path.join(debug_dir, "devpost.html"))
            return []

        for elem in tile_elements:
            title = _safe_text(elem, TITLE_SELECTORS)
            if not title:
                continue

            date_str = _safe_text(elem, DATE_SELECTORS)
            prize_str = _safe_text(elem, PRIZE_SELECTORS)

            # Link çıkarımı: element <a> ise doğrudan, değilse içindeki ilk <a>
            link = ""
            try:
                if elem.tag_name.lower() == "a":
                    link = elem.get_attribute("href") or ""
                else:
                    a = elem.find_element(By.TAG_NAME, "a")
                    link = a.get_attribute("href") or ""
            except Exception:
                pass

            if link and not link.startswith("http"):
                link = f"https://devpost.com{link}"

            records.append(
                FetchedRecord(
                    title=title,
                    description="",
                    source_url=link or LISTING_URL,
                    deadline=date_str,
                    prize=prize_str if prize_str else None,
                    category="HACKATHON",
                    source_name=SOURCE_NAME,
                    fetched_at="",  # run_fetch.py tarafından doldurulur
                )
            )

        logger.info("[devpost] %d kayıt çıkarıldı.", len(records))

    except Exception as e:
        logger.error("[devpost] Beklenmedik hata: %s", e, exc_info=True)

    finally:
        if driver:
            driver.quit()

    return records
