// server/services/icecat/icecatCatalogCache.ts

import fs from "fs/promises";
import path from "path";
import { lookupIcecatProduct, type IcecatProductContent } from "./icecatClient";

type IngramCatalogFile = {
  lastSyncedAt?: string;
  productCount?: number;
  products: IngramCatalogProduct[];
};

type IngramCatalogProduct = {
  ingramPartNumber?: string;
  vendorPartNumber?: string;
  upc?: string | null;
  vendorName?: string;
  description?: string;
  extraDescription?: string;
  category?: string;
  subCategory?: string;
  productType?: string | null;
  catalogCategory?: string;

  imageUrl?: string | null;
  fullDescription?: string | null;
  features?: unknown[];
  specifications?: unknown[];

  authorizedToPurchase?: boolean;
  hasDiscounts?: boolean;
  isPriceVisible?: boolean;
  customerAuthorization?: boolean;
  visible?: boolean;
  authorized?: boolean;

  extendedVendorPartNumber?: string;
  productStatusCode?: string;
  productStatusMessage?: string | null;
  productClass?: string;
  unitOfMeasure?: string;
  currency?: string;

  cost?: number;
  msrp?: number;
  sellPrice?: number;
  markupMultiplier?: number;

  available?: boolean;
  totalAvailability?: number;

  returnable?: boolean;
  acceptBackOrder?: boolean;
  endUserInfoRequired?: boolean;
  specialBidPricingAvailable?: boolean;
};

type IcecatCatalogFile = {
  lastSyncedAt: string;
  sourceProductCount: number;
  candidateProductCount: number;
  checkedProductCount: number;
  matchedProductCount: number;
  withImageCount: number;
  restrictedCount: number;
  notFoundCount: number;
  products: IcecatProductContent[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const INGRAM_PRODUCTS_PATH = path.join(DATA_DIR, "ingram-products.json");
const ICECAT_OUTPUT_PATH = path.join(DATA_DIR, "icecat-products.json");

function getMaxProducts(): number {
  const value = Number(process.env.ICECAT_MAX_PRODUCTS ?? 50);

  if (!Number.isFinite(value) || value < 0) {
    return 50;
  }

  // 0 means no limit / process all candidates.
  return value;
}

function getDelayMs(): number {
  const value = Number(process.env.ICECAT_REQUEST_DELAY_MS ?? 750);

  if (!Number.isFinite(value) || value < 0) {
    return 750;
  }

  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanString(value?: string | null): string {
  return String(value || "").trim();
}

function getProductPrice(product: IngramCatalogProduct): number {
  return Number(product.sellPrice ?? product.msrp ?? product.cost ?? 0);
}

function getAvailabilityCount(product: IngramCatalogProduct): number {
  return Number(product.totalAvailability ?? 0);
}

function hasBasicLookupData(product: IngramCatalogProduct): boolean {
  const hasUpc = Boolean(cleanString(product.upc));
  const hasBrandAndPart = Boolean(
    cleanString(product.vendorName) && cleanString(product.vendorPartNumber),
  );

  return hasUpc || hasBrandAndPart;
}

function hasSellablePrice(product: IngramCatalogProduct): boolean {
  const price = getProductPrice(product);

  return Number.isFinite(price) && price > 0;
}

function isAvailableForCatalog(product: IngramCatalogProduct): boolean {
  return product.available === true && getAvailabilityCount(product) > 0;
}

function shouldCheckProduct(product: IngramCatalogProduct): boolean {
  if (!hasBasicLookupData(product)) {
    return false;
  }

  if (product.visible === false) {
    return false;
  }

  if (product.authorizedToPurchase === false || product.authorized === false) {
    return false;
  }

  if (!hasSellablePrice(product)) {
    return false;
  }

  // Production catalog rule:
  // Do not spend Icecat calls on products we do not want to offer publicly.
  if (!isAvailableForCatalog(product)) {
    return false;
  }

  return true;
}

function sortBestCandidatesFirst(
  products: IngramCatalogProduct[],
): IngramCatalogProduct[] {
  return [...products].sort((a, b) => {
    const aAvailable = a.available ? 1 : 0;
    const bAvailable = b.available ? 1 : 0;

    const aStock = getAvailabilityCount(a);
    const bStock = getAvailabilityCount(b);

    const aHasUpc = cleanString(a.upc) ? 1 : 0;
    const bHasUpc = cleanString(b.upc) ? 1 : 0;

    const aPrice = getProductPrice(a);
    const bPrice = getProductPrice(b);

    return (
      bAvailable - aAvailable ||
      bStock - aStock ||
      bHasUpc - aHasUpc ||
      aPrice - bPrice
    );
  });
}

async function readIngramCatalog(): Promise<IngramCatalogFile> {
  console.log("Reading Ingram products from:", INGRAM_PRODUCTS_PATH);

  const raw = await fs.readFile(INGRAM_PRODUCTS_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeIcecatCatalog(data: IcecatCatalogFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ICECAT_OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function logCandidateStats(sourceProducts: IngramCatalogProduct[]): void {
  console.log("Icecat DATA_DIR:", DATA_DIR);
  console.log("Reading Ingram products from:", INGRAM_PRODUCTS_PATH);
  console.log("Writing Icecat catalog to:", ICECAT_OUTPUT_PATH);

  if (sourceProducts.length > 0) {
    console.log(
      "First product sample:",
      JSON.stringify(sourceProducts[0], null, 2),
    );
  }

  console.log(
    "Products with lookup data:",
    sourceProducts.filter(hasBasicLookupData).length,
  );

  console.log(
    "Products visible:",
    sourceProducts.filter((product) => product.visible !== false).length,
  );

  console.log(
    "Products authorized:",
    sourceProducts.filter(
      (product) =>
        product.authorizedToPurchase !== false && product.authorized !== false,
    ).length,
  );

  console.log(
    "Products customer authorized:",
    sourceProducts.filter((product) => product.customerAuthorization !== false)
      .length,
  );

  console.log(
    "Products price visible:",
    sourceProducts.filter((product) => product.isPriceVisible !== false).length,
  );

  console.log(
    "Products with sellable price:",
    sourceProducts.filter(hasSellablePrice).length,
  );

  console.log(
    "Products available:",
    sourceProducts.filter(isAvailableForCatalog).length,
  );

  console.log(
    "Products passing shouldCheckProduct:",
    sourceProducts.filter(shouldCheckProduct).length,
  );
}

export async function buildIcecatCatalogCache(): Promise<IcecatCatalogFile> {
  const catalog = await readIngramCatalog();

  const sourceProducts = Array.isArray(catalog.products) ? catalog.products : [];

  logCandidateStats(sourceProducts);

  const allCandidates = sourceProducts.filter(shouldCheckProduct);
  const sortedCandidates = sortBestCandidatesFirst(allCandidates);
  const maxProducts = getMaxProducts();

  const candidates =
    maxProducts === 0
      ? sortedCandidates
      : sortedCandidates.slice(0, maxProducts);

  console.log("Icecat enrichment starting");
  console.log(`Source products: ${sourceProducts.length}`);
  console.log(`Candidate products total: ${allCandidates.length}`);
  console.log(
    `ICECAT_MAX_PRODUCTS: ${
      maxProducts === 0 ? "0 (all candidates)" : maxProducts
    }`,
  );
  console.log(`Candidates this run: ${candidates.length}`);

  const results: IcecatProductContent[] = [];

  for (let index = 0; index < candidates.length; index++) {
    const product = candidates[index];

    const label = [
      product.vendorName || "Unknown",
      product.vendorPartNumber || product.upc || "",
      product.description || "",
    ]
      .filter(Boolean)
      .join(" | ");

    console.log(`[${index + 1}/${candidates.length}] Checking ${label}`);

    try {
      const result = await lookupIcecatProduct({
        ingramPartNumber: product.ingramPartNumber,
        vendorName: product.vendorName || "",
        vendorPartNumber: product.vendorPartNumber || "",
        upc: product.upc || undefined,
        description: product.description || product.extraDescription,
      });

      results.push(result);

      if (result.matched) {
        console.log(`  MATCH: ${result.title || result.imageUrl}`);
      } else if (result.restricted) {
        console.log(`  RESTRICTED: ${result.message}`);
      } else if (result.notFound) {
        console.log(`  NOT FOUND: ${result.message}`);
      } else {
        console.log(`  NO MATCH: ${result.message}`);
      }
    } catch (error) {
      console.error(`  ERROR: ${label}`, error);

      results.push({
        ingramPartNumber: product.ingramPartNumber,
        vendorName: product.vendorName || "",
        vendorPartNumber: product.vendorPartNumber || "",
        upc: product.upc || undefined,

        matched: false,
        restricted: false,
        notFound: false,

        galleryUrls: [],
        statusCode: 0,
        message: error instanceof Error ? error.message : "Unknown error",

        matchedBy: "none",
        lastCheckedAt: new Date().toISOString(),
      });
    }

    await sleep(getDelayMs());
  }

  const output: IcecatCatalogFile = {
    lastSyncedAt: new Date().toISOString(),
    sourceProductCount: sourceProducts.length,
    candidateProductCount: allCandidates.length,
    checkedProductCount: results.length,
    matchedProductCount: results.filter((item) => item.matched).length,
    withImageCount: results.filter((item) => Boolean(item.imageUrl)).length,
    restrictedCount: results.filter((item) => item.restricted).length,
    notFoundCount: results.filter((item) => item.notFound).length,
    products: results,
  };

  await writeIcecatCatalog(output);

  console.log("Icecat enrichment complete");
  console.log(`Source products: ${output.sourceProductCount}`);
  console.log(`Candidate products: ${output.candidateProductCount}`);
  console.log(`Checked: ${output.checkedProductCount}`);
  console.log(`Matched: ${output.matchedProductCount}`);
  console.log(`With images: ${output.withImageCount}`);
  console.log(`Restricted: ${output.restrictedCount}`);
  console.log(`Not found: ${output.notFoundCount}`);
  console.log(`Saved to: ${ICECAT_OUTPUT_PATH}`);

  return output;
}