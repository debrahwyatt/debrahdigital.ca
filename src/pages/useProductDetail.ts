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

type CatalogJsonResponse = {
  products?: CatalogProduct[]
  lastSyncedAt?: string
}

const CATALOG_DATA_URL =
  import.meta.env.VITE_CATALOG_DATA_URL ??
  'http://localhost:3001/api/catalog/products'

const fetchCatalogProducts = async (): Promise<CatalogProduct[]> => {
  const response = await fetch(CATALOG_DATA_URL, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load cached catalog products')
  }

  const catalogData: CatalogJsonResponse | CatalogProduct[] =
    await response.json()

  if (Array.isArray(catalogData)) {
    return catalogData
  }

  return catalogData.products ?? []
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
      try {
        setIsLoading(true)
        setError('')

        const products = await fetchCatalogProducts()

        const matchedProduct = products.find(
          (catalogProduct) =>
            catalogProduct.ingramPartNumber === ingramPartNumber,
        )

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