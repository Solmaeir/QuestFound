"""
QuestFound — Veri Toplama Orkestrasyonu

Her kaynak adapter'ını çalıştırır, sonuçları ayrı JSON dosyalarına kaydeder:
    data/devpost.json
    data/tubitak.json
    data/teknofest.json

Kullanım:
    python run_fetch.py                      # tüm kaynaklar
    python run_fetch.py --source devpost     # sadece devpost
    python run_fetch.py --source tubitak     # sadece tubitak
    python run_fetch.py --source teknofest   # sadece teknofest
    python run_fetch.py --debug-dir debug/   # HTML debug dosyalarını kaydet
    python run_fetch.py --data-dir out/      # çıktı dizinini değiştir (varsayılan: data/)

Her kaynak bağımsız: biri başarısız olsa diğerleri çalışmaya devam eder.
"""
import argparse
import json
import logging
import os
import sys
from datetime import datetime, timezone

# scraper/ dizini Python path'ine ekle
sys.path.insert(0, os.path.dirname(__file__))

from schema import FetchedRecord, record_to_dict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Kaynak kayıt defteri — sources_registry.json'dan okunur
# ---------------------------------------------------------------------------

def _load_registry(registry_path: str) -> dict:
    with open(registry_path, encoding="utf-8") as f:
        return json.load(f)


def _registry_source(registry: dict, name: str) -> dict:
    for src in registry["sources"]:
        if src["name"] == name:
            return src
    raise KeyError(f"Kaynak kayıt defterinde bulunamadı: {name!r}")


# ---------------------------------------------------------------------------
# Adapter'ları dinamik içe aktarma
# ---------------------------------------------------------------------------

def _run_adapter(source_name: str, listing_urls: list[str], debug_dir: str | None) -> list[FetchedRecord]:
    """Verilen kaynağın adapter'ını yükler ve fetch() çağırır."""
    if source_name == "devpost":
        from adapters.devpost import fetch
        return fetch(debug_dir=debug_dir)

    elif source_name == "tubitak":
        from adapters.tubitak import fetch
        return fetch(page_urls=listing_urls, debug_dir=debug_dir)

    elif source_name == "teknofest":
        from adapters.teknofest import fetch
        return fetch(listing_urls=listing_urls, debug_dir=debug_dir)

    else:
        raise ValueError(f"Bilinmeyen kaynak: {source_name!r}")


# ---------------------------------------------------------------------------
# Kaydetme
# ---------------------------------------------------------------------------

def _save(records: list[FetchedRecord], path: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    data = [record_to_dict(r) for r in records]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info("Kaydedildi → %s (%d kayıt)", path, len(data))


# ---------------------------------------------------------------------------
# Ana fonksiyon
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="QuestFound veri toplama — her kaynak ayrı JSON'a yazılır."
    )
    parser.add_argument(
        "--source",
        choices=["devpost", "tubitak", "teknofest"],
        help="Sadece belirtilen kaynağı çalıştır (varsayılan: hepsi).",
    )
    parser.add_argument(
        "--data-dir",
        default=os.path.join(os.path.dirname(__file__), "..", "data"),
        metavar="DIR",
        help="Çıktı JSON dosyalarının yazılacağı dizin (varsayılan: data/).",
    )
    parser.add_argument(
        "--debug-dir",
        default=None,
        metavar="DIR",
        help="Ham HTML debug dosyalarının kaydedileceği dizin (isteğe bağlı).",
    )
    parser.add_argument(
        "--registry",
        default=os.path.join(os.path.dirname(__file__), "sources_registry.json"),
        metavar="FILE",
        help="Kaynak kayıt defteri JSON dosyası.",
    )
    args = parser.parse_args()

    registry = _load_registry(args.registry)
    data_dir = os.path.abspath(args.data_dir)
    debug_dir = os.path.abspath(args.debug_dir) if args.debug_dir else None

    # Hangi kaynakları çalıştıracağız?
    all_source_names = [src["name"] for src in registry["sources"]]
    sources_to_run = [args.source] if args.source else all_source_names

    run_time = datetime.now(timezone.utc).isoformat()
    summary: dict[str, int] = {}

    for source_name in sources_to_run:
        print(f"\n{'─' * 50}")
        logger.info("Başlıyor → %s", source_name)

        try:
            reg_entry = _registry_source(registry, source_name)
            listing_urls = reg_entry.get("listing_urls", [])

            records = _run_adapter(source_name, listing_urls, debug_dir)

            # fetched_at alanını doldur
            for rec in records:
                rec.fetched_at = run_time

            output_path = os.path.join(data_dir, f"{source_name}.json")
            _save(records, output_path)
            summary[source_name] = len(records)

        except Exception as e:
            logger.error("[%s] HATA: %s", source_name, e, exc_info=True)
            summary[source_name] = -1   # -1 = başarısız

    # Özet
    print(f"\n{'═' * 50}")
    print("ÖZET")
    print(f"{'═' * 50}")
    total = 0
    for name, count in summary.items():
        if count >= 0:
            print(f"  ✓  {name:<12}  {count:>4} kayıt")
            total += count
        else:
            print(f"  ✗  {name:<12}  HATA")
    print(f"{'─' * 50}")
    print(f"     {'TOPLAM':<12}  {total:>4} kayıt")
    print()


if __name__ == "__main__":
    main()
