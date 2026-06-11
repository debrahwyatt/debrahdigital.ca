import {
  useEffect,
  useState,
} from 'react'
import {
  useParams,
} from 'react-router-dom'
import type {
  CatalogProduct,
} from './useCatalog'
import {
  resolveCatalogImageUrl,
} from './useCatalog'

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

const buildCatalogUrl = (
  params: URLSearchParams,
): string => {
  const separator = CATALOG_DATA_URL.includes('?') ? '&' : '?'

  return `${CATALOG_DATA_URL}${separator}${params.toString()}`
}

const cleanString = (
  value?: string | number | null,
): string => {
  return String(value ?? '').trim()
}

const normalizePartNumber = (
  value?: string | number | null,
): string => {
  return cleanString(value).toUpperCase()
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
    galleryUrls: Array.isArray(product.galleryUrls)
      ? product.galleryUrls
          .map((url) => resolveCatalogImageUrl(url))
          .filter((url): url is string => Boolean(url))
      : [],
  }
}

const findMatchingProduct = (
  products: CatalogProduct[] | undefined,
  ingramPartNumber: string,
): CatalogProduct | null => {
  if (!Array.isArray(products)) {
    return null
  }

  const normalizedIngramPartNumber = normalizePartNumber(ingramPartNumber)

  const matchedProduct = products.find((product) =>
    normalizePartNumber(product.ingramPartNumber) === normalizedIngramPartNumber,
  )

  return matchedProduct ? normalizeCatalogProduct(matchedProduct) : null
}

const fetchCatalogProductByIngramPartNumber = async (
  ingramPartNumber: string,
): Promise<CatalogProduct | null> => {
  const normalizedIngramPartNumber = normalizePartNumber(ingramPartNumber)

  const params = new URLSearchParams({
    ingramPartNumber: normalizedIngramPartNumber,
  })

  const url = buildCatalogUrl(params)

  const response = await fetch(url, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load product details from database')
  }

  const catalogData: CatalogApiResponse | CatalogProduct[] =
    await response.json()

  if (Array.isArray(catalogData)) {
    return findMatchingProduct(catalogData, normalizedIngramPartNumber)
  }

  return findMatchingProduct(catalogData.products, normalizedIngramPartNumber)
}

export const useProductDetail = () => {
  const {
    ingramPartNumber,
  } = useParams()

  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      const normalizedIngramPartNumber = normalizePartNumber(ingramPartNumber)

      if (!normalizedIngramPartNumber) {
        setProduct(null)
        setError('Product not found.')
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const matchedProduct =
          await fetchCatalogProductByIngramPartNumber(normalizedIngramPartNumber)

        if (!isMounted) return

        if (!matchedProduct) {
          setError('Product not found.')
          setProduct(null)
          return
        }

        setProduct(matchedProduct)
      } catch (err) {
        console.error(err)

        if (isMounted) {
          setError('Unable to load product details right now.')
          setProduct(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [
    ingramPartNumber,
  ])

  return {
    product,
    isLoading,
    error,
  }
}