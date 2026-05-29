export type IngramAvailability = {
  available?: boolean
  totalAvailability?: number | string
}

export type IngramPricing = {
  currencyCode?: string
  retailPrice?: number | string
  customerPrice?: number | string
  specialBidPricingAvailable?: boolean
}

export type IngramPriceAvailabilityItem = {
  ingramPartNumber?: string
  vendorPartNumber?: string
  extendedVendorPartNumber?: string
  upc?: string

  vendorName?: string
  description?: string

  productStatusCode?: string
  productStatusMessage?: string
  productClass?: string
  uom?: string

  acceptBackOrder?: boolean
  productAuthorized?: boolean
  returnableProduct?: boolean
  endUserInfoRequired?: boolean

  availability?: IngramAvailability
  pricing?: IngramPricing

  discounts?: unknown[]
  serviceFees?: unknown[]
  subscriptionPrice?: unknown
}

export type NormalizedIngramProduct = {
  ingramPartNumber: string | null
  vendorPartNumber: string | null
  extendedVendorPartNumber: string | null
  upc: string | null

  vendorName: string | null
  description: string | null

  productStatusCode: string | null
  productStatusMessage: string | null
  productClass: string | null
  unitOfMeasure: string | null

  currency: string

  cost: number
  msrp: number | null
  sellPrice: number
  markupMultiplier: number

  available: boolean
  totalAvailability: number

  authorized: boolean
  returnable: boolean
  acceptBackOrder: boolean
  endUserInfoRequired: boolean
  specialBidPricingAvailable: boolean
}

export type IngramCatalogSearchItem = {
  ingramPartNumber?: string
  vendorPartNumber?: string
  upc?: string
  upcCode?: string

  vendorName?: string
  description?: string
  extraDescription?: string

  category?: string
  subCategory?: string
  productType?: string

  authorizedToPurchase?: boolean | string
  hasDiscounts?: boolean | string
  isPriceVisible?: boolean
  customerAuthorization?: boolean

  links?: unknown[]
}

export type NormalizedIngramSearchProduct = {
  ingramPartNumber: string | null
  vendorPartNumber: string | null
  upc: string | null

  vendorName: string | null
  description: string | null
  extraDescription: string | null

  category: string | null
  subCategory: string | null
  productType: string | null

  authorizedToPurchase: boolean
  hasDiscounts: boolean
  isPriceVisible: boolean
  customerAuthorization: boolean

  links: unknown[]
}

export type IngramSearchResponse = {
  recordsFound?: number
  pageSize?: number
  pageNumber?: number
  catalog?: IngramCatalogSearchItem[]
  nextPage?: string
  previousPage?: string
}

export type IngramPriceAvailabilityResponse = IngramPriceAvailabilityItem[]