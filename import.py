from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time


def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")           # Tarayıcı penceresi açma
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    # Bot tespitini zorlaştır
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )


def scroll_to_bottom(driver, pause=2.0, max_scrolls=5):
    """Sayfayı aşağı kaydırarak lazy-load içeriklerini yükle."""
    last_height = driver.execute_script("return document.body.scrollHeight")
    for _ in range(max_scrolls):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


def get_devpost_data():
    driver = get_driver()
    data = []

    try:
        driver.get("https://devpost.com/hackathons?challenge_type[]=online&open_to[]=public")

        # JS ile yüklenen kartların görünmesini bekle
        # Devpost'ta kartlar genellikle .hackathon-tile class'ına sahip <article> veya <a> tagları
        wait = WebDriverWait(driver, 15)
        try:
            wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "article.hackathon-tile, a.tile-anchor"))
            )
        except Exception:
            print("Uyarı: Beklenen selector bulunamadı, sayfa kayıt ediliyor...")
            with open("debug_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Sayfa kaynağı debug_page.html'e kaydedildi. Selector'ları kontrol edin.")

        # Daha fazla kart yüklemek için scroll yap
        scroll_to_bottom(driver, pause=2.0, max_scrolls=5)

        # --- Selector stratejisi: birden fazla olası selector dene ---
        # Devpost zaman zaman yapısını değiştiriyor, bu yüzden fallback mantığı ekledik
        selectors_to_try = [
            "article.hackathon-tile",   # Yeni Devpost yapısı
            "a.tile-anchor",            # Alternatif
            ".hackathon-tile",          # Genel class
            "[data-slug]",              # Data attribute ile
        ]

        hackathon_elements = []
        used_selector = None
        for sel in selectors_to_try:
            elements = driver.find_elements(By.CSS_SELECTOR, sel)
            if elements:
                hackathon_elements = elements
                used_selector = sel
                print(f"Kullanılan selector: {sel}, bulunan element: {len(elements)}")
                break

        if not hackathon_elements:
            print("Hiçbir selector çalışmadı. debug_page.html'i inceleyerek doğru selector'ı bulun.")
            return []

        for elem in hackathon_elements:
            title = _safe_text(elem, [
                ".content h2",
                ".hackathon-name",
                "h2",
                "h3",
                ".title",
            ])

            date = _safe_text(elem, [
                ".submission-period",
                ".date-range",
                "time",
                "[class*='date']",
            ])

            prize = _safe_text(elem, [
                ".prize-amount",
                "[class*='prize']",
                ".prize",
            ])

            # Link: eğer element <a> ise doğrudan al, değilse içinden bul
            link = ""
            tag = elem.tag_name.lower()
            if tag == "a":
                link = elem.get_attribute("href") or ""
            else:
                try:
                    a = elem.find_element(By.TAG_NAME, "a")
                    link = a.get_attribute("href") or ""
                except Exception:
                    pass

            if title:  # Başlığı olan kayıtları ekle
                data.append({
                    "title": title,
                    "date": date,
                    "prize": prize,
                    "link": link,
                    "source": "devpost",
                })

    finally:
        driver.quit()

    print(f"Bulunan hackathon sayısı: {len(data)}")
    return data


def _safe_text(parent, selectors):
    """Birden fazla selector dene, ilk bulunanın metnini döndür."""
    for sel in selectors:
        try:
            el = parent.find_element(By.CSS_SELECTOR, sel)
            text = el.text.strip()
            if text:
                return text
        except Exception:
            continue
    return ""


def clean_data(data):
    return [item for item in data if item.get("title")]


def remove_duplicates(data):
    seen = set()
    unique = []
    for item in data:
        key = item["title"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def save_data(data, path="data.json"):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"{len(data)} hackathon {path} dosyasına kaydedildi.")


if __name__ == "__main__":
    raw = get_devpost_data()
    cleaned = clean_data(raw)
    unique = remove_duplicates(cleaned)
    save_data(unique)

    print("\nİlk 5 kayıt:")
    for item in unique[:5]:
        print(f"  - {item['title']} | {item['date']} | {item['link'][:60]}...")