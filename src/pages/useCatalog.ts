import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  FormEvent,
} from 'react'
import {
  useSearchParams,
} from 'react-router-dom'
import {
  catalogCategories,
} from '../data/catalogCategories'

export type CatalogProduct = {
  ingramPartNumber: string | null
  vendorPartNumber: string | null
  upc: string | null

  vendorName: string | null
  description: string | null
  extraDescription: string | null
  fullDescription?: string | null

  category: string | null
  subCategory: string | null
  productType: string | null
  catalogCategory?: string | null

  currency?: string
  cost?: number
  msrp?: number | null
  sellPrice?: number
  available?: boolean
  totalAvailability?: number | string | null

  imageUrl?: string | null
  thumbnailUrl?: string | null
  brandLogoUrl?: string | null
  galleryUrls?: string[]

  lastSyncedAt?: string | null

  features?: string[]
  specifications?: {
    name: string
    value: string
  }[]

  visible?: boolean

  icecatId?: number | string
  icecatMatched?: boolean
  icecatMatchedBy?: string
  icecatLastCheckedAt?: string | null
}

type CatalogApiResponse = {
  success?: boolean
  products?: CatalogProduct[]
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  environment?: string
  database?: string
}

const CATALOG_DATA_URL =
  import.meta.env.VITE_CATALOG_PRODUCTS_URL ?? '/api/catalog-products.php'

const CATALOG_ASSET_BASE_URL = String(
  import.meta.env.VITE_CATALOG_ASSET_BASE_URL ?? 'https://debrahdigital.ca',
).replace(/\/+$/, '')

const CATALOG_IMAGE_BASE_URL = 'https://debrahdigital.ca'

const PRODUCTS_PER_PAGE = 24

const MULTI_CATEGORY_FETCH_PAGE_SIZE = 120

const IGNORED_SEARCH_WORDS = new Set([
  'a',
  'an',
  'and',
  'or',
  'the',
  'for',
  'with',
  'to',
  'of',
  'in',
  'on',
])

const CATEGORY_SEARCH_ALIASES: Record<string, string> = {
  laptop: 'laptops',
  laptops: 'laptops',
  notebook: 'laptops',
  notebooks: 'laptops',
  chromebook: 'laptops',
  chromebooks: 'laptops',

  tablet: 'tablets',
  tablets: 'tablets',
  ipad: 'tablets',
  ipads: 'tablets',

  desktop: 'computers',
  desktops: 'computers',
  computer: 'computers',
  computers: 'computers',
  pc: 'computers',
  pcs: 'computers',
  workstation: 'computers',
  workstations: 'computers',
  server: 'computers',
  servers: 'computers',
  aio: 'computers',

  monitor: 'monitors',
  monitors: 'monitors',
  display: 'monitors',
  displays: 'monitors',
  screen: 'monitors',
  screens: 'monitors',

  printer: 'printers',
  printers: 'printers',
  printing: 'printers',
  laser: 'printers',
  inkjet: 'printers',
  multifunction: 'printers',
  mfp: 'printers',
  plotter: 'printers',
  plotters: 'printers',

  scanner: 'scanners',
  scanners: 'scanners',
  scan: 'scanners',
  scanning: 'scanners',

  barcode: 'barcode-scanners',
  barcodes: 'barcode-scanners',

  webcam: 'webcams',
  webcams: 'webcams',

  camera: 'cameras',
  cameras: 'cameras',

  conference: 'video-audio-conference',
  conferencing: 'video-audio-conference',
  headset: 'video-audio-conference',
  headsets: 'video-audio-conference',
  speakerphone: 'video-audio-conference',
  speakerphones: 'video-audio-conference',
  meeting: 'video-audio-conference',

  projector: 'projectors',
  projectors: 'projectors',
  presentation: 'projectors',

  pos: 'pos',
  checkout: 'pos',
  register: 'pos',
  receipt: 'pos',

  network: 'wireless-networking',
  networking: 'wireless-networking',
  wifi: 'wireless-networking',
  wireless: 'wireless-networking',

  switch: 'switches-and-hubs',
  switches: 'switches-and-hubs',
  hub: 'switches-and-hubs',
  hubs: 'switches-and-hubs',

  router: 'routers-and-components',
  routers: 'routers-and-components',
  firewall: 'routers-and-components',
  firewalls: 'routers-and-components',
  gateway: 'routers-and-components',
  gateways: 'routers-and-components',

  transceiver: 'transceivers',
  transceivers: 'transceivers',

  ups: 'power-equipment',
  battery: 'power-equipment',
  batteries: 'power-equipment',
  power: 'power-equipment',
  surge: 'power-equipment',

  keyboard: 'pointing-devices',
  keyboards: 'pointing-devices',
  mouse: 'pointing-devices',
  mice: 'pointing-devices',

  memory: 'memory',
  ram: 'memory',

  phone: 'mobility-communications-devices',
  phones: 'mobility-communications-devices',
  smartphone: 'mobility-communications-devices',
  smartphones: 'mobility-communications-devices',
  iphone: 'mobility-communications-devices',
  android: 'mobility-communications-devices',

  voip: 'phone-systems',

  accessory: 'accessories',
  accessories: 'accessories',
}

const getSafePageFromUrl = (
  value: string | null,
): number => {
  const page = Number(value ?? 1)

  if (!Number.isFinite(page) || page < 1) {
    return 1
  }

  return Math.floor(page)
}

const buildCatalogUrl = (
  params: URLSearchParams,
): string => {
  const separator = CATALOG_DATA_URL.includes('?') ? '&' : '?'

  return `${CATALOG_DATA_URL}${separator}${params.toString()}`
}

const buildCatalogPageUrl = ({
  selectedCategory,
  searchTerm,
  sortOption,
  currentPage,
}: {
  selectedCategory: string
  searchTerm: string
  sortOption: string
  currentPage: number
}): string => {
  const params = new URLSearchParams()

  if (selectedCategory !== 'all') {
    params.set('category', selectedCategory)
  }

  if (searchTerm.trim()) {
    params.set('search', searchTerm.trim())
  }

  if (sortOption !== 'price-low') {
    params.set('sort', sortOption)
  }

  if (currentPage > 1) {
    params.set('page', String(currentPage))
  }

  const queryString = params.toString()

  return queryString ? `/catalog?${queryString}` : '/catalog'
}

const cleanString = (
  value?: string | number | null,
): string => {
  return String(value ?? '')
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/^'+|'+$/g, '')
    .replace(/\\\//g, '/')
}

const normalizeSearchWord = (
  value: string,
): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
}

const getCategoryMatchesFromSearch = (searchTerm: string): string[] => {
  const normalizedWords = searchTerm
    .split(/\s+/)
    .map(normalizeSearchWord)
    .filter(Boolean)
    .filter((word) => !IGNORED_SEARCH_WORDS.has(word))

  return Array.from(
    new Set(
      normalizedWords
        .map((word) => CATEGORY_SEARCH_ALIASES[word])
        .filter((category): category is string => Boolean(category)),
    ),
  )
}

const getRemainingSearchAfterCategoryWords = (searchTerm: string): string => {
  return searchTerm
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => {
      const normalizedWord = normalizeSearchWord(word)

      return (
        !IGNORED_SEARCH_WORDS.has(normalizedWord) &&
        !CATEGORY_SEARCH_ALIASES[normalizedWord]
      )
    })
    .join(' ')
    .trim()
}

const getCatalogQueryParams = ({
  selectedCategory,
  searchTerm,
}: {
  selectedCategory: string
  searchTerm: string
}): {
  category: string
  search: string
} => {
  const cleanedSearchTerm = searchTerm.trim()

  if (!cleanedSearchTerm) {
    return {
      category: selectedCategory,
      search: '',
    }
  }

  if (selectedCategory !== 'all') {
    return {
      category: selectedCategory,
      search: cleanedSearchTerm,
    }
  }

  const matchedCategories = getCategoryMatchesFromSearch(cleanedSearchTerm)

  if (matchedCategories.length === 1) {
    return {
      category: matchedCategories[0],
      search: getRemainingSearchAfterCategoryWords(cleanedSearchTerm),
    }
  }

  return {
    category: selectedCategory,
    search: cleanedSearchTerm,
  }
}

const getProductAvailabilityCount = (product: CatalogProduct): number => {
  const totalAvailability = Number(product.totalAvailability ?? 0)

  if (Number.isFinite(totalAvailability)) {
    return totalAvailability
  }

  return 0
}

const productIsSafeToDisplay = (product: CatalogProduct): boolean => {
  if (product.visible === false) return false
  if (!product.ingramPartNumber) return false
  if (!product.description) return false

  if (product.sellPrice == null || product.sellPrice <= 0) {
    return false
  }

  if (getProductAvailabilityCount(product) <= 0) {
    return false
  }

  return true
}

const sortCatalogProducts = (
  products: CatalogProduct[],
  sortOption: string,
): CatalogProduct[] => {
  return [...products].sort((a, b) => {
    const aPrice = a.sellPrice ?? 0
    const bPrice = b.sellPrice ?? 0
    const aName = a.description ?? ''
    const bName = b.description ?? ''

    switch (sortOption) {
      case 'price-low':
        return aPrice - bPrice
      case 'price-high':
        return bPrice - aPrice
      case 'za':
        return bName.localeCompare(aName)
      case 'az':
      default:
        return aName.localeCompare(bName)
    }
  })
}

export const cleanProductName = (name: string): string => {
  return name
    .replace(/^FR\s+TOPSELLER\s+/i, '')
    .replace(/^TOPSELLER\s+/i, '')
    .replace(/^CDW\s+ONLY\s+CTO\s+/i, '')
    .replace(/^CTO\s+/i, '')
    .replace(/\s+NO\s+RETURNS$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const getPlaceholderImage = (): string => {
  return '/product-coming-soon.webp'
}

export const resolveCatalogImageUrl = (
  value?: string | null,
): string | null => {
  const imageUrl = cleanString(value)

  if (!imageUrl) {
    return null
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl
  }

  if (imageUrl.startsWith('/catalog-images/')) {
    return `${CATALOG_IMAGE_BASE_URL}${imageUrl}`
  }

  if (imageUrl.startsWith('catalog-images/')) {
    return `${CATALOG_IMAGE_BASE_URL}/${imageUrl}`
  }

  if (imageUrl.startsWith('/')) {
    return CATALOG_ASSET_BASE_URL
      ? `${CATALOG_ASSET_BASE_URL}${imageUrl}`
      : imageUrl
  }

  return CATALOG_ASSET_BASE_URL
    ? `${CATALOG_ASSET_BASE_URL}/${imageUrl.replace(/^\/+/, '')}`
    : imageUrl
}

export const getProductImage = (product: CatalogProduct): string => {
  return (
    resolveCatalogImageUrl(product.imageUrl) ||
    resolveCatalogImageUrl(product.thumbnailUrl) ||
    resolveCatalogImageUrl(product.galleryUrls?.[0]) ||
    resolveCatalogImageUrl(product.brandLogoUrl) ||
    getPlaceholderImage()
  )
}

const normalizeGalleryUrls = (
  galleryUrls?: string[] | null,
): string[] => {
  if (!Array.isArray(galleryUrls)) {
    return []
  }

  return galleryUrls
    .map((url) => resolveCatalogImageUrl(url))
    .filter((url): url is string => Boolean(url))
}

const normalizeCatalogProduct = (product: CatalogProduct): CatalogProduct => {
  return {
    ...product,
    ingramPartNumber: cleanString(product.ingramPartNumber),
    vendorPartNumber: product.vendorPartNumber
      ? cleanString(product.vendorPartNumber)
      : product.vendorPartNumber,
    imageUrl: resolveCatalogImageUrl(product.imageUrl),
    thumbnailUrl: resolveCatalogImageUrl(product.thumbnailUrl),
    brandLogoUrl: resolveCatalogImageUrl(product.brandLogoUrl),
    sellPrice:
      product.sellPrice == null
        ? undefined
        : Number(product.sellPrice),
    available: Boolean(product.available),
    totalAvailability:
      product.totalAvailability == null
        ? 0
        : Number(product.totalAvailability),
    galleryUrls: normalizeGalleryUrls(product.galleryUrls),
  }
}

const fetchCatalogProductsForCategory = async ({
  category,
  search,
  sortOption,
  page,
  pageSize,
}: {
  category: string
  search: string
  sortOption: string
  page: number
  pageSize: number
}): Promise<CatalogProduct[]> => {
  const params = new URLSearchParams({
    category,
    search,
    sort: sortOption,
    page: String(page),
    pageSize: String(pageSize),
  })

  const response = await fetch(buildCatalogUrl(params), {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load catalog products from database')
  }

  const catalogData: CatalogApiResponse | CatalogProduct[] =
    await response.json()

  if (Array.isArray(catalogData)) {
    return catalogData
  }

  return catalogData.products ?? []
}

const fetchCatalogProducts = async ({
  selectedCategory,
  searchTerm,
  sortOption,
  currentPage,
}: {
  selectedCategory: string
  searchTerm: string
  sortOption: string
  currentPage: number
}): Promise<CatalogApiResponse> => {
  const cleanedSearchTerm = searchTerm.trim()

  const matchedCategories =
    selectedCategory === 'all'
      ? getCategoryMatchesFromSearch(cleanedSearchTerm)
      : []

  if (matchedCategories.length > 1) {
    const remainingSearch = getRemainingSearchAfterCategoryWords(cleanedSearchTerm)

    const categoryProducts = await Promise.all(
      matchedCategories.map((category) =>
        fetchCatalogProductsForCategory({
          category,
          search: remainingSearch,
          sortOption,
          page: 1,
          pageSize: MULTI_CATEGORY_FETCH_PAGE_SIZE,
        }),
      ),
    )

    const mergedProducts = categoryProducts.flat()

    const uniqueProducts = Array.from(
      new Map(
        mergedProducts.map((product) => [
          product.ingramPartNumber ??
            product.vendorPartNumber ??
            product.description ??
            `${Date.now()}-${Math.random()}`,
          product,
        ]),
      ).values(),
    )

    const normalizedProducts = uniqueProducts.map(normalizeCatalogProduct)
    const safeProducts = normalizedProducts.filter(productIsSafeToDisplay)
    const sortedProducts = sortCatalogProducts(safeProducts, sortOption)

    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    const endIndex = startIndex + PRODUCTS_PER_PAGE
    const pagedProducts = sortedProducts.slice(startIndex, endIndex)

    return {
      products: pagedProducts,
      page: currentPage,
      pageSize: PRODUCTS_PER_PAGE,
      total: sortedProducts.length,
      totalPages: Math.max(
        1,
        Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE),
      ),
    }
  }

  const catalogQuery = getCatalogQueryParams({
    selectedCategory,
    searchTerm,
  })

  const params = new URLSearchParams({
    category: catalogQuery.category,
    search: catalogQuery.search,
    sort: sortOption,
    page: String(currentPage),
    pageSize: String(PRODUCTS_PER_PAGE),
  })

  const response = await fetch(buildCatalogUrl(params), {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load catalog products from database')
  }

  const catalogData: CatalogApiResponse | CatalogProduct[] =
    await response.json()

  if (Array.isArray(catalogData)) {
    return {
      products: catalogData,
      page: currentPage,
      pageSize: PRODUCTS_PER_PAGE,
      total: catalogData.length,
      totalPages: Math.max(
        1,
        Math.ceil(catalogData.length / PRODUCTS_PER_PAGE),
      ),
    }
  }

  return catalogData
}

export const useCatalog = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()

  const initialPage = getSafePageFromUrl(urlSearchParams.get('page'))

  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, updateSearchTermState] = useState(
    urlSearchParams.get('search') ?? '',
  )

  const [selectedCategory, updateSelectedCategoryState] = useState(
    urlSearchParams.get('category') ?? 'all',
  )

  const [sortOption, updateSortOptionState] = useState(
    urlSearchParams.get('sort') ?? 'price-low',
  )

  const [currentPage, setCurrentPage] = useState(initialPage)

  const [totalProductCount, setTotalProductCount] = useState(0)
  const [totalPages, setTotalPages] = useState(initialPage)

  useEffect(() => {
    const nextPage = getSafePageFromUrl(urlSearchParams.get('page'))
    const nextSearchTerm = urlSearchParams.get('search') ?? ''
    const nextSelectedCategory = urlSearchParams.get('category') ?? 'all'
    const nextSortOption = urlSearchParams.get('sort') ?? 'price-low'

    updateSearchTermState((currentSearchTerm) =>
      currentSearchTerm === nextSearchTerm
        ? currentSearchTerm
        : nextSearchTerm,
    )

    updateSelectedCategoryState((currentSelectedCategory) =>
      currentSelectedCategory === nextSelectedCategory
        ? currentSelectedCategory
        : nextSelectedCategory,
    )

    updateSortOptionState((currentSortOption) =>
      currentSortOption === nextSortOption
        ? currentSortOption
        : nextSortOption,
    )

    setCurrentPage((currentCurrentPage) =>
      currentCurrentPage === nextPage
        ? currentCurrentPage
        : nextPage,
    )
  }, [
    urlSearchParams,
  ])

  const catalogUrl = useMemo(() => {
    return buildCatalogPageUrl({
      selectedCategory,
      searchTerm,
      sortOption,
      currentPage,
    })
  }, [
    selectedCategory,
    searchTerm,
    sortOption,
    currentPage,
  ])

  const updateCatalogUrlParams = ({
    nextCategory = selectedCategory,
    nextSearchTerm = searchTerm,
    nextSortOption = sortOption,
    nextPage = currentPage,
  }: {
    nextCategory?: string
    nextSearchTerm?: string
    nextSortOption?: string
    nextPage?: number
  }) => {
    const nextSearchParams = new URLSearchParams()

    if (nextCategory !== 'all') {
      nextSearchParams.set('category', nextCategory)
    }

    if (nextSearchTerm.trim()) {
      nextSearchParams.set('search', nextSearchTerm.trim())
    }

    if (nextSortOption !== 'price-low') {
      nextSearchParams.set('sort', nextSortOption)
    }

    if (nextPage > 1) {
      nextSearchParams.set('page', String(nextPage))
    }

    setUrlSearchParams(nextSearchParams)
  }

  useEffect(() => {
    let isMounted = true

    const loadCatalog = async () => {
      try {
        setIsLoading(true)
        setError('')

        const catalogData = await fetchCatalogProducts({
          selectedCategory,
          searchTerm,
          sortOption,
          currentPage,
        })

        if (!isMounted) return

        const products = (catalogData.products ?? []).map(normalizeCatalogProduct)

        setAllProducts(products)
        setTotalProductCount(catalogData.total ?? products.length)
        setTotalPages(Math.max(1, catalogData.totalPages ?? 1))
      } catch (err) {
        console.error(err)

        if (isMounted) {
          setError('Unable to load the special-order catalog right now.')
          setAllProducts([])
          setTotalProductCount(0)
          setTotalPages(1)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCatalog()

    return () => {
      isMounted = false
    }
  }, [
    selectedCategory,
    searchTerm,
    sortOption,
    currentPage,
  ])

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (!productIsSafeToDisplay(product)) {
        return false
      }

      return true
    })
  }, [
    allProducts,
  ])

  const sortedProducts = useMemo(() => {
    return sortCatalogProducts(filteredProducts, sortOption)
  }, [
    filteredProducts,
    sortOption,
  ])

  const paginatedProducts = useMemo(() => {
    return sortedProducts
  }, [
    sortedProducts,
  ])

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      const safePage = totalPages

      setCurrentPage(safePage)

      updateCatalogUrlParams({
        nextPage: safePage,
      })
    }
  }, [
    isLoading,
    currentPage,
    totalPages,
  ])

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages)

    if (safePage === currentPage) {
      return
    }

    setCurrentPage(safePage)

    updateCatalogUrlParams({
      nextPage: safePage,
    })
  }

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const setSearchTerm = (value: string) => {
    updateSearchTermState(value)
    setCurrentPage(1)
  }

  const setSelectedCategory = (value: string) => {
    updateSelectedCategoryState(value)
    updateSearchTermState('')
    setCurrentPage(1)

    updateCatalogUrlParams({
      nextCategory: value,
      nextSearchTerm: '',
      nextPage: 1,
    })
  }

  const setSortOption = (value: string) => {
    updateSortOptionState(value)
    setCurrentPage(1)

    updateCatalogUrlParams({
      nextSortOption: value,
      nextPage: 1,
    })
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentPage(1)

    updateCatalogUrlParams({
      nextSearchTerm: searchTerm,
      nextPage: 1,
    })
  }

  return {
    catalogCategories,
    catalogUrl,
    sortedProducts,
    paginatedProducts,

    currentPage,
    totalPages,
    productsPerPage: PRODUCTS_PER_PAGE,
    totalProductCount,

    goToPage,
    goToPreviousPage,
    goToNextPage,

    isLoading,
    error,

    searchTerm,
    setSearchTerm,

    selectedCategory,
    setSelectedCategory,

    sortOption,
    setSortOption,

    handleSearchSubmit,
  }
}