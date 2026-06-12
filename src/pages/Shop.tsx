import { useEffect, useState } from 'react'
import '../styles/shopCatalog.css'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

type Product = {
  id: string
  variationId: string
  name: string
  price: number
  currency: string
  sku: string | null
  primaryImageId: string | null
  imageUrl: string | null
  categoryId: string | null
  categoryName: string
  soldOut: boolean
  quantity: number
  updatedAt: string
}

type ShopProductsResponse = {
  products: Product[]
  total: number
  environment?: string
}

const SHOP_PRODUCTS_URL =
  import.meta.env.VITE_SHOP_PRODUCTS_URL ?? '/api/square-products.php'

const SHOP_ASSET_BASE_URL =
  import.meta.env.VITE_SHOP_ASSET_BASE_URL ?? ''

const resolveShopImageUrl = (
  value?: string | null,
): string => {
  const imageUrl = String(value ?? '').trim()

  if (!imageUrl) {
    return ''
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl
  }

  if (imageUrl.startsWith('/shop-images/')) {
    return `${SHOP_ASSET_BASE_URL}${imageUrl}`
  }

  return imageUrl
}

function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [sortOption, setSortOption] = useState('price-high')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError('')

        const response = await fetch(SHOP_PRODUCTS_URL)

        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status}`)
        }

        const data = await response.json() as ShopProductsResponse | Product[]

        const loadedProducts = Array.isArray(data)
          ? data
          : data.products

        if (!Array.isArray(loadedProducts)) {
          throw new Error('Product API did not return a products array')
        }

        setProducts(loadedProducts)
      } catch (err) {
        setError('Unable to load shop products right now.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = Array.from(
    new Set(
      products
        .map((product) => product.categoryName)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort()

  const filteredProducts = products
    .filter((product) =>
      selectedCategory === 'all'
        ? true
        : product.categoryName === selectedCategory,
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'za':
          return b.name.localeCompare(a.name)
        case 'az':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Shop"
        description="Browse available tech products, accessories, cables, storage devices, and computer equipment from Debrah's Digital Solutions in Fairview, Alberta."
        path="/shop"
      />

      <div className="page-wrapper shop-page">
        <div className="page-header shop-header">
          <h1>Shop</h1>

          <p>
            Browse available products from Debrah&apos;s Digital Solutions.
          </p>
        </div>

        <div className="shop-controls">
          <label>
            Category

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value)
              }
            >
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>
        </div>

        {isLoading && (
          <p className="shop-status">
            Loading products...
          </p>
        )}

        {error && (
          <p className="shop-status shop-error">
            {error}
          </p>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <p className="shop-status">
            No products are currently available in this category.
          </p>
        )}

        {!isLoading && !error && filteredProducts.length > 0 && (
          <section className="shop-grid">
            {filteredProducts.map((product) => {
              const imageUrl = resolveShopImageUrl(product.imageUrl)

              return (
                <article
                  className="product-card shop-product-card"
                  key={product.variationId}
                >
                  <div className="product-image-placeholder shop-product-image-placeholder">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>

                  <div className="product-card-body">
                    <h2>{product.name}</h2>

                    <p className="product-price">
                      ${product.price.toFixed(2)} {product.currency}
                    </p>

                    <p className="product-meta">
                      In stock: {product.quantity}
                    </p>

                    <Link
                      to={`/contact?product=${encodeURIComponent(product.name)}`}
                      className="btn product-btn"
                    >
                      Request Item
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

export default Shop