/**
 * Import product data from Excel into data/products.json.
 *
 * Supported inputs:
 * - TikTok Shop workbook with Products and Variants sheets.
 * - Simple/custom product sheet with columns such as name, price, image, sku.
 *
 * Usage:
 *   npm run import:products
 *   npm run import:products -- tiktok-shop-export.xlsx
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const defaultInput = path.join(root, "tiktok-shop-export.xlsx");
const fallbackInput = path.join(root, "data", "san-pham.xlsx");
const outputPath = path.join(root, "data", "products.json");

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : fs.existsSync(defaultInput)
    ? defaultInput
    : fallbackInput;

const DONG = "\u0111";

const SIMPLE_COLUMN_MAP = {
  ten: "name",
  ten_san_pham: "name",
  name: "name",
  title: "name",

  gia: "price",
  gia_ban: "price",
  price: "price",
  min_price: "price",

  gia_cu: "oldPrice",
  gia_khuyen_mai: "promoPrice",
  original_price: "oldPrice",
  oldprice: "oldPrice",

  anh: "image",
  anh_san_pham: "image",
  image: "image",
  main_image_url: "image",

  mo_ta: "description",
  description: "description",

  danh_gia: "rating",
  rating: "rating",

  so_danh_gia: "reviews",
  reviews: "reviews",

  da_ban: "sold",
  sold: "sold",

  danh_muc_san_pham: "category",
  category: "category",
  brand: "brand",
  ma_sku: "sku",
  sku: "sku",
  product_id: "id",
  product_url: "productUrl",
};

const BRAND_PATTERNS = [
  "Royal Canin",
  "SmartHeart",
  "Nutrience",
  "Ganador",
  "Maxwell",
  "Minino",
  "Whiskas",
  "Pedigree",
  "Me-O",
  "PetChoice",
  "PetQ",
  "S2PET",
  "Lapaw",
  "Catee",
  "Citycat",
  "Snappy Tom",
  "Refine",
  "JerHigh",
  "BNP",
  "Catsrang",
  "Kucinta",
  "Zenith",
  "Monge",
  "Taste Of The Wild",
  "Brit",
  "Tropiclean",
];

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

function normalizeSearch(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d");
}

function toNumber(value, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return fallback;
  const n = Number(digits);
  return Number.isFinite(n) ? n : fallback;
}

function formatPrice(value) {
  const amount = toNumber(value);
  return amount ? `${amount.toLocaleString("vi-VN")}${DONG}` : "";
}

function splitUrls(value) {
  return Array.from(
    new Set(
      String(value ?? "")
        .split(/\r?\n|[|,]/)
        .map((part) => part.trim())
        .filter((part) => /^https?:\/\//i.test(part)),
    ),
  );
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function descriptionToHtml(value) {
  return cleanText(value).replace(/\n/g, "<br>");
}

function inferBrand(...values) {
  const haystack = normalizeSearch(values.join(" "));
  const brand = BRAND_PATTERNS.find((item) => haystack.includes(normalizeSearch(item)));
  return brand ?? "3F Store";
}

function inferCategory(product) {
  const text = normalizeSearch(`${product.title ?? ""} ${product.description ?? ""}`);

  const isCat = /\bmeo\b/.test(text);
  const isDog = /\bcho\b/.test(text) && !/\bcho meo\b/.test(text);
  const pet = isCat ? "mèo" : isDog ? "chó" : "thú cưng";

  if (text.includes("cat") || text.includes("ve sinh") || text.includes("khay") || text.includes("bon ve sinh")) {
    return "Chăm Sóc Thú Cưng > Vệ sinh cho thú cưng";
  }

  if (text.includes("pate") || text.includes("sup") || text.includes("soup") || text.includes("snack") || text.includes("thuong")) {
    return `Thức Ăn Thú Cưng > Pate & Snack cho ${pet}`;
  }

  if (text.includes("sua") || text.includes("dinh duong")) {
    return `Thức Ăn Thú Cưng > Sữa & dinh dưỡng cho ${pet}`;
  }

  if (text.includes("hat") || text.includes("thuc an kho") || text.includes("food")) {
    return `Thức Ăn Thú Cưng > Thức ăn khô cho ${pet}`;
  }

  if (text.includes("do choi") || text.includes("phu kien") || text.includes("cao mong")) {
    return "Phụ Kiện Thú Cưng > Đồ chơi & phụ kiện";
  }

  return "Sản phẩm thú cưng";
}

function mapSimpleRow(row) {
  const mapped = {};
  for (const [header, cell] of Object.entries(row)) {
    const key = SIMPLE_COLUMN_MAP[normalizeHeader(header)] ?? normalizeHeader(header);
    mapped[key] = cell;
  }
  return mapped;
}

function buildSimpleProduct(mapped) {
  const name = cleanText(mapped.name);
  if (!name) return null;

  const sellPrice = toNumber(mapped.price) || toNumber(mapped.promoPrice) || toNumber(mapped.oldPrice);
  if (!sellPrice) return null;

  const oldPriceNumber = toNumber(mapped.oldPrice);
  const images = splitUrls(mapped.image);
  const image = images[0] || cleanText(mapped.image) || "/assets/images/dog-food.webp";

  const product = {
    id: cleanText(mapped.id ?? mapped.sku) || `${name.slice(0, 48)}-${sellPrice}`.replace(/\s+/g, "-"),
    name,
    category: cleanText(mapped.category) || inferCategory({ title: name, description: mapped.description }),
    description: descriptionToHtml(mapped.description),
    brand: cleanText(mapped.brand) || inferBrand(name, mapped.description),
    image,
    images: images.length ? images : [image],
    rating: Math.min(5, Math.max(0, toNumber(mapped.rating, 4.8))),
    reviews: toNumber(mapped.reviews, 0),
    sold: toNumber(mapped.sold, 0),
    price: formatPrice(sellPrice),
  };

  if (oldPriceNumber > sellPrice) product.oldPrice = formatPrice(oldPriceNumber);
  if (mapped.productUrl) product.productUrl = cleanText(mapped.productUrl);

  return product;
}

function buildTikTokProducts(workbook) {
  const productRows = XLSX.utils.sheet_to_json(workbook.Sheets.Products, { defval: "" });
  const variantRows = XLSX.utils.sheet_to_json(workbook.Sheets.Variants, { defval: "" });

  const variantsByProduct = new Map();
  for (const row of variantRows) {
    const productId = cleanText(row.product_id);
    if (!productId) continue;
    if (!variantsByProduct.has(productId)) variantsByProduct.set(productId, []);
    variantsByProduct.get(productId).push(row);
  }

  return productRows
    .map((row) => {
      const id = cleanText(row.product_id);
      const name = cleanText(row.title);
      if (!id || !name) return null;

      const productImages = splitUrls(row.image_urls);
      const mainImage = cleanText(row.main_image_url) || productImages[0] || "/assets/images/dog-food.webp";
      const rows = variantsByProduct.get(id) ?? [];
      const variantImages = splitUrls(rows.map((variant) => variant.image_url).filter(Boolean).join("\n"));
      const images = Array.from(new Set([mainImage, ...productImages, ...variantImages].filter(Boolean)));

      const variants = rows
        .map((variant, index) => {
          const price = toNumber(variant.price);
          const originalPrice = toNumber(variant.original_price);
          if (!price) return null;

          const labelParts = [
            variant.option_1_value,
            variant.option_2_value,
            variant.option_3_value,
          ]
            .map(cleanText)
            .filter(Boolean);

          const label = labelParts.join(" - ") || cleanText(variant.sku_name) || `Phân loại ${index + 1}`;
          const variantImage = cleanText(variant.image_url) || mainImage;
          const item = {
            id: cleanText(variant.sku_id) || `${id}-${index}`,
            sku: cleanText(variant.sku_name),
            label,
            price: formatPrice(price),
            image: variantImage,
            stock: toNumber(variant.stock, 0),
          };

          if (originalPrice > price) item.oldPrice = formatPrice(originalPrice);
          return item;
        })
        .filter(Boolean);

      const variantPrices = variants.map((variant) => toNumber(variant.price)).filter(Boolean);
      const minPrice = Math.min(...variantPrices, toNumber(row.min_price));
      const discountedVariant = variants.find((variant) => variant.oldPrice);

      const product = {
        id,
        name,
        category: inferCategory(row),
        description: descriptionToHtml(row.description),
        brand: inferBrand(name, row.description),
        image: mainImage,
        images,
        rating: 4.8,
        reviews: 0,
        sold: 0,
        productUrl: cleanText(row.product_url),
        tiktokUrl: cleanText(row.product_url),
        source: "tiktok-shop",
        sellerId: cleanText(row.seller_id),
        currency: cleanText(row.currency) || "VND",
        price: formatPrice(minPrice || row.min_price),
        variants,
      };

      if (discountedVariant) product.oldPrice = discountedVariant.oldPrice;
      return product;
    })
    .filter(Boolean);
}

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);
const sheetNames = new Set(workbook.SheetNames);
const isTikTokWorkbook = sheetNames.has("Products") && sheetNames.has("Variants");

const products = isTikTokWorkbook
  ? buildTikTokProducts(workbook)
  : XLSX.utils
      .sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" })
      .map((row) => buildSimpleProduct(mapSimpleRow(row)))
      .filter(Boolean);

if (!products.length) {
  console.error("No valid products found in the Excel file.");
  process.exit(1);
}

const seenIds = new Set();
for (const product of products) {
  const baseId = product.id;
  let id = baseId;
  let suffix = 1;
  while (seenIds.has(id)) id = `${baseId}-${suffix++}`;
  product.id = id;
  seenIds.add(id);
}

fs.writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");

console.log(`Source: ${inputPath}`);
console.log(`Format: ${isTikTokWorkbook ? "TikTok Shop workbook" : "Generic workbook"}`);
console.log(`Products: ${products.length}`);
console.log(`Variants: ${products.reduce((sum, product) => sum + (product.variants?.length ?? 0), 0)}`);
console.log(`Wrote: ${outputPath}`);
