import '../styles/shopCatalog.css'
import { Link } from 'react-router-dom'
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

function Catalog() {
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

  const firstProductNumber =
    totalProductCount === 0
      ? 0
      : (currentPage - 1) * productsPerPage + 1

  const lastProductNumber = Math.min(
    currentPage * productsPerPage,
    totalProductCount,
  )

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

        <form className="shop-controls" onSubmit={handleSearchSubmit}>
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
        </form>

        {isLoading && (
          <p className="shop-status">
            Loading catalog...
          </p>
        )}

        {error && (
          <p className="shop-status shop-error">
            {error}
          </p>
        )}

        {!isLoading && !error && sortedProducts.length === 0 && (
          <p className="shop-status">
            No products found. Try another category or search term.
          </p>
        )}

        {!isLoading && !error && sortedProducts.length > 0 && (
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

                      <Link
                        to={contactUrl}
                        className="btn product-btn"
                      >
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