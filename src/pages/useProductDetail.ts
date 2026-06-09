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

type CatalogApiResponse = {
  success?: boolean
  products?: CatalogProduct[]
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
}

const CATALOG_DATA_URL =
  import.meta.env.VITE_CATALOG_PRODUCTS_URL ?? '/api/catalog-products.php'

const cleanString = (
  value?: string | number | null,
): string => {
  return String(value ?? '').trim()
}

const normalizeCatalogProduct = (product: CatalogProduct): CatalogProduct => {
  return {
    ...product,
    ingramPartNumber: cleanString(product.ingramPartNumber),
    vendorPartNumber: product.vendorPartNumber
      ? cleanString(product.vendorPartNumber)
      : product.vendorPartNumber,
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

const findMatchingProduct = (
  products: CatalogProduct[] | undefined,
  ingramPartNumber: string,
): CatalogProduct | null => {
  if (!Array.isArray(products)) {
    return null
  }

  const normalizedIngramPartNumber = cleanString(ingramPartNumber)

  const matchedProduct = products.find((product) =>
    cleanString(product.ingramPartNumber) === normalizedIngramPartNumber,
  )

  return matchedProduct ? normalizeCatalogProduct(matchedProduct) : null
}

const fetchCatalogProductByIngramPartNumber = async (
  ingramPartNumber: string,
): Promise<CatalogProduct | null> => {
  const normalizedIngramPartNumber = cleanString(ingramPartNumber)

  const params = new URLSearchParams({
    ingramPartNumber: normalizedIngramPartNumber,
  })

  const response = await fetch(`${CATALOG_DATA_URL}?${params.toString()}`, {
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
      const normalizedIngramPartNumber = cleanString(ingramPartNumber)

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
  }, [ingramPartNumber])

  return {
    product,
    isLoading,
    error,
  }
}