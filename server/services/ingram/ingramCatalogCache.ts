import fs from 'fs/promises'
import path from 'path'
import {
  getIngramPriceAvailability,
  searchIngramProducts,
} from './ingramService'
import {
  catalogTerms,
} from './catalogTerms'
import type {
  CatalogTerms,
} from './catalogTerms'

type CachedCatalogProduct = {
  ingramPartNumber: string | null
  vendorPartNumber: string | null
  upc: string | null

  vendorName: string | null
  description: string | null
  extraDescription: string | null

  category: string | null
  subCategory: string | null
  productType: string | null
  catalogCategory: string | null

  currency?: string
  cost?: number
  msrp?: number | null
  sellPrice?: number
  available?: boolean
  totalAvailability?: number

  authorized?: boolean
  returnable?: boolean
  acceptBackOrder?: boolean

  imageUrl?: string | null
  fullDescription?: string | null
  features?: string[]
  specifications?: {
    name: string
    value: string
  }[]

  lastSyncedAt: string
  visible: boolean
}

type CachedCatalogFile = {
  lastSyncedAt: string
  productCount: number
  products: CachedCatalogProduct[]
}

const CATALOG_DATA_DIR = path.resolve(process.cwd(), 'data')

export const CATALOG_FILE_PATH = path.join(
  CATALOG_DATA_DIR,
  'ingram-products.json',
)

const TEMP_CATALOG_FILE_PATH = path.join(
  CATALOG_DATA_DIR,
  'catalog-products.tmp.json',
)

const getNumber = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsedValue = Number(value ?? fallback)

  if (!Number.isFinite(parsedValue)) {
    return fallback
  }

  return parsedValue
}

const getOptionalLimit = (
  value: string | undefined,
  fallback: number,
): number | null => {
  const parsedValue = getNumber(value, fallback)

  if (parsedValue <= 0) {
    return null
  }

  return parsedValue
}

const applyOptionalLimit = <T>(
  items: T[],
  limit: number | null,
): T[] => {
  if (limit == null) {
    return items
  }

  return items.slice(0, limit)
}

const MAX_SEARCH_RESULTS_PER_KEYWORD = getNumber(
  process.env.MAX_SEARCH_RESULTS_PER_KEYWORD,
  100,
)

const MAX_SEARCH_PAGES_PER_KEYWORD = getOptionalLimit(
  process.env.MAX_SEARCH_PAGES_PER_KEYWORD,
  10,
)

const MAX_PRICE_SKUS = getOptionalLimit(
  process.env.MAX_PRICE_SKUS,
  1800,
)

const MAX_PRODUCTS_PER_CATEGORY = getOptionalLimit(
  process.env.MAX_PRODUCTS_PER_CATEGORY,
  300,
)

const PRICE_AVAILABILITY_BATCH_SIZE = getNumber(
  process.env.PRICE_AVAILABILITY_BATCH_SIZE,
  50,
)

const SEARCH_PAGE_DELAY_MS = getNumber(
  process.env.INGRAM_SEARCH_PAGE_DELAY_MS,
  300,
)

const PRICE_BATCH_DELAY_MS = getNumber(
  process.env.INGRAM_PRICE_BATCH_DELAY_MS,
  300,
)

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.round(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

const formatLimit = (limit: number | null): string => {
  return limit == null ? 'unlimited' : String(limit)
}

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }

  return chunks
}

const getProductSearchText = (product: CachedCatalogProduct): string => {
  return [
    product.description,
    product.extraDescription,
    product.vendorPartNumber,
    product.category,
    product.subCategory,
    product.productType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const productMatchesCategory = (
  product: CachedCatalogProduct,
  category: CatalogTerms,
): boolean => {
  const text = getProductSearchText(product)

  const hasRequiredTerm = category.requiredTerms.some((term: string) =>
    text.includes(term.toLowerCase()),
  )

  const hasBlockedTerm = category.blockedTerms.some((term: string) =>
    text.includes(term.toLowerCase()),
  )

  return hasRequiredTerm && !hasBlockedTerm
}

const productIsWorthCaching = (product: CachedCatalogProduct): boolean => {
  if (!product.ingramPartNumber) return false
  if (!product.description) return false

  if (product.authorized === false) return false

  if (product.sellPrice == null || product.sellPrice <= 0) {
    return false
  }

  // Avoid obvious junk/config/internal products.
  if (product.sellPrice < 5) return false
  if (product.sellPrice > 10000) return false

  return true
}

const dedupeProducts = (
  products: CachedCatalogProduct[],
): CachedCatalogProduct[] => {
  const productMap = new Map<string, CachedCatalogProduct>()

  products.forEach((product) => {
    if (!product.ingramPartNumber) return

    if (!productMap.has(product.ingramPartNumber)) {
      productMap.set(product.ingramPartNumber, product)
    }
  })

  return Array.from(productMap.values())
}

const fetchCatalogPagesForCategory = async (
  category: CatalogTerms,
): Promise<CachedCatalogProduct[]> => {
  const categoryStartedAt = Date.now()
  const products: CachedCatalogProduct[] = []
  const lastSyncedAt = new Date().toISOString()

  for (const keyword of category.keywords) {
    const keywordStartedAt = Date.now()

    console.log(`Searching Ingram catalog for: ${keyword}`)

    for (let pageNumber = 1; ; pageNumber += 1) {
      if (
        MAX_SEARCH_PAGES_PER_KEYWORD != null &&
        pageNumber > MAX_SEARCH_PAGES_PER_KEYWORD
      ) {
        console.log(
          `Reached page limit of ${MAX_SEARCH_PAGES_PER_KEYWORD} for keyword ${keyword}.`,
        )

        break
      }

      const searchResult = await searchIngramProducts({
        keyword,
        pageNumber,
        pageSize: MAX_SEARCH_RESULTS_PER_KEYWORD,
      })

      if (!searchResult.success || !searchResult.products) {
        if (searchResult.status === 404) {
          console.log(
            `No Ingram catalog results for keyword ${keyword}, page ${pageNumber}.`,
          )
        } else {
          console.warn(
            `Ingram search failed for keyword ${keyword}, page ${pageNumber}`,
            JSON.stringify(searchResult, null, 2),
          )
        }

        break
      }

      if (searchResult.products.length === 0) {
        console.log(
          `Keyword ${keyword}, page ${pageNumber}: no more products.`,
        )

        break
      }

      const filteredProducts = searchResult.products
        .map((product) => ({
          ...product,
          catalogCategory: category.value,
          imageUrl: null,
          fullDescription: null,
          features: [],
          specifications: [],
          lastSyncedAt,
          visible: true,
        }))
        .filter((product) => productMatchesCategory(product, category))

      products.push(...filteredProducts)

      console.log(
        `Keyword ${keyword}, page ${pageNumber}: found ${searchResult.products.length}, kept ${filteredProducts.length}`,
      )

      if (searchResult.products.length < MAX_SEARCH_RESULTS_PER_KEYWORD) {
        console.log(
          `Keyword ${keyword}, page ${pageNumber}: returned fewer than ${MAX_SEARCH_RESULTS_PER_KEYWORD}; stopping keyword.`,
        )

        break
      }

      await sleep(SEARCH_PAGE_DELAY_MS)
    }

    console.log(
      `Finished keyword ${keyword} in ${formatDuration(
        Date.now() - keywordStartedAt,
      )}.`,
    )
  }

  console.log(
    `Finished category ${category.label}. Kept ${products.length} candidates in ${formatDuration(
      Date.now() - categoryStartedAt,
    )}.`,
  )

  return products
}

export const readCatalogCache = async (): Promise<CachedCatalogFile | null> => {
  try {
    const fileContents = await fs.readFile(CATALOG_FILE_PATH, 'utf-8')
    return JSON.parse(fileContents) as CachedCatalogFile
  } catch {
    return null
  }
}

export const syncIngramCatalogCache = async (): Promise<CachedCatalogFile> => {
  const syncStartedAt = Date.now()

  console.log('Starting Ingram catalog cache sync...')
  console.log(
    [
      'Catalog settings:',
      `MAX_SEARCH_RESULTS_PER_KEYWORD=${MAX_SEARCH_RESULTS_PER_KEYWORD}`,
      `MAX_SEARCH_PAGES_PER_KEYWORD=${formatLimit(MAX_SEARCH_PAGES_PER_KEYWORD)}`,
      `MAX_PRODUCTS_PER_CATEGORY=${formatLimit(MAX_PRODUCTS_PER_CATEGORY)}`,
      `MAX_PRICE_SKUS=${formatLimit(MAX_PRICE_SKUS)}`,
      `PRICE_AVAILABILITY_BATCH_SIZE=${PRICE_AVAILABILITY_BATCH_SIZE}`,
      `INGRAM_SEARCH_PAGE_DELAY_MS=${SEARCH_PAGE_DELAY_MS}`,
      `INGRAM_PRICE_BATCH_DELAY_MS=${PRICE_BATCH_DELAY_MS}`,
    ].join('\n'),
  )

  await fs.mkdir(CATALOG_DATA_DIR, {
    recursive: true,
  })

  const candidateProducts: CachedCatalogProduct[] = []

  for (const category of catalogTerms as CatalogTerms[]) {
    console.log(`Searching category: ${category.label}`)

    const categoryProducts = await fetchCatalogPagesForCategory(category)

    candidateProducts.push(...categoryProducts)
  }

  console.log(`Total candidate products before dedupe: ${candidateProducts.length}`)

  const uniqueProductsByCategory = catalogTerms.flatMap(
    (category: CatalogTerms) => {
      const categoryProducts = candidateProducts.filter(
        (product) => product.catalogCategory === category.value,
      )

      return applyOptionalLimit(
        dedupeProducts(categoryProducts),
        MAX_PRODUCTS_PER_CATEGORY,
      )
    },
  )

  const uniqueProducts = applyOptionalLimit(
    dedupeProducts(uniqueProductsByCategory),
    MAX_PRICE_SKUS,
  )

  console.log(`Total products selected for pricing: ${uniqueProducts.length}`)
  console.log('Products selected for pricing by category:')

  catalogTerms.forEach((category: CatalogTerms) => {
    const count = uniqueProducts.filter(
      (product) => product.catalogCategory === category.value,
    ).length

    console.log(`${category.label}: ${count}`)
  })

  const skus = uniqueProducts
    .map((product) => product.ingramPartNumber)
    .filter((sku): sku is string => Boolean(sku))

  console.log(`Requesting price/availability for ${skus.length} SKUs...`)

  const priceMap = new Map<string, Partial<CachedCatalogProduct>>()
  const skuBatches = chunkArray(skus, PRICE_AVAILABILITY_BATCH_SIZE)

  for (const [batchIndex, skuBatch] of skuBatches.entries()) {
    const batchStartedAt = Date.now()

    console.log(
      `Requesting price batch ${batchIndex + 1}/${skuBatches.length} for ${skuBatch.length} SKUs...`,
    )

    const priceResult = await getIngramPriceAvailability(skuBatch)

    if (priceResult.success && priceResult.products) {
      priceResult.products.forEach((product) => {
        if (!product.ingramPartNumber) return
        priceMap.set(product.ingramPartNumber, product)
      })

      console.log(
        `Price batch ${batchIndex + 1} returned ${
          priceResult.products.length
        } products in ${formatDuration(Date.now() - batchStartedAt)}.`,
      )
    } else {
      console.warn(
        `Ingram price availability failed for batch ${batchIndex + 1}:`,
        JSON.stringify(priceResult, null, 2),
      )
    }

    await sleep(PRICE_BATCH_DELAY_MS)
  }

  const lastSyncedAt = new Date().toISOString()

  const joinedProducts = uniqueProducts.map((product) => {
    const priceInfo = product.ingramPartNumber
      ? priceMap.get(product.ingramPartNumber)
      : undefined

    return {
      ...product,
      ...(priceInfo ?? {}),
      lastSyncedAt,
      visible: true,
    }
  })

  const products = joinedProducts.filter(productIsWorthCaching)

  const catalogFile: CachedCatalogFile = {
    lastSyncedAt,
    productCount: products.length,
    products,
  }

  await fs.writeFile(
    TEMP_CATALOG_FILE_PATH,
    JSON.stringify(catalogFile, null, 2),
    'utf-8',
  )

  await fs.rename(TEMP_CATALOG_FILE_PATH, CATALOG_FILE_PATH)

  const syncDurationMs = Date.now() - syncStartedAt

  console.log('Products saved by category:')

  catalogTerms.forEach((category: CatalogTerms) => {
    const count = products.filter(
      (product) => product.catalogCategory === category.value,
    ).length

    console.log(`${category.label}: ${count}`)
  })

  console.log(
    `Finished Ingram catalog cache sync. Saved ${products.length} products in ${formatDuration(
      syncDurationMs,
    )}.`,
  )

  return catalogFile
}