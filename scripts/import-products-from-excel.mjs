/**
 * Import sản phẩm từ Excel (Shopee export hoặc file tùy chỉnh) → data/products.json
 *
 *   npm run import:products
 *   npm run import:products -- "duong-dan\\file.xlsx"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SHOPEE_FILE = "3F_Store_Vi_t_Nam__Online_Shop___Shopee__shopee_2026-06-04.xlsx";

const defaultInput = path.join(root, "data", "san-pham.xlsx");
const shopeeInput = path.join(root, SHOPEE_FILE);
const outputPath = path.join(root, "data", "products.json");

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : fs.existsSync(shopeeInput)
    ? shopeeInput
    : defaultInput;

/** Keys sau khi bỏ dấu tiếng Việt (normalizeHeader) */
const COLUMN_MAP = {
  ten: "name",
  ten_san_pham: "name",
  name: "name",

  gia: "price",
  gia_ban: "price",
  price: "price",

  gia_cu: "oldPrice",
  gia_khuyen_mai: "promoPrice",
  oldprice: "oldPrice",

  anh: "image",
  anh_san_pham: "image",
  image: "image",

  danh_gia: "rating",
  rating: "rating",

  so_danh_gia: "reviews",
  reviews: "reviews",

  da_ban: "sold",
  sold: "sold",

  danh_muc_san_pham: "category",
  ma_sku: "sku",
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*+/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatPrice(value) {
  if (value === undefined || value === null || value === "") return "";
  const raw = String(value).trim();
  if (raw.includes("đ")) return raw;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return raw;
  return `${Number(digits).toLocaleString("vi-VN")}đ`;
}

function toNumber(value, fallback = 0) {
  const digits = String(value ?? "").replace(/[^\d.]/g, "");
  if (!digits) return fallback;
  const n = Number(digits);
  return Number.isFinite(n) ? n : fallback;
}

function pickImage(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "/assets/images/dog-food.webp";
  const url = raw.split(/[\s,|]+/).find((part) => part.startsWith("http"));
  if (url) return url;
  if (raw.startsWith("/")) return raw;
  return `/assets/images/${raw.replace(/^\.?\//, "")}`;
}

function mapRow(row) {
  const mapped = {};
  for (const [header, cell] of Object.entries(row)) {
    const key = COLUMN_MAP[normalizeHeader(header)] ?? normalizeHeader(header);
    mapped[key] = cell;
  }
  return mapped;
}

function buildProduct(mapped) {
  const name = String(mapped.name ?? "").trim();
  if (!name) return null;

  const listPrice = toNumber(mapped.price);
  const promoPrice = toNumber(mapped.promoPrice ?? mapped.oldPrice);
  if (!listPrice && !promoPrice) return null;

  let sellPrice = listPrice || promoPrice;
  let oldPrice;

  if (promoPrice > 0 && listPrice > 0 && promoPrice < listPrice) {
    sellPrice = promoPrice;
    oldPrice = listPrice;
  } else if (mapped.oldPrice && toNumber(mapped.oldPrice) > sellPrice) {
    oldPrice = toNumber(mapped.oldPrice);
  }

  const product = {
    id: String(mapped.sku ?? mapped.mã_sku ?? "").trim() || undefined,
    name,
    price: formatPrice(sellPrice),
    image: pickImage(mapped.image),
    rating: Math.min(5, Math.max(0, toNumber(mapped.rating, 4.8))),
    reviews: toNumber(mapped.reviews, 0),
    sold: toNumber(mapped.sold, 0),
  };

  if (oldPrice) product.oldPrice = formatPrice(oldPrice);

  const category = String(mapped.category ?? "").trim();
  if (category) product.category = category;

  if (!product.id) {
    product.id = `${name.slice(0, 48)}-${sellPrice}`.replace(/\s+/g, "-");
  }

  return product;
}

if (!fs.existsSync(inputPath)) {
  console.error(`Không tìm thấy file: ${inputPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames.includes("PRODUCTS")
  ? "PRODUCTS"
  : workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

const products = [];
const seenIds = new Set();

for (const row of rows) {
  const product = buildProduct(mapRow(row));
  if (!product) continue;

  let id = product.id;
  let suffix = 1;
  while (seenIds.has(id)) {
    id = `${product.id}-${suffix++}`;
  }
  product.id = id;
  seenIds.add(id);
  products.push(product);
}

if (!products.length) {
  console.error("Không có sản phẩm hợp lệ trong file Excel.");
  process.exit(1);
}

fs.writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
console.log(`Nguồn: ${inputPath}`);
console.log(`Sheet: ${sheetName}`);
console.log(`Đã ghi ${products.length} sản phẩm → ${outputPath}`);
