/**
 * Import data/products.json into the 3F MySQL product catalog.
 *
 * Usage:
 *   node scripts/import-products-json-to-mysql.mjs
 *   npm run import:products:mysql
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PRODUCTS_JSON = path.join(ROOT, "data", "products.json");
const SCHEMA_SQL = path.join(ROOT, "3f-api", "database", "product_catalog_schema.sql");
const SOURCE_PLATFORM = "tiktok_shop";
const SOURCE_FILE = "data/products.json";

let mysql;
try {
  mysql = await import("mysql2/promise");
} catch {
  console.error("Missing dependency: mysql2. Run `npm install mysql2` before importing products into MySQL.");
  process.exit(1);
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rest] = trimmed.split("=");
    const key = rawKey.trim();
    let value = rest.join("=").trim();
    value = value.replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

function getDbConfig() {
  const env = {
    ...readEnvFile(path.join(ROOT, ".env")),
    ...readEnvFile(path.join(ROOT, ".deploy.env")),
    ...readEnvFile(path.join(ROOT, "3f-api", ".env")),
    ...process.env,
  };

  return {
    host: env.DB_HOST || "localhost",
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || env.DB_USERNAME || "3f_user",
    password: env.DB_PASS ?? env.DB_PASSWORD ?? "0932368720Ab",
    database: env.DB_NAME || "3f",
    charset: env.DB_CHARSET || "utf8mb4",
    multipleStatements: false,
  };
}

function splitSql(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function slugify(value, fallback = "item") {
  const slug = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || fallback;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function priceToNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function getImages(product) {
  const images = Array.isArray(product.images) ? product.images : product.imageUrls;
  return Array.from(new Set([product.image, product.mainImageUrl, ...(Array.isArray(images) ? images : [])].filter(Boolean)));
}

function inferPetType(product) {
  const text = slugify(`${product.category ?? ""} ${product.name ?? ""}`);
  if (text.includes("meo")) return "cat";
  if (text.includes("cho")) return "dog";
  return "all";
}

function inferProductType(product) {
  const text = slugify(`${product.category ?? ""} ${product.name ?? ""}`);
  if (text.includes("ve-sinh") || text.includes("cat-dau") || text.includes("cat-ve-sinh")) return "hygiene";
  if (text.includes("pate") || text.includes("snack") || text.includes("sup") || text.includes("soup")) return "pate_snack";
  if (text.includes("sua") || text.includes("dinh-duong")) return "nutrition";
  if (text.includes("hat") || text.includes("thuc-an-kho")) return "dry_food";
  if (text.includes("phu-kien") || text.includes("do-choi")) return "accessory";
  return "pet_product";
}

function shortDescriptionFrom(description) {
  return cleanText(description)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 500);
}

function variantLabel(variant) {
  return cleanText(variant.variantName || variant.label || variant.sku || variant.id || "Phân loại");
}

function parseVariantOptions(label) {
  const parts = variantLabel({ label }).split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  return [
    { name: parts[0] ? "Phân loại" : null, value: parts[0] || null },
    { name: parts[1] ? "Thông số" : null, value: parts[1] || null },
    { name: parts[2] ? "Tùy chọn" : null, value: parts.slice(2).join(" - ") || null },
  ];
}

async function ensureDatabase(config) {
  const server = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    charset: config.charset,
  });
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();
}

async function ensureSchema(db) {
  const schema = fs.readFileSync(SCHEMA_SQL, "utf8");
  for (const statement of splitSql(schema)) {
    await db.query(statement);
  }
}

async function createBatch(db, products) {
  const totalVariants = products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
  const [result] = await db.execute(
    `INSERT INTO product_import_batches (source_platform, source_file, total_products, total_variants)
     VALUES (?, ?, ?, ?)`,
    [SOURCE_PLATFORM, SOURCE_FILE, products.length, totalVariants],
  );
  return result.insertId;
}

async function finishBatch(db, batchId, status, stats) {
  await db.execute(
    `UPDATE product_import_batches
     SET status = ?, products_created = ?, products_updated = ?, variants_created = ?,
         variants_updated = ?, images_created = ?, error_count = ?, summary_json = ?, finished_at = NOW()
     WHERE id = ?`,
    [
      status,
      stats.productsCreated,
      stats.productsUpdated,
      stats.variantsCreated,
      stats.variantsUpdated,
      stats.imagesCreated,
      stats.errors.length,
      JSON.stringify(stats),
      batchId,
    ],
  );
}

async function logRow(db, batchId, row) {
  await db.execute(
    `INSERT INTO product_import_rows
      (batch_id, source_product_id, source_sku_id, row_type, action, status, message, raw_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      batchId,
      row.sourceProductId || null,
      row.sourceSkuId || null,
      row.rowType || "product",
      row.action || null,
      row.status || "success",
      row.message || null,
      row.raw ? JSON.stringify(row.raw) : null,
    ],
  );
}

async function upsertCategoryPath(db, categoryText) {
  const parts = cleanText(categoryText || "Sản phẩm thú cưng")
    .split(">")
    .map((part) => part.trim())
    .filter(Boolean);

  let parentId = null;
  let fullPath = "";
  let categoryId = null;

  for (let i = 0; i < parts.length; i += 1) {
    const name = parts[i];
    fullPath = fullPath ? `${fullPath}-${name}` : name;
    const slug = slugify(fullPath, `category-${i + 1}`);
    await db.execute(
      `INSERT INTO product_categories (parent_id, name, slug, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name), parent_id = VALUES(parent_id), is_active = 1`,
      [parentId, name, slug, i],
    );
    const [rows] = await db.execute("SELECT id FROM product_categories WHERE slug = ? LIMIT 1", [slug]);
    categoryId = rows[0].id;
    parentId = categoryId;
  }

  return categoryId;
}

async function upsertProduct(db, product, categoryId) {
  const sourceProductId = cleanText(product.sourceProductId || product.tiktokProductId || product.id);
  const images = getImages(product);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const prices = variants.map((variant) => priceToNumber(variant.price)).filter((price) => price > 0);
  const minPrice = priceToNumber(product.minPrice || product.price) || Math.min(...prices);
  const maxPrice = priceToNumber(product.maxPrice) || Math.max(minPrice, ...prices);
  const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.stockQuantity ?? 0), 0);
  const slug = slugify(product.slug || `${product.name}-${sourceProductId}`, `product-${sourceProductId}`);
  const petType = product.petType || inferPetType(product);
  const productType = product.productType || inferProductType(product);

  const [existing] = await db.execute(
    "SELECT id FROM products WHERE source_platform = ? AND source_product_id = ? LIMIT 1",
    [SOURCE_PLATFORM, sourceProductId],
  );

  const [result] = await db.execute(
    `INSERT INTO products (
      source_platform, source_product_id, source_seller_id, source_product_url, source_file,
      category_id, name, slug, short_description, description, brand, pet_type, product_type,
      main_image_url, image_urls_json, image_count, min_price, max_price, currency, total_stock,
      sold_count, rating_average, review_count, is_imported, imported_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW()
    )
    ON DUPLICATE KEY UPDATE
      source_seller_id = VALUES(source_seller_id),
      source_product_url = VALUES(source_product_url),
      source_file = VALUES(source_file),
      category_id = VALUES(category_id),
      name = VALUES(name),
      short_description = VALUES(short_description),
      description = VALUES(description),
      brand = VALUES(brand),
      pet_type = VALUES(pet_type),
      product_type = VALUES(product_type),
      main_image_url = VALUES(main_image_url),
      image_urls_json = VALUES(image_urls_json),
      image_count = VALUES(image_count),
      min_price = VALUES(min_price),
      max_price = VALUES(max_price),
      currency = VALUES(currency),
      total_stock = VALUES(total_stock),
      sold_count = VALUES(sold_count),
      rating_average = VALUES(rating_average),
      review_count = VALUES(review_count),
      imported_at = NOW()`,
    [
      SOURCE_PLATFORM,
      sourceProductId,
      product.sellerId || product.sourceSellerId || null,
      product.tiktokUrl || product.productUrl || product.sourceProductUrl || null,
      SOURCE_FILE,
      categoryId,
      cleanText(product.title || product.name),
      slug,
      product.shortDescription || shortDescriptionFrom(product.description),
      product.description || null,
      product.brand || null,
      petType,
      productType,
      product.mainImageUrl || product.image || images[0] || null,
      JSON.stringify(images),
      images.length,
      minPrice,
      maxPrice,
      product.currency || "VND",
      totalStock,
      Number(product.soldCount ?? product.sold ?? 0),
      Number(product.ratingAverage ?? product.rating ?? 4.8),
      Number(product.reviewCount ?? product.reviews ?? 0),
    ],
  );

  const productId = existing.length ? existing[0].id : result.insertId;
  return {
    productId,
    sourceProductId,
    action: existing.length ? "updated" : "created",
    images,
  };
}

async function upsertVariant(db, productId, sourceProductId, variant, index, productImage) {
  const sourceSkuId = cleanText(variant.sourceSkuId || variant.skuId || variant.id || `${sourceProductId}-${index}`);
  const label = variantLabel(variant);
  const options = parseVariantOptions(label);
  const attributes = {
    label,
    options: options.filter((option) => option.name && option.value),
  };
  const price = priceToNumber(variant.price);
  const originalPrice = priceToNumber(variant.originalPrice || variant.oldPrice || variant.oldPriceText);

  const [existing] = await db.execute(
    "SELECT id FROM product_variants WHERE source_platform = ? AND source_sku_id = ? LIMIT 1",
    [SOURCE_PLATFORM, sourceSkuId],
  );

  const [result] = await db.execute(
    `INSERT INTO product_variants (
      product_id, source_platform, source_product_id, source_sku_id, sku, variant_name,
      option_1_name, option_1_value, option_2_name, option_2_value, option_3_name, option_3_value,
      attributes_json, price, original_price, currency, stock_quantity, warehouse_id, image_url,
      variant_image_status, imported_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
    )
    ON DUPLICATE KEY UPDATE
      product_id = VALUES(product_id),
      source_product_id = VALUES(source_product_id),
      sku = VALUES(sku),
      variant_name = VALUES(variant_name),
      option_1_name = VALUES(option_1_name),
      option_1_value = VALUES(option_1_value),
      option_2_name = VALUES(option_2_name),
      option_2_value = VALUES(option_2_value),
      option_3_name = VALUES(option_3_name),
      option_3_value = VALUES(option_3_value),
      attributes_json = VALUES(attributes_json),
      price = VALUES(price),
      original_price = VALUES(original_price),
      currency = VALUES(currency),
      stock_quantity = VALUES(stock_quantity),
      warehouse_id = VALUES(warehouse_id),
      image_url = VALUES(image_url),
      variant_image_status = VALUES(variant_image_status),
      imported_at = NOW()`,
    [
      productId,
      SOURCE_PLATFORM,
      sourceProductId,
      sourceSkuId,
      variant.sku || variant.skuName || null,
      label,
      options[0].name,
      options[0].value,
      options[1].name,
      options[1].value,
      options[2].name,
      options[2].value,
      JSON.stringify(attributes),
      price,
      originalPrice > price ? originalPrice : null,
      variant.currency || "VND",
      Number(variant.stock ?? variant.stockQuantity ?? 0),
      variant.warehouseId || null,
      variant.imageUrl || variant.image || productImage || null,
      variant.variantImageStatus || null,
    ],
  );

  return {
    variantId: existing.length ? existing[0].id : result.insertId,
    sourceSkuId,
    action: existing.length ? "updated" : "created",
    imageUrl: variant.imageUrl || variant.image || productImage || null,
  };
}

async function upsertImage(db, productId, imageUrl, options = {}) {
  if (!imageUrl) return false;
  const [existing] = await db.execute(
    "SELECT id FROM product_images WHERE product_id = ? AND image_url = ? LIMIT 1",
    [productId, imageUrl],
  );
  await db.execute(
    `INSERT INTO product_images
      (product_id, variant_id, image_url, image_type, is_main, sort_order, source_platform)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      variant_id = COALESCE(VALUES(variant_id), variant_id),
      image_type = VALUES(image_type),
      is_main = GREATEST(is_main, VALUES(is_main)),
      sort_order = LEAST(sort_order, VALUES(sort_order))`,
    [
      productId,
      options.variantId || null,
      imageUrl,
      options.imageType || "product",
      options.isMain ? 1 : 0,
      options.sortOrder || 0,
      SOURCE_PLATFORM,
    ],
  );
  return existing.length === 0;
}

async function main() {
  if (!fs.existsSync(PRODUCTS_JSON)) {
    throw new Error(`Missing products JSON: ${PRODUCTS_JSON}`);
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"));
  const config = getDbConfig();
  await ensureDatabase(config);

  const db = await mysql.createConnection(config);
  await ensureSchema(db);

  const stats = {
    productsCreated: 0,
    productsUpdated: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    imagesCreated: 0,
    errors: [],
  };

  const batchId = await createBatch(db, products);

  try {
    for (const product of products) {
      try {
        const categoryId = await upsertCategoryPath(db, product.category);
        const productResult = await upsertProduct(db, product, categoryId);
        if (productResult.action === "created") stats.productsCreated += 1;
        else stats.productsUpdated += 1;

        await logRow(db, batchId, {
          sourceProductId: productResult.sourceProductId,
          rowType: "product",
          action: productResult.action,
          raw: product,
        });

        for (let i = 0; i < productResult.images.length; i += 1) {
          const created = await upsertImage(db, productResult.productId, productResult.images[i], {
            isMain: i === 0,
            sortOrder: i,
            imageType: i === 0 ? "main" : "gallery",
          });
          if (created) stats.imagesCreated += 1;
        }

        const variants = Array.isArray(product.variants) ? product.variants : [];
        for (let i = 0; i < variants.length; i += 1) {
          const variantResult = await upsertVariant(
            db,
            productResult.productId,
            productResult.sourceProductId,
            variants[i],
            i,
            productResult.images[0],
          );
          if (variantResult.action === "created") stats.variantsCreated += 1;
          else stats.variantsUpdated += 1;

          await logRow(db, batchId, {
            sourceProductId: productResult.sourceProductId,
            sourceSkuId: variantResult.sourceSkuId,
            rowType: "variant",
            action: variantResult.action,
            raw: variants[i],
          });

          const created = await upsertImage(db, productResult.productId, variantResult.imageUrl, {
            variantId: variantResult.variantId,
            imageType: "variant",
            sortOrder: 1000 + i,
          });
          if (created) stats.imagesCreated += 1;
        }
      } catch (error) {
        stats.errors.push({
          sourceProductId: product.id || product.sourceProductId,
          message: error.message,
        });
        await logRow(db, batchId, {
          sourceProductId: product.id || product.sourceProductId,
          rowType: "product",
          status: "error",
          message: error.message,
          raw: product,
        });
      }
    }

    await finishBatch(db, batchId, stats.errors.length ? "completed_with_errors" : "completed", stats);
  } catch (error) {
    stats.errors.push({ message: error.message });
    await finishBatch(db, batchId, "failed", stats);
    throw error;
  } finally {
    await db.end();
  }

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
