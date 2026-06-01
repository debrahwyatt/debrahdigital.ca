import '../styles/shopCatalog.css'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import {
  cleanProductName,
  getPlaceholderImage,
  getProductImage,
  useCatalog,
} from './useCatalog'

function Catalog() {
  const {
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
  } = useCatalog()

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

          <button type="submit" className="btn">
            Search Catalog
          </button>
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
          <section className="shop-grid">
            {sortedProducts.map((product) => {
              const rawProductName =
                product.description ?? product.vendorPartNumber ?? 'Product'

              const productName = cleanProductName(rawProductName)

              return (
                <article
                  className="product-card"
                  key={product.ingramPartNumber ?? productName}
                >
                  <Link
                    to={`/catalog/${encodeURIComponent(product.ingramPartNumber ?? '')}`}
                    className="product-image-wrap product-image-link"
                  >                    
                    <img
                      src={getProductImage(product)}
                      alt={productName}
                      className="product-image"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = getPlaceholderImage(product)
                      }}
                    />

                    {!product.imageUrl}
                  </Link>

                  <div className="product-card-body">
                    <h2>
                      <Link
                        to={`/catalog/${encodeURIComponent(product.ingramPartNumber ?? '')}`}
                        className="product-title-link"
                      >
                        {productName}
                      </Link>
                    </h2>

                    {product.vendorName && (
                      <p className="product-meta">
                        Brand: {product.vendorName}
                      </p>
                    )}

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