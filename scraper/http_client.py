"""
Paylaşılan statik HTTP yardımcısı — sadece basit GET istekleri için.
Selenium gerektiren kaynaklar (devpost) bunu kullanmaz.
"""
import os
import time
import logging
from typing import Optional

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

_DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
}


def fetch_static(
    url: str,
    extra_headers: Optional[dict] = None,
    timeout: int = 15,
    debug_path: Optional[str] = None,
) -> BeautifulSoup:
    """
    Verilen URL'ye GET isteği atar, BeautifulSoup döndürür.

    debug_path verilirse ham HTML o dosyaya kaydedilir (selector araştırması için).
    Hata durumunda exception fırlatır — çağıran taraf yakalamalı.
    """
    headers = {**_DEFAULT_HEADERS, **(extra_headers or {})}

    logger.debug("GET %s", url)
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()
    response.encoding = response.apparent_encoding or "utf-8"

    html = response.text

    if debug_path:
        _save_debug(html, debug_path)

    return BeautifulSoup(html, "lxml")


def _save_debug(html: str, path: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    logger.info("Debug HTML kaydedildi → %s", path)


def polite_sleep(seconds: float = 1.5) -> None:
    """Sunucuyu yormamak için istekler arasına bekleme ekler."""
    time.sleep(seconds)
