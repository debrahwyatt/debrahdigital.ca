import { useState } from 'react'
import type React from 'react'
import '../styles/shop.css'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

type CatalogProduct = {
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

type PricedCatalogProduct = CatalogProduct & {
  currency?: string
  cost?: number
  msrp?: number | null
  sellPrice?: number
  available?: boolean
  totalAvailability?: number
  authorized?: boolean
  returnable?: boolean
  acceptBackOrder?: boolean
}

type CatalogCategory = {
  label: string
  value: string
  keyword: string
}

const catalogCategories: CatalogCategory[] = [
  {
    label: 'Laptops',
    value: 'laptops',
    keyword: 'laptop',
  },
  {
    label: 'Desktop PCs',
    value: 'desktops',
    keyword: 'desktop',
  },
  {
    label: 'Monitors',
    value: 'monitors',
    keyword: 'monitor',
  },
  {
    label: 'Printers',
    value: 'printers',
    keyword: 'printer',
  },
  {
    label: 'All-in-One PCs',
    value: 'all-in-one',
    keyword: 'all in one',
  },
  {
    label: 'Business Workstations',
    value: 'workstations',
    keyword: 'workstation',
  },
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

function Catalog() {
  const [products, setProducts] = useState<PricedCatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('laptops')
  const [sortOption, setSortOption] = useState('price-low')

  const selectedCategoryData =
    catalogCategories.find((category) => category.value === selectedCategory) ??
    catalogCategories[0]

  const loadCatalogProducts = async (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault()

    try {
      setIsLoading(true)
      setError('')

      const keyword = searchTerm.trim()
        ? `${selectedCategoryData.keyword} ${searchTerm.trim()}`
        : selectedCategoryData.keyword

      const searchResponse = await fetch(
        `${API_BASE_URL}/api/ingram/search-products?keyword=${encodeURIComponent(
          keyword,
        )}&pageSize=12`,
      )

      if (!searchResponse.ok) {
        throw new Error('Failed to search catalog products')
      }

      const searchData = await searchResponse.json()
      const searchProducts: CatalogProduct[] = searchData.products ?? []

      const skus = searchProducts
        .map((product) => product.ingramPartNumber)
        .filter((sku): sku is string => Boolean(sku))
        .slice(0, 12)

      if (skus.length === 0) {
        setProducts([])
        return
      }

      const priceResponse = await fetch(
        `${API_BASE_URL}/api/ingram/price-availability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            skus,
          }),
        },
      )

      if (!priceResponse.ok) {
        throw new Error('Failed to load catalog pricing')
      }

      const priceData = await priceResponse.json()

      const pricedProducts: Partial<PricedCatalogProduct>[] =
        priceData.products ?? []

      const priceMap = new Map<string, Partial<PricedCatalogProduct>>(
        pricedProducts
          .filter((product) => Boolean(product.ingramPartNumber))
          .map((product) => [
            String(product.ingramPartNumber),
            product,
          ]),
      )

      const mergedProducts = searchProducts
        .map((product) => {
          const priceInfo = product.ingramPartNumber
            ? priceMap.get(product.ingramPartNumber)
            : undefined

          return {
            ...product,
            ...(priceInfo ?? {}),
          }
        })
        .filter((product) => {
          if (!product.ingramPartNumber) return false
          if (!product.description) return false

          // Keep the first version conservative.
          // Hide tiny/low-value products from the public catalog.
          if (product.sellPrice != null && product.sellPrice < 100) {
            return false
          }

          return true
        })

      setProducts(mergedProducts)
    } catch (err) {
      console.error(err)
      setError('Unable to load special-order catalog products right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
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

  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Special Order Catalog"
        description="Browse laptops, desktop computers, monitors, printers, and business technology available by special order through Debrah's Digital Solutions in Fairview, Alberta."
        path="/catalog"
      />

      <div className="page-wrapper shop-page">
        <div className="page-header shop-header">
          <h1>Special Order Catalog</h1>

          <p>
            Browse select laptops, desktops, monitors, printers, and business
            technology available by special order. Pricing and availability are
            confirmed before payment.
          </p>
        </div>

        <form className="shop-controls" onSubmit={loadCatalogProducts}>
          <label>
            Category

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {catalogCategories.map((category) => (
                <option value={category.value} key={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Search

            <input
              type="search"
              value={searchTerm}
              placeholder="Brand, model, or feature"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label>
            Sort

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>

          <button type="submit" className="btn">
            Search Catalog
          </button>
        </form>

        {!isLoading && !error && products.length === 0 && (
          <p className="shop-status">
            Choose a category and search the special-order catalog.
          </p>
        )}

        {isLoading && (
          <p className="shop-status">
            Searching catalog...
          </p>
        )}

        {error && (
          <p className="shop-status shop-error">
            {error}
          </p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <section className="shop-grid">
            {sortedProducts.map((product) => {
              const productName =
                product.description ?? product.vendorPartNumber ?? 'Product'

              return (
                <article
                  className="product-card"
                  key={product.ingramPartNumber ?? productName}
                >
                  <div className="product-image-placeholder">
                    <span>Special Order</span>
                  </div>

                  <div className="product-card-body">
                    <h2>{productName}</h2>

                    {product.vendorName && (
                      <p className="product-meta">
                        Brand: {product.vendorName}
                      </p>
                    )}

                    {product.sellPrice != null ? (
                      <p className="product-price">
                        ${product.sellPrice.toFixed(2)}{' '}
                        {product.currency ?? 'CAD'}
                      </p>
                    ) : (
                      <p className="product-price">
                        Price confirmed before payment
                      </p>
                    )}

                    <p className="product-meta">
                      Availability confirmed before payment
                    </p>

                    {product.ingramPartNumber && (
                      <p className="product-meta">
                        Item #: {product.ingramPartNumber}
                      </p>
                    )}

                    <Link
                      to={`/contact?product=${encodeURIComponent(
                        productName,
                      )}&sku=${encodeURIComponent(
                        product.ingramPartNumber ?? '',
                      )}`}
                      className="btn product-btn"
                    >
                      Request Special Order
                    </Link>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </>
  )
}

export default Catalog