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
  products?: CatalogProduct[]
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
}

const CATALOG_DATA_URL =
  import.meta.env.VITE_CATALOG_DATA_URL ?? '/api/catalog-products.php'

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

const fetchCatalogProductByIngramPartNumber = async (
  ingramPartNumber: string,
): Promise<CatalogProduct | null> => {
  const params = new URLSearchParams({
    ingramPartNumber,
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
    const matchedProduct = catalogData.find(
      (product) => product.ingramPartNumber === ingramPartNumber,
    )

    return matchedProduct ? normalizeCatalogProduct(matchedProduct) : null
  }

  const product = catalogData.products?.[0]

  return product ? normalizeCatalogProduct(product) : null
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
      if (!ingramPartNumber) {
        setProduct(null)
        setError('Product not found.')
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const matchedProduct =
          await fetchCatalogProductByIngramPartNumber(ingramPartNumber)

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