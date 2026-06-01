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
  type CatalogCategory,
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

  manufacturer?: string | null
  manufacturerPartNumber?: string | null

  currency?: string
  cost?: number
  msrp?: number | null
  sellPrice?: number
  available?: boolean
  totalAvailability?: number

  imageUrl?: string | null
  lastSyncedAt?: string | null

  weight?: string | null
  dimensions?: string | null

  features?: string[]
  specifications?: {
    name: string
    value: string
  }[]

  visible?: boolean
}

type CatalogJsonResponse = {
  products?: CatalogProduct[]
  lastSyncedAt?: string
}

const CATALOG_DATA_URL =
  import.meta.env.VITE_CATALOG_DATA_URL ?? '/data/catalog-products.json'

const getProductSearchText = (product: CatalogProduct): string => {
  return [
    product.description,
    product.extraDescription,
    product.vendorPartNumber,
    product.vendorName,
    product.category,
    product.subCategory,
    product.productType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const productMatchesCategory = (
  product: CatalogProduct,
  category: CatalogCategory,
): boolean => {
  const text = getProductSearchText(product)

  const hasRequiredTerm = category.requiredTerms.some((term) =>
    text.includes(term.toLowerCase()),
  )

  const hasBlockedTerm = category.blockedTerms.some((term) =>
    text.includes(term.toLowerCase()),
  )

  return hasRequiredTerm && !hasBlockedTerm
}

const productMatchesSearch = (
  product: CatalogProduct,
  searchTerm: string,
): boolean => {
  const trimmedSearchTerm = searchTerm.trim().toLowerCase()

  if (!trimmedSearchTerm) {
    return true
  }

  return getProductSearchText(product).includes(trimmedSearchTerm)
}

const productIsSafeToDisplay = (
  product: CatalogProduct,
  category: CatalogCategory,
): boolean => {
  if (product.visible === false) return false
  if (!product.ingramPartNumber) return false
  if (!product.description) return false

  const text = getProductSearchText(product)

  if (
    category.blockedTerms.some((term) =>
      text.includes(term.toLowerCase()),
    )
  ) {
    return false
  }

  if (product.sellPrice == null || product.sellPrice <= 0) {
    return false
  }

  if (product.sellPrice < 100) {
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

export const getPlaceholderImage = (product: CatalogProduct): string => {
  const text = getProductSearchText(product)

//   if (text.includes('ink') || text.includes('toner')) {
//     return '/images/placeholders/ink-toner.webp'
//   }

//   if (
//     text.includes('laptop') ||
//     text.includes('notebook') ||
//     text.includes('computer')
//   ) {
//     return '/images/placeholders/laptop.webp'
//   }

//   if (text.includes('desktop') || text.includes('workstation')) {
//     return '/images/placeholders/desktop.webp'
//   }

//   if (text.includes('monitor') || text.includes('display')) {
//     return '/images/placeholders/monitor.webp'
//   }

//   if (text.includes('printer')) {
//     return '/images/placeholders/printer.webp'
//   }

//   if (text.includes('cable')) {
//     return '/images/placeholders/cable.webp'
//   }

//   if (text.includes('adapter') || text.includes('adaptor')) {
//     return '/images/placeholders/adapter.webp'
//   }

//   if (text.includes('mouse') || text.includes('keyboard')) {
//     return '/images/placeholders/peripheral.webp'
//   }

  return '/product-coming-soon.webp'
}

export const getProductImage = (product: CatalogProduct): string => {
  return product.imageUrl || getPlaceholderImage(product)
}

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

export const useCatalog = () => {
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('laptops')
  const [sortOption, setSortOption] = useState('price-low')

  const selectedCategoryData =
    catalogCategories.find((category) => category.value === selectedCategory) ??
    catalogCategories[0]

  useEffect(() => {
    let isMounted = true

    const loadCatalog = async () => {
      try {
        setIsLoading(true)
        setError('')

        const products = await fetchCatalogProducts()

        if (!isMounted) return

        setAllProducts(products)

        console.table(
          products.map((product) => ({
            ingramPartNumber: product.ingramPartNumber,
            vendorPartNumber: product.vendorPartNumber,
            vendorName: product.vendorName,
            description: product.description,
            category: product.category,
            subCategory: product.subCategory,
            productType: product.productType,
            sellPrice: product.sellPrice,
            currency: product.currency,
            available: product.available,
            totalAvailability: product.totalAvailability,
            imageUrl: product.imageUrl,
            lastSyncedAt: product.lastSyncedAt,
            visible: product.visible,
          })),
        )
      } catch (err) {
        console.error(err)

        if (isMounted) {
          setError('Unable to load the special-order catalog right now.')
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
  }, [])

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (!productMatchesCategory(product, selectedCategoryData)) {
        return false
      }

      if (!productIsSafeToDisplay(product, selectedCategoryData)) {
        return false
      }

      if (!productMatchesSearch(product, searchTerm)) {
        return false
      }

      return true
    })
  }, [allProducts, selectedCategoryData, searchTerm])

  const sortedProducts = useMemo(() => {
    return sortCatalogProducts(filteredProducts, sortOption)
  }, [filteredProducts, sortOption])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return {
    catalogCategories,
    sortedProducts,

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