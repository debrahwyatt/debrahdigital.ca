import { getIngramToken } from './ingramAuth'
import {
  buildIngramUrl,
  getIngramHeaders,
  parseIngramResponse,
} from './ingramClient'

import type {
  IngramCatalogSearchItem,
  IngramPriceAvailabilityItem,
  IngramPriceAvailabilityResponse,
  IngramSearchResponse,
  NormalizedIngramProduct,
  NormalizedIngramSearchProduct,
} from '../../types/ingram'

import { toNumber } from '../../utils/numbers'
import {
  calculateSellPrice,
  DEFAULT_MARKUP_MULTIPLIER,
} from '../../utils/pricing'

export type SearchIngramProductsOptions = {
  keyword?: string
  pageNumber?: string | number
  pageSize?: string | number
  type?: 'IM::physical' | 'IM::digital' | 'IM::any' | 'IM::subscription'
}

export const normalizeIngramSearchProduct = (
  item: IngramCatalogSearchItem,
): NormalizedIngramSearchProduct => {
  return {
    ingramPartNumber: item.ingramPartNumber ?? null,
    vendorPartNumber: item.vendorPartNumber ?? null,
    upc: item.upcCode ?? item.upc ?? null,

    vendorName: item.vendorName ?? null,
    description: item.description ?? null,
    extraDescription: item.extraDescription ?? null,

    category: item.category ?? null,
    subCategory: item.subCategory ?? null,
    productType: item.productType ?? null,

    authorizedToPurchase:
      item.authorizedToPurchase === true ||
      item.authorizedToPurchase === 'True',

    hasDiscounts:
      item.hasDiscounts === true ||
      item.hasDiscounts === 'True',

    isPriceVisible: Boolean(item.isPriceVisible),
    customerAuthorization: Boolean(item.customerAuthorization),

    links: item.links ?? [],
  }
}

export const normalizePriceAvailabilityItem = (
  item: IngramPriceAvailabilityItem,
): NormalizedIngramProduct => {
  const cost = toNumber(item.pricing?.customerPrice)

  const msrp =
    item.pricing?.retailPrice != null
      ? toNumber(item.pricing.retailPrice)
      : null

  const sellPrice = calculateSellPrice(cost, msrp)

  return {
    ingramPartNumber: item.ingramPartNumber ?? null,
    vendorPartNumber: item.vendorPartNumber ?? null,
    extendedVendorPartNumber: item.extendedVendorPartNumber ?? null,
    upc: item.upc ?? null,

    vendorName: item.vendorName ?? null,
    description: item.description ?? null,

    productStatusCode: item.productStatusCode ?? null,
    productStatusMessage: item.productStatusMessage ?? null,
    productClass: item.productClass ?? null,
    unitOfMeasure: item.uom ?? null,

    currency: item.pricing?.currencyCode ?? 'CAD',

    cost,
    msrp,
    sellPrice,
    markupMultiplier: DEFAULT_MARKUP_MULTIPLIER,

    available: Boolean(item.availability?.available),
    totalAvailability: toNumber(item.availability?.totalAvailability),

    authorized: Boolean(item.productAuthorized),
    returnable: Boolean(item.returnableProduct),
    acceptBackOrder: Boolean(item.acceptBackOrder),
    endUserInfoRequired: Boolean(item.endUserInfoRequired),
    specialBidPricingAvailable: Boolean(item.pricing?.specialBidPricingAvailable),
  }
}

export const searchIngramProducts = async (
  options: SearchIngramProductsOptions = {},
) => {
  const {
    keyword = 'monitor',
    pageNumber = 1,
    pageSize = 10,
    type = 'IM::physical',
  } = options

  const token = await getIngramToken()

  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
    type,
  })

  params.append('keyword', keyword)

  const url = buildIngramUrl('/resellers/v6/catalog', params)

  const response = await fetch(url, {
    method: 'GET',
    headers: getIngramHeaders(token),
  })

  const data = await parseIngramResponse<IngramSearchResponse>(response)

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      data,
    }
  }

  if (typeof data === 'string') {
    return {
      success: false,
      status: response.status,
      data,
    }
  }

  const catalog = Array.isArray(data.catalog) ? data.catalog : []
  const products = catalog.map(normalizeIngramSearchProduct)

  return {
    success: true,
    recordsFound: data.recordsFound ?? products.length,
    pageSize: data.pageSize ?? Number(pageSize),
    pageNumber: data.pageNumber ?? Number(pageNumber),
    products,
    raw: data,
  }
}

export const getIngramPriceAvailability = async (skus: string[]) => {
  const token = await getIngramToken()

  const params = new URLSearchParams({
    includeAvailability: 'true',
    includePricing: 'true',
    includeProductAttributes: 'true',
  })

  const url = buildIngramUrl(
    '/resellers/v6/catalog/priceandavailability',
    params,
  )

  const response = await fetch(url, {
    method: 'POST',
    headers: getIngramHeaders(token),
    body: JSON.stringify({
      products: skus.map((sku) => ({
        ingramPartNumber: sku,
      })),
    }),
  })

  const data = await parseIngramResponse<IngramPriceAvailabilityResponse>(
    response,
  )

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      data,
    }
  }

  if (!Array.isArray(data)) {
    return {
      success: false,
      status: response.status,
      data,
    }
  }

  const products = data.map(normalizePriceAvailabilityItem)

  return {
    success: true,
    products,
    raw: data,
  }

  
}

export const getIngramProductDetails = async (ingramPartNumber: string) => {
  const token = await getIngramToken()

  const url = buildIngramUrl(
    `/resellers/v6/catalog/details/${encodeURIComponent(ingramPartNumber)}`,
  )

  const response = await fetch(url, {
    method: 'GET',
    headers: getIngramHeaders(token),
  })

  const data = await parseIngramResponse<any>(response)

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      data,
    }
  }

  return {
    success: true,
    data,
  }
}