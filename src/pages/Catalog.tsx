import '../styles/shopCatalog.css'
import type {
  FormEvent,
} from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import SEO from '../components/SEO'
import {
  cleanProductName,
  getPlaceholderImage,
  getProductImage,
  useCatalog,
} from './useCatalog'

const getAvailabilityCount = (
  totalAvailability: number | string | null | undefined,
): number => {
  const availabilityCount = Number(totalAvailability ?? 0)

  if (!Number.isFinite(availabilityCount)) {
    return 0
  }

  return availabilityCount
}

const featuredCategories = [
  {
    label: 'Laptops',
    value: 'laptops',
    icon: 'https://debrahdigital.ca/catalog-images/cs4467/main-1ab3ea4899b9.webp',
    description: 'Business, home, and student laptops.',
  },
  {
    label: 'Tablets',
    value: 'tablets',
    icon: 'https://debrahdigital.ca/catalog-images/fl1587/main-be63fbcdc9a3.webp',
    description: 'iPads, Android tablets, and Windows tablets.',
  },
  {
    label: 'Desktop Computers',
    value: 'computers',
    icon: 'https://debrahdigital.ca/catalog-images/eb9239/main-beb0298335aa.webp',
    description: 'Desktops, workstations, and all-in-one PCs.',
  },
  {
    label: 'Printers',
    value: 'printers',
    icon: 'https://debrahdigital.ca/catalog-images/ds9018/main-c29f8f52862b.webp',
    description: 'Inkjet, laser, office, and business printers.',
  },
  {
    label: 'Monitors',
    value: 'monitors',
    icon: 'https://debrahdigital.ca/catalog-images/bt8842/main-d1d286eeb250.webp',
    description: 'Displays for home, office, and multi-monitor setups.',
  },
  {
    label: 'Smart Phones',
    value: 'mobility-communications-devices',
    icon: 'https://debrahdigital.ca/catalog-images/fp5906/main-20e722205526.webp',
    description: 'Unlocked phones and mobile devices.',
  },
  {
    label: 'Networking',
    value: 'wireless-networking',
    icon: 'https://debrahdigital.ca/catalog-images/bp9877/main-cae8e87be7b3.webp',
    description: 'Routers, Wi-Fi, switches, and network hardware.',
  },
  {
    label: 'Scanners',
    value: 'scanners',
    icon: 'https://debrahdigital.ca/catalog-images/fp3958/main-75aaaf09f5a9.webp',
    description: 'Document scanners and office scanning equipment.',
  },
  {
    label: 'Webcams & Conferencing',
    value: 'video-audio-conference',
    icon: 'https://debrahdigital.ca/catalog-images/ag3206/main-6d0cbf1d3f28.webp',
    description: 'Webcams, meeting cameras, headsets, and conference gear.',
  },
  {
    label: 'Projectors',
    value: 'projectors',
    icon: 'https://debrahdigital.ca/catalog-images/497ppv/main-a3a0cb739240.webp',
    description: 'Projectors and presentation equipment.',
  },
]

function Catalog() {
  const navigate = useNavigate()
  const [urlSearchParams] = useSearchParams()

  const {
    catalogCategories,
    catalogUrl,
    sortedProducts,
    paginatedProducts,

    currentPage,
    totalPages,
    productsPerPage,
    totalProductCount,

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
  } = useCatalog()

  const hasCatalogQuery =
    urlSearchParams.has('category') ||
    urlSearchParams.has('search') ||
    urlSearchParams.has('sort') ||
    urlSearchParams.has('page')

  const isCatalogLanding = !hasCatalogQuery

  const firstProductNumber =
    totalProductCount === 0
      ? 0
      : (currentPage - 1) * productsPerPage + 1

  const lastProductNumber = Math.min(
    currentPage * productsPerPage,
    totalProductCount,
  )

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleCategoryClick = (categoryValue: string) => {
    setSelectedCategory(categoryValue)
    navigate(`/catalog?category=${encodeURIComponent(categoryValue)}`)
    scrollToTop()
  }

  const handleLandingSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    handleSearchSubmit(event)

    const cleanedSearchTerm = searchTerm.trim()

    if (!cleanedSearchTerm) {
      return
    }

    navigate(`/catalog?search=${encodeURIComponent(cleanedSearchTerm)}`)
    scrollToTop()
  }

  const handleResultSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    handleSearchSubmit(event)

    const nextParams = new URLSearchParams()

    nextParams.set('category', selectedCategory)

    if (searchTerm.trim()) {
      nextParams.set('search', searchTerm.trim())
    }

    if (sortOption !== 'price-low') {
      nextParams.set('sort', sortOption)
    }

    navigate(`/catalog?${nextParams.toString()}`)
    scrollToTop()
  }

  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Special Order Catalog"
        description="Browse laptops, desktop computers, monitors, printers, and business technology available by special order through Debrah's Digital Solutions in Fairview, Alberta."
        path="/catalog"
      />

      <div className="page-wrapper shop-page catalog-page">
        {isCatalogLanding && (
          <>
            <section className="catalog-hero">
              <div className="catalog-hero-content">
                <p className="catalog-eyebrow">Special Order Catalog</p>

                <h1>What are you looking for?</h1>

                <p>
                  Find the tech you need without the big-city runaround. Browse laptops,
                  printers, monitors, networking gear, accessories, and more — then request the
                  item through Debrah&apos;s Digital Solutions for local support, friendly service,
                  and help choosing the right product.
                </p>

                <form
                  className="catalog-hero-search"
                  onSubmit={handleLandingSearchSubmit}
                >
                  <input
                    type="search"
                    value={searchTerm}
                    placeholder="Search laptops, tablets, printers, phones..."
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />

                  <button type="submit" className="btn">
                    Search Catalog
                  </button>
                </form>
              </div>
            </section>

            <section className="catalog-category-section">
              <div className="catalog-section-heading">
                <h2>Shop by category</h2>

                <p>
                  Choose a category to narrow the catalog to the products
                  customers usually ask for.
                </p>
              </div>

              <div className="catalog-category-grid">
                {featuredCategories.map((category) => (
                  <button
                    type="button"
                    className={`catalog-category-card ${
                      selectedCategory === category.value ? 'is-active' : ''
                    }`}
                    key={category.value}
                    onClick={() => handleCategoryClick(category.value)}
                  >
                    <span className="catalog-category-icon" aria-hidden="true">
                      <img
                        src={category.icon}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = getPlaceholderImage()
                        }}
                      />
                    </span>

                    <span className="catalog-category-title">
                      {category.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {!isCatalogLanding && (
          <section className="catalog-filter-panel" id="catalog-results">
            <div className="catalog-section-heading catalog-results-heading">
              <h2>Catalog results</h2>

              <p>
                Filter by category, search by keyword, or sort the current
                results.
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
                    nextParams.delete('page')

                    const queryString = nextParams.toString()

                    navigate(`/catalog?${queryString}`)
                    scrollToTop()
                  }}
                >
                  {catalogCategories.map((category) => (
                    <option value={category.value} key={category.value}>
                      {category.label}
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

                    nextParams.delete('page')

                    const queryString = nextParams.toString()

                    navigate(`/catalog?${queryString}`)
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
                  placeholder="Brand, model, category, or feature"
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <button type="submit" className="btn pagination-btn">
                Search
              </button>
            </form>
          </section>
        )}

        {!isCatalogLanding && isLoading && (
          <p className="shop-status">Loading catalog...</p>
        )}

        {!isCatalogLanding && error && (
          <p className="shop-status shop-error">{error}</p>
        )}

        {!isCatalogLanding &&
          !isLoading &&
          !error &&
          sortedProducts.length === 0 && (
            <p className="shop-status">
              No products found. Try another category or search term.
            </p>
          )}

        {!isCatalogLanding &&
          !isLoading &&
          !error &&
          sortedProducts.length > 0 && (
            <>
              <div className="catalog-pagination-summary">
                <p>
                  Showing {firstProductNumber} - {lastProductNumber} of{' '}
                  {totalProductCount} products
                </p>

                <div className="catalog-pagination">
                  <button
                    type="button"
                    className="btn pagination-btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <span className="pagination-page-count">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn pagination-btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>

              <section className="shop-grid">
                {paginatedProducts.map((product) => {
                  const rawProductName =
                    product.description ?? product.vendorPartNumber ?? 'Product'

                  const productName = cleanProductName(rawProductName)

                  const productUrl = `/catalog/${encodeURIComponent(
                    product.ingramPartNumber ?? '',
                  )}`

                  const contactUrl = `/contact?product=${encodeURIComponent(
                    productName,
                  )}&sku=${encodeURIComponent(product.ingramPartNumber ?? '')}`

                  const availabilityCount = getAvailabilityCount(
                    product.totalAvailability,
                  )

                  return (
                    <article
                      className="product-card"
                      key={product.ingramPartNumber ?? productName}
                    >
                      <Link
                        to={productUrl}
                        state={{
                          fromCatalog: catalogUrl,
                        }}
                        className="product-image-wrap product-image-link"
                        aria-label={`View details for ${productName}`}
                      >
                        <img
                          src={getProductImage(product)}
                          alt={productName}
                          className="product-image"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = getPlaceholderImage()
                          }}
                        />
                      </Link>

                      <div className="product-card-body">
                        <h2>
                          <Link
                            to={productUrl}
                            state={{
                              fromCatalog: catalogUrl,
                            }}
                            className="product-title-link"
                          >
                            {productName}
                          </Link>
                        </h2>

                        <p className="product-meta product-brand">
                          {product.vendorName
                            ? `Brand: ${product.vendorName}`
                            : '\u00A0'}
                        </p>

                        {product.sellPrice != null && product.sellPrice > 0 ? (
                          <p className="product-price">
                            ${product.sellPrice.toFixed(2)}{' '}
                            {product.currency ?? 'CAD'}
                          </p>
                        ) : (
                          <p className="product-price">
                            Price confirmed before payment
                          </p>
                        )}

                        <p className="product-meta product-availability">
                          {availabilityCount > 0
                            ? `Supplier stock: ${availabilityCount}`
                            : 'Availability confirmed before payment'}
                        </p>

                        <p className="product-meta product-item-number">
                          {product.ingramPartNumber
                            ? `Item #: ${product.ingramPartNumber}`
                            : '\u00A0'}
                        </p>

                        <Link to={contactUrl} className="btn product-btn">
                          Request Item
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </section>

              {totalPages > 1 && (
                <div className="catalog-pagination catalog-pagination-bottom">
                  <button
                    type="button"
                    className="btn pagination-btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <span className="pagination-page-count">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn pagination-btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </>
  )
}

export default Catalog