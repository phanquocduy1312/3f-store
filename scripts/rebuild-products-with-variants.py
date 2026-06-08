import csv
import json
import re
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "3F_Store_Vi_t_Nam__Online_Shop___Shopee__shopee_2026-06-04.csv"
OUTPUT_PATH = ROOT / "data" / "products.json"
CURRENT_PRODUCTS_PATH = ROOT / "data" / "products.json"

# CSV columns
COL_CATEGORY = 0
COL_NAME = 1
COL_SHORT_DESC = 2
COL_DETAIL_DESC = 3
COL_VARIANT_START = 4
COL_VARIANT_END = 43
COL_PRICE = 44
COL_PROMO_PRICE = 45
COL_STOCK = 46
COL_IMAGE = 47
COL_BRAND = 52
COL_SHOPEE_ID = 53
COL_SHOPEE_URL = 54
COL_SKU = 55
COL_SOLD = 56


REPLACEMENTS = [
    ("Ð", "Đ"),
    ("đ?", "độ"),
    ("Túi tri?t", "Túi chiết"),
    ("Túi Tri?t", "Túi chiết"),
    ("Túi chi?t", "Túi chiết"),
    ("túi tri?t", "túi chiết"),
    ("túi chi?t", "túi chiết"),
    ("Tri?t s?n", "Triệt sản"),
    ("tri?t s?n", "triệt sản"),
    ("Bò c?u l?nr?ng cáh?i", "Bò cừu lợn rừng cá hồi"),
    ("BòC?u L?nr?ng Cáh?i", "Bò Cừu Lợn Rừng Cá Hồi"),
    ("Bò-c?u-l?n-cá h?i", "Bò-cừu-lợn-cá hồi"),
    ("Gà tây-cáh?i", "Gà tây-cá hồi"),
    ("Heo táo rau c?", "Heo táo rau củ"),
    ("Gi?ng chó nh?", "Giống chó nhỏ"),
    ("Chó l?n", "Chó lớn"),
    ("Mèo l?n", "Mèo lớn"),
    ("H?t l?n", "Hạt lớn"),
    ("H?t nh?", "Hạt nhỏ"),
    ("H?t ", "Hạt "),
    ("h?t ", "hạt "),
    ("B?nh Ti?u Đu?ng", "Bệnh Tiểu Đường"),
    ("B?nh du?ng ru?t", "Bệnh đường ruột"),
    ("B?nh gan", "Bệnh gan"),
    ("B?nh th?n", "Bệnh thận"),
    ("B?nh xuong kh?p", "Bệnh xương khớp"),
    ("B?nhtim", "Bệnh tim"),
    ("B.du?ngti?tni?u", "B. đường tiết niệu"),
    ("D??nggâykhótiêu", "Dưỡng gây khó tiêu"),
    ("D??nggâyviêmda", "Dưỡng gây viêm da"),
    ("Qu?nlý cân n?ng", "Quản lý cân nặng"),
    ("Ðu?ng ru?t", "Đường ruột"),
    ("Cân n?ng", "Cân nặng"),
    ("S?i th?n", "Sỏi thận"),
    ("H? tr? ti?t ni?u", "Hỗ trợ tiết niệu"),
    ("H? Tr? Ti?t Ni?u", "Hỗ Trợ Tiết Niệu"),
    ("H? Tr? Tiêu Hóa", "Hỗ Trợ Tiêu Hóa"),
    ("H? tr? tiêu hóa", "Hỗ trợ tiêu hóa"),
    ("ti?t ni?u", "tiết niệu"),
    ("Ti?t Ni?u", "Tiết Niệu"),
    ("du?ng ru?t", "đường ruột"),
    ("n?u x?t", "nấu sốt"),
    ("x?t puppy", "sốt puppy"),
    ("x?t", "sốt"),
    ("xkhói", "xông khói"),
    ("m?i tu?i", "mọi tuổi"),
    ("M?c", "Mực"),
    ("m?c", "mực"),
    ("B?p", "Bắp"),
    ("b?p", "bắp"),
    ("S?a", "Sữa"),
    ("s?a", "sữa"),
    ("Tr?ng", "Trứng"),
    ("tr?ng", "trứng"),
    ("V?t", "Vịt"),
    ("v?t", "vịt"),
    ("C?u", "Cừu"),
    ("c?u", "cừu"),
    ("G?o", "Gạo"),
    ("g?o", "gạo"),
    ("Nu?ng", "Nướng"),
    ("nu?ng", "nướng"),
    ("Cá ng?", "Cá ngừ"),
    ("cá ng?", "cá ngừ"),
    ("Cá h?i", "Cá hồi"),
    ("cá h?i", "cá hồi"),
    ("Cá bi?n", "Cá biển"),
    ("cá bi?n", "cá biển"),
    ("H?i s?n", "Hải sản"),
    ("H?i S?n", "Hải sản"),
    ("ha?i sa?n", "hải sản"),
    ("Cá H?i", "Cá Hồi"),
    ("Cá Ng?", "Cá Ngừ"),
    ("V? C?U", "Vị Cừu"),
    ("V? CÁ H?I", "Vị Cá Hồi"),
    ("V? V?T", "Vị Vịt"),
    ("V?", "Vị"),
    ("v?", "vị"),
    ("Kh?i lu?ng", "Khối lượng"),
    ("Tr?ng lu?ng", "Trọng lượng"),
    ("H?p", "Hộp"),
    ("Ph?n em bé", "Phấn em bé"),
    ("Ph?n Baby", "Phấn Baby"),
    ("Nu?c Hoa", "Nước Hoa"),
    ("Hoa H?ng", "Hoa Hồng"),
    ("Xanh Ng?c", "Xanh Ngọc"),
    ("M?t ph?ng", "Mặt phẳng"),
    ("G?n sóng", "Gợn sóng"),
    ("G?n Sóng", "Gợn Sóng"),
    ("Ðáy b?ng + Lu?n", "Đáy bằng + Lượn"),
    ("Mix Ð?t Sét", "Mix Đất Sét"),
    ("Ðào", "Đào"),
    ("Ð?", "Đỏ"),
    ("Ðuôi", "Đuôi"),
    ("Ð?u", "Đậu"),
    ("Ð?t", "Đất"),
    ("X?", "Xả"),
    ("C? Mèo", "Cỏ Mèo"),
    ("D?u cá", "Dầu cá"),
    ("1 gói l?", "1 gói lẻ"),
    ("nu?c hoa", "nước hoa"),
    ("Nu?c hoa", "Nước hoa"),
    ("?c gà c? mèo", "Ức gà cỏ mèo"),
    ("?c gà thu?ng h?ng", "Ức gà thượng hạng"),
    ("Lòng d? trứng gà", "Lòng đỏ trứng gà"),
    ("T? 2 - 12 tháng", "Từ 2 - 12 tháng"),
    ("Tru?ng thành", "Trưởng thành"),
    ("Rau C?", "Rau Củ"),
    ("rau c?", "rau củ"),
    ("v?i", "với"),
    ("V?i", "Với"),
    ("Cà r?t", "Cà rốt"),
    ("r?t", "rốt"),
    ("T?i", "Tải"),
    ("t?i", "tải"),
    ("L?n", "Lớn"),
    ("H?ng", "Hồng"),
    ("bí d?", "bí đỏ"),
    ("Bí d?", "Bí đỏ"),
    ("Th?tBò", "Thịt Bò"),
    ("GanBò", "Gan Bò"),
    ("h?m", "hầm"),
    ("H?m", "Hầm"),
    ("T? 2 - 12 tháng", "Từ 2 - 12 tháng"),
    ("Đ?", "Đỏ"),
    ("rongbi?n", "rong biển"),
    ("Ng? mix C.h?i", "Ngừ mix Cá hồi"),
    ("Biê?n", "Biển"),
    ("D?u Cá", "Dầu Cá"),
    ("Cá Tuy?t", "Cá Tuyết"),
    ("tuy?t", "tuyết"),
    ("th? gà", "thịt gà"),
    ("Gà & Th?", "Gà & Thỏ"),
    ("Gi?m Nôn Tr?", "Giảm Nôn Trớ"),
    ("gi?m", "giảm"),
    ("n?u dông", "nấu đông"),
    ("l?u", "lựu"),
    ("s?t kem", "sốt kem"),
    ("Nhuy?n", "Nhuyễn"),
    ("nhuy?n", "nhuyễn"),
    ("Đu d?", "Đu đủ"),
    ("Gói l?", "Gói lẻ"),
    ("cá ngù", "cá ngừ"),
    ("r?ng", "rừng"),
    ("mi?ng", "miếng"),
    ("mèo l?n", "mèo lớn"),
    ("gi? dáng", "giữ dáng"),
    ("Cábi?nd?iduong10C", "Cá biển đại dương 10C"),
    ("Indoor - gi?m hôi phân", "Indoor - giảm hôi phân"),
    ("100g - th?", "100g - thỏ"),
    ("2kg - T? 2 - 12 tháng", "2kg - Từ 2 - 12 tháng"),
    ("6kg - T? 2 - 12 tháng", "6kg - Từ 2 - 12 tháng"),
    ("Mèo tru?ng thành", "Mèo trưởng thành"),
    ("Nguyên b?n", "Nguyên bản"),
    ("Than Ho?t Tính", "Than Hoạt Tính"),
    ("Than ho?t tính", "Than hoạt tính"),
    ("Thạch TN: Cá bào, ng?", "Thạch TN: Cá bào, ngừ"),
    ("Thạt", "Thịt"),
    ("B? Câu", "Bồ Câu"),
    ("Cá m?p", "Cá mập"),
    ("Ng?ng", "Ngỗng"),
    ("Th?ng", "Thỏng"),
    ("di?u", "điểu"),
    ("Túi Chi?t", "Túi Chiết"),
    ("Mix d?t sét", "Mix đất sét"),
    ("Mix g?", "Mix gỗ"),
    ("Đu?ng ru?t", "Đường ruột"),
    ("Đáy b?ng + Lu?n", "Đáy bằng + Lượn"),
    ("d?u nành", "đậu nành"),
    ("100g - th?", "100g - thỏ"),
    ("2kg - T? 2 - 12 tháng", "2kg - Từ 2 - 12 tháng"),
    ("6kg - T? 2 - 12 tháng", "6kg - Từ 2 - 12 tháng"),
    ("Thịt th?", "Thịt thỏ"),
    ("Thịt Th?", "Thịt Thỏ"),
    ("Thỏch TN: Cá bào, ng?", "Thạch TN: Cá bào, ngừ"),
    ("Vịt quay b?c kinh", "Vịt quay Bắc Kinh"),
    ("Sò di?p", "Sò điệp"),
    ("Th?ch", "Thạch"),
    ("d?ng mousse", "dạng mousse"),
    ("d?ng mouse", "dạng mousse"),
    ("D?ng s?t", "Dạng sốt"),
    ("r?c", "rắc"),
    ("nhuy?n", "nhuyễn"),
    ("B?c kinh", "Bắc Kinh"),
    ("Thom", "Thơm"),
    ("Qu?", "Quả"),
    ("Nha Ðam", "Nha Đam"),
    ("K? T?", "Kỷ Tử"),
    ("Tôm Nam C?c", "Tôm Nam Cực"),
    ("V?m Xanh", "Vẹm Xanh"),
    ("Bí Ngô", "Bí Ngô"),
    ("Cà Rô´t", "Cà Rốt"),
    ("Me`o", "Mèo"),
    ("ca´ ngu`", "cá ngừ"),
    ("ca´ thu", "cá thu"),
    ("ca´", "cá"),
    ("Ga` va`", "Gà và"),
    ("Ga`", "Gà"),
    ("Bi´", "Bí"),
    ("Ca`", "Cà"),
    ("Rô´t", "Rốt"),
]

ACCENT_REPLACEMENTS = {
    "a´": "á",
    "a`": "à",
    "A´": "Á",
    "A`": "À",
    "e´": "é",
    "e`": "è",
    "E´": "É",
    "E`": "È",
    "i´": "í",
    "i`": "ì",
    "I´": "Í",
    "I`": "Ì",
    "o´": "ó",
    "o`": "ò",
    "O´": "Ó",
    "O`": "Ò",
    "u´": "ú",
    "u`": "ù",
    "U´": "Ú",
    "U`": "Ù",
    "y´": "ý",
    "y`": "ỳ",
    "Y´": "Ý",
    "Y`": "Ỳ",
}


def to_int(value, default=0):
    digits = re.sub(r"[^\d]", "", str(value or ""))
    return int(digits) if digits else default


def format_price(value):
    amount = to_int(value)
    return f"{amount:,}đ".replace(",", ".") if amount else None


def load_current_products():
    if not CURRENT_PRODUCTS_PATH.exists():
        return {}
    try:
        products = json.loads(CURRENT_PRODUCTS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return {str(product.get("id")): product for product in products}


def repair_text(value):
    text = (value or "").strip()
    if not text:
        return ""

    for _ in range(4):
        before = text

        for src, dest in ACCENT_REPLACEMENTS.items():
            text = text.replace(src, dest)

        for src, dest in REPLACEMENTS:
            text = text.replace(src, dest)

        text = re.sub(r"\s*&\s*", " & ", text)
        text = re.sub(r"\s{2,}", " ", text)
        text = re.sub(r"\s*-\s*", " - ", text)
        text = re.sub(r"\s*,\s*", ", ", text)

        if text == before:
            break

    return text.strip(" -")


def name_from_url(url, fallback):
    if not url:
        return repair_text(fallback)

    decoded = unquote(url)
    slug = decoded.rsplit("/", 1)[-1]
    marker = "-i."
    if marker in slug:
        slug = slug.split(marker, 1)[0]

    slug = slug.strip("-")
    name = slug.replace("-", " ")
    name = re.sub(r"\s+", " ", name).strip()
    return repair_text(name or fallback)


def parse_csv_rows():
    with CSV_PATH.open("r", encoding="cp1252", newline="") as file:
        return list(csv.reader(file, delimiter=";"))


def build_products():
    current_map = load_current_products()
    rows = parse_csv_rows()
    data_rows = rows[1:]

    grouped = {}
    for row in data_rows:
        if len(row) <= COL_SKU:
            continue
        sku = row[COL_SKU].strip()
        if not sku:
            continue
        product_id = sku.rsplit("-", 1)[0]
        grouped.setdefault(product_id, []).append(row)

    products = []

    for product_id, product_rows in grouped.items():
        first_row = product_rows[0]
        current_product = current_map.get(product_id, {})

        shopee_url = first_row[COL_SHOPEE_URL].strip() if len(first_row) > COL_SHOPEE_URL else ""
        category = current_product.get("category") or repair_text(first_row[COL_CATEGORY])
        brand = current_product.get("brand") or repair_text(first_row[COL_BRAND])
        description = repair_text(first_row[COL_SHORT_DESC] or first_row[COL_DETAIL_DESC])
        name = name_from_url(shopee_url, current_product.get("name") or first_row[COL_NAME])

        variants = []
        images = []
        seen_images = set()

        for row in product_rows:
            sku = row[COL_SKU].strip()
            price_value = row[COL_PRICE] if len(row) > COL_PRICE else ""
            promo_value = row[COL_PROMO_PRICE] if len(row) > COL_PROMO_PRICE else ""
            stock = to_int(row[COL_STOCK]) if len(row) > COL_STOCK else 0
            image = row[COL_IMAGE].strip() if len(row) > COL_IMAGE else ""

            listed_price = to_int(price_value)
            promo_price = to_int(promo_value)
            if promo_price and listed_price and promo_price < listed_price:
                price = format_price(promo_price)
                old_price = format_price(listed_price)
            else:
                price = format_price(listed_price) or format_price(promo_price)
                old_price = None

            attr_parts = []
            for col in range(COL_VARIANT_START, min(COL_VARIANT_END + 1, len(row))):
                value = repair_text(row[col])
                if value:
                    attr_parts.append(value)

            label = " - ".join(attr_parts) if attr_parts else f"Phân loại {sku}"

            if image and image not in seen_images:
                seen_images.add(image)
                images.append(image)

            variant = {
                "id": sku,
                "label": label,
                "price": price,
                "image": image or (images[0] if images else ""),
                "stock": stock,
            }
            if old_price:
                variant["oldPrice"] = old_price
            variants.append(variant)

        if not variants:
            continue

        prices = [to_int(variant["price"]) for variant in variants if variant.get("price")]
        min_price = min((value for value in prices if value > 0), default=0)
        discounted_variant = next((variant for variant in variants if "oldPrice" in variant), None)
        sold_total = sum(to_int(row[COL_SOLD]) for row in product_rows if len(row) > COL_SOLD)

        product = {
            "id": product_id,
            "name": name,
            "category": category,
            "description": description,
            "brand": brand,
            "image": images[0] if images else "",
            "images": images,
            "rating": 4.8,
            "reviews": 0,
            "sold": sold_total,
            "shopeeUrl": shopee_url,
            "price": format_price(min_price) or variants[0]["price"],
            "variants": variants,
        }
        if discounted_variant:
            product["oldPrice"] = discounted_variant["oldPrice"]

        product = {key: value for key, value in product.items() if value not in (None, "")}
        products.append(product)

    return products


def main():
    products = build_products()
    OUTPUT_PATH.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    bad_labels = [
        variant["label"]
        for product in products
        for variant in product.get("variants", [])
        if "?" in variant["label"] or "´" in variant["label"] or "`" in variant["label"] or "Ð" in variant["label"]
    ]

    print(f"Wrote {len(products)} products to {OUTPUT_PATH}")
    print(f"Total variants: {sum(len(product.get('variants', [])) for product in products)}")
    print(f"Remaining suspicious labels: {len(bad_labels)}")
    for label in sorted(set(bad_labels))[:40]:
        print(" -", label)


if __name__ == "__main__":
    main()
