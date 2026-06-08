import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  FormEvent,
} from 'react'
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
  products?: CatalogProduct[]
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
}

const CATALOG_DATA_URL =
  import.meta.env.VITE_CATALOG_DATA_URL ?? '/api/catalog-products.php'

const PRODUCTS_PER_PAGE = 24

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

export const getProductImage = (product: CatalogProduct): string => {
  return (
    product.imageUrl ||
    product.thumbnailUrl ||
    product.galleryUrls?.[0] ||
    product.brandLogoUrl ||
    getPlaceholderImage()
  )
}

const normalizeCatalogProduct = (product: CatalogProduct): CatalogProduct => {
  return {
    ...product,
    sellPrice:
      product.sellPrice == null
        ? undefined
        : Number(product.sellPrice),
    available: Boolean(product.available),
    totalAvailability:
      product.totalAvailability == null
        ? 0
        : Number(product.totalAvailability),
    galleryUrls: Array.isArray(product.galleryUrls)
      ? product.galleryUrls
      : [],
  }
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
  const params = new URLSearchParams({
    category: selectedCategory,
    search: searchTerm.trim(),
    sort: sortOption,
    page: String(currentPage),
    pageSize: String(PRODUCTS_PER_PAGE),
  })

  const response = await fetch(`${CATALOG_DATA_URL}?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load catalog products from database')
  }

  const catalogData: CatalogApiResponse | CatalogProduct[] =
    await response.json()

  // Backward compatibility in case the endpoint ever returns a raw array.
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

// export const scrollToCatalogTop = () => {
//   window.scrollTo({
//     top: 0,
//     behavior: 'smooth',
//   })
// }

export const useCatalog = () => {
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOption, setSortOption] = useState('price-low')
  const [currentPage, setCurrentPage] = useState(1)

  const [totalProductCount, setTotalProductCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

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

        console.log('Loaded catalog products from database:', {
          productsOnPage: products.length,
          total: catalogData.total ?? products.length,
          page: catalogData.page ?? currentPage,
          pageSize: catalogData.pageSize ?? PRODUCTS_PER_PAGE,
          totalPages: catalogData.totalPages ?? 1,
          category: selectedCategory,
          search: searchTerm,
          sort: sortOption,
        })

        console.log('Catalog availability debug:', {
          productsOnPage: products.length,
          displayableProducts: products.filter(productIsSafeToDisplay).length,
          withAvailability: products.filter(
            (product) => getProductAvailabilityCount(product) > 0,
          ).length,
          zeroAvailability: products.filter(
            (product) => getProductAvailabilityCount(product) <= 0,
          ).length,
          firstProduct: products[0],
          firstAvailability: products[0]
            ? getProductAvailabilityCount(products[0])
            : null,
        })

        console.log('Catalog image debug:', {
          productsOnPage: products.length,
          withImageUrl: products.filter((product) => Boolean(product.imageUrl))
            .length,
          withThumbnailUrl: products.filter((product) =>
            Boolean(product.thumbnailUrl),
          ).length,
          withGalleryUrls: products.filter(
            (product) =>
              Array.isArray(product.galleryUrls) &&
              product.galleryUrls.length > 0,
          ).length,
          firstProduct: products[0],
          firstResolvedImage: products[0]
            ? getProductImage(products[0])
            : null,
        })
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

  /*
    The PHP/database endpoint already filters by:
    - selectedCategory
    - searchTerm
    - visible
    - available
    - sellPrice > 0

    This client-side filter is intentionally kept as a safety net so bad API
    data does not accidentally render.
  */
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

  /*
    The PHP/database endpoint should already sort the full result set before
    pagination. This local sort only sorts the current returned page as a
    fallback.
  */
  const sortedProducts = useMemo(() => {
    return sortCatalogProducts(filteredProducts, sortOption)
  }, [
    filteredProducts,
    sortOption,
  ])

  /*
    Products are already paginated by the PHP/database endpoint.
    Keep this variable name so Catalog.tsx does not need to change.
  */
  const paginatedProducts = useMemo(() => {
    return sortedProducts
  }, [sortedProducts])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    selectedCategory,
    searchTerm,
    sortOption,
  ])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [
    currentPage,
    totalPages,
  ])

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages)

    if (safePage === currentPage) {
      return
    }

    setCurrentPage(safePage)
    // scrollToCatalogTop()
  }

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentPage(1)
    // scrollToCatalogTop()
  }

  return {
    catalogCategories,
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