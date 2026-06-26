import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  FormEvent,
} from 'react'
import '../styles/shopCatalog.css'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
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

type ShopCategoryTile = {
  label: string
  value: string
  description: string
  searchTerms: string[]
}

const SHOP_PRODUCTS_URL =
  import.meta.env.VITE_SHOP_PRODUCTS_URL ?? '/api/square-products.php'

const SHOP_ASSET_BASE_URL =
  import.meta.env.VITE_SHOP_ASSET_BASE_URL ?? ''

const shopCategoryTiles: ShopCategoryTile[] = [
  {
    label: 'Accessories',
    value: 'Accessories',
    description: 'Everyday tech add-ons, adapters, and useful extras.',
    searchTerms: ['accessory', 'accessories'],
  },
  {
    label: 'Adapters',
    value: 'Adapters',
    description: 'USB, display, charging, and connection adapters.',
    searchTerms: ['adapter', 'adapters', 'dongle', 'converter'],
  },
  {
    label: 'Batteries',
    value: 'Batteries',
    description: 'Replacement and portable power options.',
    searchTerms: ['battery', 'batteries'],
  },
  {
    label: 'Cables',
    value: 'Cables',
    description: 'Charging, data, display, network, and audio cables.',
    searchTerms: ['cable', 'cables', 'hdmi', 'usb', 'ethernet'],
  },
  {
    label: 'Peripherals',
    value: 'Peripherals',
    description: 'Keyboards, mice, webcams, speakers, and desktop gear.',
    searchTerms: ['keyboard', 'mouse', 'mice', 'webcam', 'speaker', 'peripheral'],
  },
  {
    label: 'Phones',
    value: 'Phones',
    description: 'Phones, phone accessories, chargers, and mobile gear.',
    searchTerms: ['phone', 'phones', 'iphone', 'android', 'samsung'],
  },
  {
    label: 'Power',
    value: 'Power',
    description: 'Chargers, power bars, surge protectors, and power accessories.',
    searchTerms: ['power', 'charger', 'charging', 'surge', 'adapter'],
  },
  {
    label: 'Printers & Ink',
    value: 'Printers & Ink',
    description: 'Printers, ink, toner, and basic office supplies.',
    searchTerms: ['printer', 'printers', 'ink', 'toner'],
  },
  {
    label: 'Refurbished',
    value: 'Refurbished',
    description: 'Locally available refurbished devices and equipment.',
    searchTerms: ['refurbished', 'renewed', 'used'],
  },
  {
    label: 'Storage Media',
    value: 'Storage Media',
    description: 'USB drives, memory cards, storage, and backup accessories.',
    searchTerms: ['storage', 'usb', 'flash', 'memory', 'sd', 'microsd'],
  },
  {
    label: 'Supplies',
    value: 'Supplies',
    description: 'Common tech supplies for home, school, and office use.',
    searchTerms: ['supplies', 'supply'],
  },
]

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

const normalizeCategory = (value: string): string => {
  return value.trim().toLowerCase()
}

const productMatchesSearch = (
  product: Product,
  searchTerm: string,
): boolean => {
  const cleanedSearchTerm = searchTerm.trim().toLowerCase()

  if (!cleanedSearchTerm) {
    return true
  }

  const searchableText = [
    product.name,
    product.sku,
    product.categoryName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return cleanedSearchTerm
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => searchableText.includes(word))
}

const getShopCategoryImage = (
  products: Product[],
  categoryValue: string,
  searchTerms: string[],
): string => {
  const normalizedCategory = normalizeCategory(categoryValue)

  const categoryProduct = products.find((product) => {
    return (
      normalizeCategory(product.categoryName) === normalizedCategory &&
      Boolean(resolveShopImageUrl(product.imageUrl))
    )
  })

  if (categoryProduct) {
    return resolveShopImageUrl(categoryProduct.imageUrl)
  }

  const searchProduct = products.find((product) => {
    const searchableText = [
      product.name,
      product.sku,
      product.categoryName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return (
      Boolean(resolveShopImageUrl(product.imageUrl)) &&
      searchTerms.some((term) => searchableText.includes(term.toLowerCase()))
    )
  })

  if (searchProduct) {
    return resolveShopImageUrl(searchProduct.imageUrl)
  }

  return '/product-coming-soon.webp'
}

function Shop() {
  const navigate = useNavigate()
  const [urlSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [sortOption, setSortOption] = useState(
    urlSearchParams.get('sort') ?? 'price-low',
  )

  const [selectedCategory, setSelectedCategory] = useState(
    urlSearchParams.get('category') ?? 'all',
  )

  const [searchTerm, setSearchTerm] = useState(
    urlSearchParams.get('search') ?? '',
  )

  const hasShopQuery =
    urlSearchParams.has('category') ||
    urlSearchParams.has('search') ||
    urlSearchParams.has('sort')

  const isShopLanding = !hasShopQuery

  useEffect(() => {
    const nextCategory = urlSearchParams.get('category') ?? 'all'
    const nextSearchTerm = urlSearchParams.get('search') ?? ''
    const nextSortOption = urlSearchParams.get('sort') ?? 'price-low'

    setSelectedCategory(nextCategory)
    setSearchTerm(nextSearchTerm)
    setSortOption(nextSortOption)
  }, [
    urlSearchParams,
  ])

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

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.categoryName)
          .filter((category): category is string => Boolean(category)),
      ),
    ).sort()
  }, [
    products,
  ])

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        selectedCategory === 'all'
          ? true
          : normalizeCategory(product.categoryName) === normalizeCategory(selectedCategory),
      )
      .filter((product) => productMatchesSearch(product, searchTerm))
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
  }, [
    products,
    selectedCategory,
    searchTerm,
    sortOption,
  ])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleCategoryClick = (categoryValue: string) => {
    navigate(`/shop?category=${encodeURIComponent(categoryValue)}`)
    scrollToTop()
  }

  const handleLandingSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedSearchTerm = searchTerm.trim()

    if (!cleanedSearchTerm) {
      return
    }

    navigate(`/shop?search=${encodeURIComponent(cleanedSearchTerm)}`)
    scrollToTop()
  }

  const handleResultSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextParams = new URLSearchParams()

    nextParams.set('category', selectedCategory)

    if (searchTerm.trim()) {
      nextParams.set('search', searchTerm.trim())
    }

    if (sortOption !== 'price-low') {
      nextParams.set('sort', sortOption)
    }

    navigate(`/shop?${nextParams.toString()}`)
    scrollToTop()
  }

  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Shop"
        description="Browse available tech products, accessories, cables, storage devices, and computer equipment from Debrah's Digital Solutions in Fairview, Alberta."
        path="/shop"
      />

      <div className="page-wrapper shop-page catalog-page">
        {isShopLanding && (
          <>
            <section className="catalog-hero shop-hero">
              <div className="catalog-hero-content">
                <p className="catalog-eyebrow">Local Shop</p>

                <h1>What do you need today?</h1>

                <p>
                  Browse in-stock products available from Debrah&apos;s Digital Solutions,
                  including cables, adapters, chargers, storage, printer supplies,
                  refurbished devices, and everyday tech essentials.
                </p>

                <form
                  className="catalog-hero-search"
                  onSubmit={handleLandingSearchSubmit}
                >
                  <input
                    type="search"
                    value={searchTerm}
                    placeholder="Search cables, chargers, ink, storage..."
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />

                  <button type="submit" className="btn">
                    Search Shop
                  </button>
                </form>
              </div>
            </section>

            <section className="catalog-category-section">
              <div className="catalog-section-heading">
                <h2>Shop by category</h2>

                <p>
                  Choose a category to browse products currently listed in the
                  local shop.
                </p>
              </div>

              {isLoading && (
                <p className="shop-status">
                  Loading shop categories...
                </p>
              )}

              {error && (
                <p className="shop-status shop-error">
                  {error}
                </p>
              )}

              {!isLoading && !error && (
                <div className="catalog-category-grid">
                  {shopCategoryTiles.map((category) => (
                    <button
                      type="button"
                      className="catalog-category-card"
                      key={category.value}
                      onClick={() => handleCategoryClick(category.value)}
                    >
                      <span className="catalog-category-icon" aria-hidden="true">
                        <img
                          src={getShopCategoryImage(
                            products,
                            category.value,
                            category.searchTerms,
                          )}
                          alt=""
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = '/product-coming-soon.webp'
                          }}
                        />
                      </span>

                      <span className="catalog-category-title">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {!isShopLanding && (
          <section className="catalog-filter-panel" id="shop-results">
            <div className="catalog-section-heading catalog-results-heading">
              <h2>Shop results</h2>

              <p>
                Filter by category, search by keyword, or sort available
                products.
              </p>
            </div>

            <form className="shop-controls" onSubmit={handleResultSearchSubmit}>
              <label>
                Category

                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    const nextCategory = event.target.value
                    const nextParams = new URLSearchParams(urlSearchParams)

                    setSelectedCategory(nextCategory)
                    nextParams.set('category', nextCategory)

                    const queryString = nextParams.toString()

                    navigate(`/shop?${queryString}`)
                    scrollToTop()
                  }}
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
                  onChange={(event) => {
                    const nextSortOption = event.target.value
                    const nextParams = new URLSearchParams(urlSearchParams)

                    setSortOption(nextSortOption)

                    if (nextSortOption === 'price-low') {
                      nextParams.delete('sort')
                    } else {
                      nextParams.set('sort', nextSortOption)
                    }

                    if (!nextParams.has('category')) {
                      nextParams.set('category', selectedCategory)
                    }

                    const queryString = nextParams.toString()

                    navigate(`/shop?${queryString}`)
                  }}
                >
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </label>

              <label>
                Search

                <input
                  type="search"
                  value={searchTerm}
                  placeholder="Product name, SKU, or category"
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
              
              <button type="submit" className="btn pagination-btn">
                Search
              </button>
            </form>
          </section>
        )}

        {!isShopLanding && isLoading && (
          <p className="shop-status">
            Loading products...
          </p>
        )}

        {!isShopLanding && error && (
          <p className="shop-status shop-error">
            {error}
          </p>
        )}

        {!isShopLanding && !isLoading && !error && filteredProducts.length === 0 && (
          <p className="shop-status">
            No products are currently available in this category.
          </p>
        )}

        {!isShopLanding && !isLoading && !error && filteredProducts.length > 0 && (
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