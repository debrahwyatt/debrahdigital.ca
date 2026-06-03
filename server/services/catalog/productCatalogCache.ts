// server/services/catalog/productCatalogCache.ts

import fs from "fs/promises";
import path from "path";

type IngramProductsFile = {
  lastSyncedAt?: string;
  productCount?: number;
  products: IngramProduct[];
};

type IcecatProductsFile = {
  lastSyncedAt?: string;
  sourceProductCount?: number;
  candidateProductCount?: number;
  checkedProductCount?: number;
  matchedProductCount?: number;
  withImageCount?: number;
  restrictedCount?: number;
  notFoundCount?: number;
  products: IcecatProduct[];
};

type IngramProduct = {
  ingramPartNumber?: string | null;
  vendorPartNumber?: string | null;
  upc?: string | null;

  vendorName?: string | null;
  description?: string | null;
  extraDescription?: string | null;
  fullDescription?: string | null;

  category?: string | null;
  subCategory?: string | null;
  productType?: string | null;
  catalogCategory?: string | null;

  currency?: string | null;
  cost?: number;
  msrp?: number | null;
  sellPrice?: number;
  markupMultiplier?: number;

  available?: boolean;
  totalAvailability?: number;

  imageUrl?: string | null;
  lastSyncedAt?: string | null;

  features?: string[];
  specifications?: {
    name: string;
    value: string;
  }[];

  visible?: boolean;
  authorizedToPurchase?: boolean;
  authorized?: boolean;
  customerAuthorization?: boolean;
  isPriceVisible?: boolean;

  returnable?: boolean;
  acceptBackOrder?: boolean;
};

type IcecatProduct = {
  ingramPartNumber?: string;
  vendorName?: string;
  vendorPartNumber?: string;
  upc?: string;

  matched: boolean;
  restricted: boolean;
  notFound: boolean;

  icecatId?: number | string;
  title?: string;
  brand?: string;
  description?: string;

  imageUrl?: string;
  thumbnailUrl?: string;
  brandLogoUrl?: string;
  galleryUrls?: string[];

  statusCode?: number;
  message?: string;
  matchedBy?: "gtin" | "brand-product-code" | "none";
  lastCheckedAt?: string;
};

export type ProductCatalogProduct = {
  ingramPartNumber: string | null;
  vendorPartNumber: string | null;
  upc: string | null;

  vendorName: string | null;
  description: string | null;
  extraDescription: string | null;
  fullDescription?: string | null;

  category: string | null;
  subCategory: string | null;
  productType: string | null;
  catalogCategory?: string | null;

  currency?: string;
  cost?: number;
  msrp?: number | null;
  sellPrice?: number;
  available?: boolean;
  totalAvailability?: number;

  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  brandLogoUrl?: string | null;
  galleryUrls?: string[];

  lastSyncedAt?: string | null;

  features?: string[];
  specifications?: {
    name: string;
    value: string;
  }[];

  visible?: boolean;

  icecatId?: number | string;
  icecatMatched?: boolean;
  icecatMatchedBy?: string;
  icecatLastCheckedAt?: string | null;
};

type ProductCatalogFile = {
  lastSyncedAt: string;
  productCount: number;

  source: "ingram-plus-icecat";
  ingramLastSyncedAt?: string;
  icecatLastSyncedAt?: string;

  ingramProductCount: number;
  icecatProductCount: number;
  icecatMatchedCount: number;
  icecatWithImageCount: number;

  products: ProductCatalogProduct[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");

const INGRAM_PRODUCTS_PATH = path.join(DATA_DIR, "ingram-products.json");
const ICECAT_PRODUCTS_PATH = path.join(DATA_DIR, "icecat-products.json");
const PRODUCT_CATALOG_PATH = path.join(DATA_DIR, "product-catalog.json");

function cleanString(value?: string | null): string {
  return String(value || "").trim();
}

function cleanHtml(value?: string | null): string {
  return cleanString(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\[[0-9]+\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function getProductPrice(product: IngramProduct): number {
  return Number(product.sellPrice ?? product.msrp ?? product.cost ?? 0);
}

function normalizeVendorName(ingram: IngramProduct, icecat?: IcecatProduct): string | null {
  const icecatBrand = cleanString(icecat?.brand);

  if (icecatBrand) {
    return icecatBrand;
  }

  const vendorName = cleanString(ingram.vendorName);

  if (!vendorName) {
    return null;
  }

  const upperVendorName = vendorName.toUpperCase();

  if (upperVendorName.includes("HP INC") || upperVendorName === "HEWLETT PACKARD") {
    return "HP";
  }

  return vendorName;
}

function getDisplayName(ingram: IngramProduct, icecat?: IcecatProduct): string | null {
  return (
    cleanString(icecat?.title) ||
    cleanString(ingram.extraDescription) ||
    cleanString(ingram.description) ||
    cleanString(ingram.vendorPartNumber) ||
    cleanString(ingram.ingramPartNumber) ||
    null
  );
}

function getExtraDescription(ingram: IngramProduct, icecat?: IcecatProduct): string | null {
  return (
    cleanString(ingram.extraDescription) ||
    cleanString(icecat?.title) ||
    cleanString(ingram.description) ||
    null
  );
}

function getFullDescription(ingram: IngramProduct, icecat?: IcecatProduct): string | null {
  const icecatDescription = cleanHtml(icecat?.description);

  return (
    icecatDescription ||
    cleanString(ingram.fullDescription) ||
    cleanString(ingram.extraDescription) ||
    cleanString(ingram.description) ||
    null
  );
}

function hasValidImage(icecat?: IcecatProduct): boolean {
  return Boolean(icecat?.matched && icecat?.imageUrl);
}

function shouldIncludeProduct(ingram: IngramProduct, icecat?: IcecatProduct): boolean {
  if (!cleanString(ingram.ingramPartNumber)) {
    return false;
  }

  if (ingram.visible === false) {
    return false;
  }

  if (ingram.authorizedToPurchase === false || ingram.authorized === false) {
    return false;
  }

  if (ingram.customerAuthorization === false) {
    return false;
  }

  if (ingram.isPriceVisible === false) {
    return false;
  }

  const price = getProductPrice(ingram);

  if (!Number.isFinite(price) || price <= 0) {
    return false;
  }

  // For the public website catalog, only include products with Icecat images.
  if (!hasValidImage(icecat)) {
    return false;
  }

  return true;
}

function buildIcecatLookup(products: IcecatProduct[]): Map<string, IcecatProduct> {
  const lookup = new Map<string, IcecatProduct>();

  for (const product of products) {
    const ingramPartNumber = cleanString(product.ingramPartNumber);

    if (!ingramPartNumber) {
      continue;
    }

    lookup.set(ingramPartNumber, product);
  }

  return lookup;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function buildProductCatalogCache(): Promise<ProductCatalogFile> {
  console.log("Building product-catalog.json");
  console.log("Reading Ingram products from:", INGRAM_PRODUCTS_PATH);
  console.log("Reading Icecat products from:", ICECAT_PRODUCTS_PATH);
  console.log("Writing product catalog to:", PRODUCT_CATALOG_PATH);

  const ingramFile = await readJsonFile<IngramProductsFile>(INGRAM_PRODUCTS_PATH);
  const icecatFile = await readJsonFile<IcecatProductsFile>(ICECAT_PRODUCTS_PATH);

  const ingramProducts = Array.isArray(ingramFile.products)
    ? ingramFile.products
    : [];

  const icecatProducts = Array.isArray(icecatFile.products)
    ? icecatFile.products
    : [];

  const icecatByIngramPartNumber = buildIcecatLookup(icecatProducts);

  const products: ProductCatalogProduct[] = [];

  for (const ingram of ingramProducts) {
    const ingramPartNumber = cleanString(ingram.ingramPartNumber);
    const icecat = icecatByIngramPartNumber.get(ingramPartNumber);

    if (!shouldIncludeProduct(ingram, icecat)) {
      continue;
    }

    const displayName = getDisplayName(ingram, icecat);
    const fullDescription = getFullDescription(ingram, icecat);
    const vendorName = normalizeVendorName(ingram, icecat);
    const sellPrice = getProductPrice(ingram);

    products.push({
      ingramPartNumber,
      vendorPartNumber: cleanString(ingram.vendorPartNumber) || null,
      upc: cleanString(ingram.upc) || null,

      vendorName,
      description: displayName,
      extraDescription: getExtraDescription(ingram, icecat),
      fullDescription,

      category: cleanString(ingram.category) || null,
      subCategory: cleanString(ingram.subCategory) || null,
      productType: cleanString(ingram.productType) || null,
      catalogCategory: cleanString(ingram.catalogCategory) || null,

      currency: cleanString(ingram.currency) || "CAD",
      cost: ingram.cost,
      msrp: ingram.msrp ?? null,
      sellPrice,

      available: ingram.available === true,
      totalAvailability: Number(ingram.totalAvailability ?? 0),

      imageUrl: icecat?.imageUrl ?? null,
      thumbnailUrl: icecat?.thumbnailUrl ?? null,
      brandLogoUrl: icecat?.brandLogoUrl ?? null,
      galleryUrls: Array.isArray(icecat?.galleryUrls) ? icecat.galleryUrls : [],

      lastSyncedAt: new Date().toISOString(),

      features: Array.isArray(ingram.features) ? ingram.features : [],
      specifications: Array.isArray(ingram.specifications)
        ? ingram.specifications
        : [],

      visible: true,

      icecatId: icecat?.icecatId,
      icecatMatched: icecat?.matched === true,
      icecatMatchedBy: icecat?.matchedBy,
      icecatLastCheckedAt: icecat?.lastCheckedAt ?? null,
    });
  }

  products.sort((a, b) => {
    const aAvailable = a.available ? 1 : 0;
    const bAvailable = b.available ? 1 : 0;

    const aStock = Number(a.totalAvailability ?? 0);
    const bStock = Number(b.totalAvailability ?? 0);

    const aName = a.description ?? "";
    const bName = b.description ?? "";

    return (
      bAvailable - aAvailable ||
      bStock - aStock ||
      aName.localeCompare(bName)
    );
  });

  const output: ProductCatalogFile = {
    lastSyncedAt: new Date().toISOString(),
    productCount: products.length,

    source: "ingram-plus-icecat",
    ingramLastSyncedAt: ingramFile.lastSyncedAt,
    icecatLastSyncedAt: icecatFile.lastSyncedAt,

    ingramProductCount: ingramProducts.length,
    icecatProductCount: icecatProducts.length,
    icecatMatchedCount: icecatProducts.filter((product) => product.matched).length,
    icecatWithImageCount: icecatProducts.filter((product) => Boolean(product.imageUrl)).length,

    products,
  };

  await writeJsonFile(PRODUCT_CATALOG_PATH, output);

  console.log("Product catalog build complete");
  console.log(`Ingram products: ${output.ingramProductCount}`);
  console.log(`Icecat products: ${output.icecatProductCount}`);
  console.log(`Icecat matched: ${output.icecatMatchedCount}`);
  console.log(`Icecat with images: ${output.icecatWithImageCount}`);
  console.log(`Final product catalog products: ${output.productCount}`);
  console.log(`Saved to: ${PRODUCT_CATALOG_PATH}`);

  return output;
}