// server/services/icecat/icecatClient.ts

export type IcecatLookupInput = {
  vendorName: string;
  vendorPartNumber: string;
  upc?: string;
  ingramPartNumber?: string;
  description?: string;
};

export type IcecatProductContent = {
  ingramPartNumber?: string;
  vendorName: string;
  vendorPartNumber: string;
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
  galleryUrls: string[];

  statusCode?: number;
  message?: string;

  matchedBy: "gtin" | "brand-product-code" | "none";
  lastCheckedAt: string;
};

const ICECAT_BASE_URL = "https://live.icecat.biz/api/";

function getUsername(): string {
  const username = process.env.ICECAT_USERNAME;

  if (!username) {
    throw new Error("Missing ICECAT_USERNAME in .env");
  }

  return username;
}

function getLanguage(): string {
  return process.env.ICECAT_LANGUAGE || "en";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value?: string): string {
  return String(value || "").trim();
}

function normalizeBrand(value: string): string {
  const brand = cleanText(value);

  const upper = brand.toUpperCase();

  if (upper === "HEWLETT PACKARD" || upper === "HEWLETT-PACKARD") {
    return "HP";
  }

  if (upper === "LENOVO GROUP LIMITED") {
    return "Lenovo";
  }

  return brand;
}

function buildUrl(params: Record<string, string>): string {
  const url = new URL(ICECAT_BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function fetchIcecatJson(url: string): Promise<any> {
  const response = await fetch(url);
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      StatusCode: response.status,
      Code: response.status,
      Error: "Invalid JSON",
      Message: text.slice(0, 500),
    };
  }
}

function pickImageFromImageObject(image: any): string | undefined {
  return (
    image?.Pic500x500 ||
    image?.HighPic ||
    image?.Pic ||
    image?.LowPic ||
    image?.ThumbPic ||
    undefined
  );
}

function pickThumbnailFromImageObject(image: any): string | undefined {
  return (
    image?.ThumbPic ||
    image?.LowPic ||
    image?.Pic500x500 ||
    image?.HighPic ||
    image?.Pic ||
    undefined
  );
}

function extractGalleryUrls(data: any): string[] {
  const gallery = Array.isArray(data?.Gallery) ? data.Gallery : [];

  return gallery
    .map((item: any) => {
      return (
        item?.Pic500x500 ||
        item?.HighPic ||
        item?.Pic ||
        item?.LowPic ||
        item?.ThumbPic ||
        undefined
      );
    })
    .filter(Boolean);
}

function parseIcecatResponse(
  json: any,
  input: IcecatLookupInput,
  matchedBy: "gtin" | "brand-product-code"
): IcecatProductContent {
  const now = new Date().toISOString();

  if (json?.msg === "OK" && json?.data) {
    const data = json.data;
    const imageUrl = pickImageFromImageObject(data?.Image);
    const thumbnailUrl = pickThumbnailFromImageObject(data?.Image);
    const galleryUrls = extractGalleryUrls(data);

    return {
      ingramPartNumber: input.ingramPartNumber,
      vendorName: input.vendorName,
      vendorPartNumber: input.vendorPartNumber,
      upc: input.upc,

      matched: Boolean(imageUrl || galleryUrls.length > 0),
      restricted: false,
      notFound: false,

      icecatId: data?.GeneralInfo?.IcecatId,
      title: data?.GeneralInfo?.Title,
      brand: data?.GeneralInfo?.Brand,
      description:
        data?.GeneralInfo?.Description?.LongDesc ||
        data?.GeneralInfo?.Description?.ShortDesc ||
        undefined,

      imageUrl: imageUrl || galleryUrls[0],
      thumbnailUrl: thumbnailUrl || imageUrl || galleryUrls[0],
      brandLogoUrl: data?.GeneralInfo?.BrandLogo,
      galleryUrls,

      statusCode: 200,
      message: "OK",

      matchedBy,
      lastCheckedAt: now,
    };
  }

  const statusCode = Number(json?.StatusCode || json?.Code || 0);
  const message = json?.Message || json?.Error || "Unknown Icecat response";

  return {
    ingramPartNumber: input.ingramPartNumber,
    vendorName: input.vendorName,
    vendorPartNumber: input.vendorPartNumber,
    upc: input.upc,

    matched: false,
    restricted: statusCode === 14,
    notFound: statusCode === 15 || Number(json?.Code) === 404,

    galleryUrls: [],

    statusCode,
    message,

    matchedBy: "none",
    lastCheckedAt: now,
  };
}

export async function lookupIcecatProduct(
  input: IcecatLookupInput
): Promise<IcecatProductContent> {
  const username = getUsername();
  const language = getLanguage();

  const upc = cleanText(input.upc);
  const brand = normalizeBrand(input.vendorName);
  const productCode = cleanText(input.vendorPartNumber);

  // Try UPC/GTIN first when available.
  if (upc) {
    const gtinUrl = buildUrl({
      UserName: username,
      Language: language,
      GTIN: upc,
    });

    const gtinJson = await fetchIcecatJson(gtinUrl);
    const gtinResult = parseIcecatResponse(gtinJson, input, "gtin");

    if (gtinResult.matched) {
      return gtinResult;
    }

    // If GTIN says restricted, keep that result instead of doing noisy retries.
    if (gtinResult.restricted) {
      return gtinResult;
    }

    await sleep(250);
  }

  // Fallback to Brand + ProductCode.
  if (brand && productCode) {
    const productCodeUrl = buildUrl({
      UserName: username,
      Language: language,
      Brand: brand,
      ProductCode: productCode,
    });

    const productCodeJson = await fetchIcecatJson(productCodeUrl);
    return parseIcecatResponse(productCodeJson, input, "brand-product-code");
  }

  return {
    ingramPartNumber: input.ingramPartNumber,
    vendorName: input.vendorName,
    vendorPartNumber: input.vendorPartNumber,
    upc: input.upc,

    matched: false,
    restricted: false,
    notFound: true,

    galleryUrls: [],
    statusCode: 0,
    message: "Missing UPC and/or brand + product code",

    matchedBy: "none",
    lastCheckedAt: new Date().toISOString(),
  };
}