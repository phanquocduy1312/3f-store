/**
 * Convert Shopee CSV export → data/products.json với cấu trúc variant chuẩn
 *
 * CSV format (semicolon-delimited):
 *   Col 0:  Danh mục sản phẩm
 *   Col 1:  Tên sản phẩm
 *   Col 2:  Mô tả ngắn
 *   Col 3:  Mô tả chi tiết
 *   Col 4–43: Variant attribute columns (Màu, Combo, Hình dạng, ...)
 *   Col 44: Giá bán (original listed price)
 *   Col 45: Giá khuyến mãi (promotional/sale price)
 *   Col 46: Tồn kho
 *   Col 47: Ảnh sản phẩm
 *   Col 52: Thẻ sản phẩm (brand)
 *   Col 53: Mã ID Shopee (product group ID)
 *   Col 54: Link Gốc
 *   Col 55: Mã SKU  (format: {productId}-{variantIndex})
 *   Col 56: Đã Bán
 *
 * Output JSON structure per product:
 * {
 *   "id": "28076401392",
 *   "name": "...",
 *   "category": "...",
 *   "description": "...",
 *   "brand": "PetChoice",
 *   "image": "...",
 *   "images": [...],
 *   "rating": 4.8,
 *   "reviews": 0,
 *   "sold": 0,
 *   "shopeeUrl": "...",
 *   "price": "74.900đ",     ← lowest variant price
 *   "oldPrice": null,
 *   "variants": [
 *     { "id": "28076401392-0", "label": "Sữa - 1 gói", "price": "74.900đ", "oldPrice": null, "image": "...", "stock": 0 }
 *   ]
 * }
 *
 * Usage:
 *   node scripts/convert-shopee-csv-to-variant-json.mjs
 *   node scripts/convert-shopee-csv-to-variant-json.mjs path/to/file.csv
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ─── Config ────────────────────────────────────────────────────────────────────
const CSV_FILENAME = "3F_Store_Vi_t_Nam__Online_Shop___Shopee__shopee_2026-06-04.csv";
const csvPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, CSV_FILENAME);
const outputPath = path.join(ROOT, "data", "products.json");

// Column indices (0-based)
const COL_CATEGORY      = 0;
const COL_NAME          = 1;
const COL_SHORT_DESC    = 2;
const COL_DETAIL_DESC   = 3;
const COL_VARIANT_START = 4;   // first variant attribute column
const COL_VARIANT_END   = 43;  // last variant attribute column (inclusive)
const COL_PRICE         = 44;  // Giá bán
const COL_PROMO_PRICE   = 45;  // Giá khuyến mãi
const COL_STOCK         = 46;  // Tồn kho
const COL_IMAGE         = 47;  // Ảnh sản phẩm
const COL_BRAND         = 52;  // Thẻ sản phẩm
const COL_SHOPEE_ID     = 53;  // Mã ID Shopee
const COL_SHOPEE_URL    = 54;  // Link Gốc
const COL_SKU           = 55;  // Mã SKU
const COL_SOLD          = 56;  // Đã Bán

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(raw) {
  if (!raw) return null;
  const num = Number(String(raw).replace(/[^\d]/g, ""));
  if (!num) return null;
  return num.toLocaleString("vi-VN") + "đ";
}

function toInt(raw, fallback = 0) {
  const n = parseInt(String(raw ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Parse semicolon-delimited CSV that may have quoted fields containing semicolons.
 * Returns array of string[] rows.
 */
function parseCSV(content) {
  const rows = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (ch === ";" && !inQuote) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);
    rows.push(cells);
  }
  return rows;
}

function clean(str) {
  return (str ?? "").trim();
}

// ─── Main ──────────────────────────────────────────────────────────────────────
if (!fs.existsSync(csvPath)) {
  console.error(`❌ Không tìm thấy file: ${csvPath}`);
  process.exit(1);
}

// Try encodings in order
let rawContent = null;
for (const enc of ["utf8", "latin1"]) {
  try {
    rawContent = fs.readFileSync(csvPath, enc);
    break;
  } catch {
    // try next
  }
}
if (!rawContent) {
  console.error("❌ Không đọc được file CSV.");
  process.exit(1);
}

// Remove BOM if present
if (rawContent.charCodeAt(0) === 0xfeff) rawContent = rawContent.slice(1);

const allRows = parseCSV(rawContent);
const headerRow = allRows[0];
const dataRows = allRows.slice(1);

console.log(`📂 Nguồn: ${csvPath}`);
console.log(`📋 Số cột header: ${headerRow.length}`);
console.log(`📋 Số dòng dữ liệu: ${dataRows.length}`);

// ─── Group rows by Shopee product ID ──────────────────────────────────────────
// productId extracted from SKU: "28076401392-0" → "28076401392"
const productMap = new Map(); // productId → { meta, rows[] }

for (const row of dataRows) {
  const sku = clean(row[COL_SKU]);
  if (!sku) continue;

  const dashIdx = sku.lastIndexOf("-");
  const productId = dashIdx >= 0 ? sku.slice(0, dashIdx) : sku;
  if (!productId) continue;

  if (!productMap.has(productId)) {
    productMap.set(productId, { rows: [] });
  }
  productMap.get(productId).rows.push(row);
}

console.log(`📦 Số sản phẩm (nhóm): ${productMap.size}`);

// ─── Build product objects ──────────────────────────────────────────────────
const products = [];

for (const [productId, { rows }] of productMap) {
  const firstRow = rows[0];

  const name     = clean(firstRow[COL_NAME]);
  const category = clean(firstRow[COL_CATEGORY]);
  const desc     = clean(firstRow[COL_SHORT_DESC]) || clean(firstRow[COL_DETAIL_DESC]).slice(0, 300);
  const brand    = clean(firstRow[COL_BRAND]);
  const shopeeUrl = clean(firstRow[COL_SHOPEE_URL]);
  const soldTotal = rows.reduce((sum, r) => sum + toInt(r[COL_SOLD]), 0);

  if (!name) continue;

  // Build variants
  const variants = [];
  const seenImages = new Set();
  const images = [];

  for (const row of rows) {
    const sku = clean(row[COL_SKU]);
    const rawPrice = clean(row[COL_PRICE]);
    const rawPromo = clean(row[COL_PROMO_PRICE]);
    const stock    = toInt(row[COL_STOCK]);
    const image    = clean(row[COL_IMAGE]);

    // Pricing: if promo price exists and < listed price → price=promo, oldPrice=listed
    const listNum  = toInt(rawPrice);
    const promoNum = toInt(rawPromo);

    let price, oldPrice;
    if (promoNum > 0 && listNum > 0 && promoNum < listNum) {
      price    = formatPrice(promoNum);
      oldPrice = formatPrice(listNum);
    } else {
      price    = formatPrice(listNum) || formatPrice(promoNum);
      oldPrice = null;
    }

    // Variant label: combine all non-empty variant attribute columns
    const labelParts = [];
    for (let col = COL_VARIANT_START; col <= COL_VARIANT_END; col++) {
      const val = clean(row[col] ?? "");
      if (val) labelParts.push(val);
    }
    const label = labelParts.join(" - ") || `Loại ${sku}`;

    if (image && !seenImages.has(image)) {
      seenImages.add(image);
      images.push(image);
    }

    variants.push({
      id: sku,
      label,
      price,
      ...(oldPrice ? { oldPrice } : {}),
      image: image || images[0] || "",
      stock,
    });
  }

  if (!variants.length) continue;

  // Product-level price = min price among variants
  const minPrice = variants
    .map(v => toInt(v.price))
    .filter(n => n > 0)
    .reduce((a, b) => Math.min(a, b), Infinity);

  const hasDiscount = variants.some(v => v.oldPrice);

  const product = {
    id: productId,
    name,
    category: category || undefined,
    description: desc || undefined,
    brand: brand || undefined,
    image: images[0] || "",
    images,
    rating: 4.8,
    reviews: 0,
    sold: soldTotal,
    shopeeUrl: shopeeUrl || undefined,
    price: formatPrice(minPrice) || variants[0].price,
    ...(hasDiscount ? { oldPrice: variants.find(v => v.oldPrice)?.oldPrice } : {}),
    variants,
  };

  products.push(product);
}

if (!products.length) {
  console.error("❌ Không có sản phẩm hợp lệ.");
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2) + "\n", "utf8");

console.log(`\n✅ Hoàn thành!`);
console.log(`📝 Đã ghi ${products.length} sản phẩm → ${outputPath}`);
console.log(`📊 Tổng variants: ${products.reduce((s, p) => s + p.variants.length, 0)}`);
