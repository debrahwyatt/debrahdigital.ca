import '../styles/productDetail.css'
import {
  Link,
} from 'react-router-dom'
import SEO from '../components/SEO'
import {
  cleanProductName,
  getPlaceholderImage,
  getProductImage,
} from './useCatalog'
import {
  useProductDetail,
} from './useProductDetail'

function ProductDetail() {
  const {
    product,
    isLoading,
    error,
  } = useProductDetail()

  const rawProductName =
    product?.description ?? product?.vendorPartNumber ?? 'Product'

  const productName = cleanProductName(rawProductName)

  return (
    <>
      <SEO
        title={`${productName} | Debrah's Digital Solutions`}
        description={
          product?.extraDescription ??
          product?.fullDescription ??
          `View details for ${productName} from Debrah's Digital Solutions.`
        }
        path={
          product?.ingramPartNumber
            ? `/catalog/${product.ingramPartNumber}`
            : '/catalog'
        }
      />

      <div className="page-wrapper product-detail-page">
        <div className="product-detail-container">
          <p className="product-back-link">
            <Link to="/catalog">← Back to catalog</Link>
          </p>

          {isLoading && (
            <p className="product-detail-status">
              Loading product...
            </p>
          )}

          {error && (
            <p className="product-detail-status product-detail-error">
              {error}
            </p>
          )}

          {!isLoading && !error && product && (
            <article className="product-detail">
              <div className="product-detail-image-wrap">
                <img
                  src={getProductImage(product)}
                  alt={productName}
                  className="product-detail-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = getPlaceholderImage(product)
                  }}
                />
              </div>

              <div className="product-detail-content">
                <p className="product-detail-category">
                  {product.category}
                  {product.subCategory ? ` / ${product.subCategory}` : ''}
                </p>

                <h1>{productName}</h1>

                {product.vendorName && (
                  <p className="product-detail-meta">
                    Brand: {product.vendorName}
                  </p>
                )}

                {product.vendorPartNumber && (
                  <p className="product-detail-meta">
                    Manufacturer Part #: {product.vendorPartNumber}
                  </p>
                )}

                {product.ingramPartNumber && (
                  <p className="product-detail-meta">
                    Item #: {product.ingramPartNumber}
                  </p>
                )}

                {product.sellPrice != null && product.sellPrice > 0 ? (
                  <p className="product-detail-price">
                    ${product.sellPrice.toFixed(2)} {product.currency ?? 'CAD'}
                  </p>
                ) : (
                  <p className="product-detail-price">
                    Price confirmed before payment
                  </p>
                )}

                <p className="product-detail-meta">
                  Availability confirmed before payment.
                </p>

                {product.totalAvailability != null && (
                  <p className="product-detail-meta">
                    Supplier availability: {product.totalAvailability}
                  </p>
                )}

                {(product.fullDescription || product.extraDescription) && (
                  <section className="product-detail-section">
                    <h2>Description</h2>

                    <p>
                      {product.fullDescription ?? product.extraDescription}
                    </p>
                  </section>
                )}

                {product.features && product.features.length > 0 && (
                  <section className="product-detail-section">
                    <h2>Features</h2>

                    <ul>
                      {product.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {product.specifications && product.specifications.length > 0 && (
                  <section className="product-detail-section">
                    <h2>Specifications</h2>

                    <dl className="product-spec-list">
                      {product.specifications.map((spec) => (
                        <div key={`${spec.name}-${spec.value}`}>
                          <dt>{spec.name}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                <div className="product-detail-actions">
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
              </div>
            </article>
          )}
        </div>
      </div>
    </>
  )
}

export default ProductDetail