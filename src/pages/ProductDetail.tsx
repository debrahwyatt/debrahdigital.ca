import '../styles/productDetail.css'
import {
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useLocation,
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

const DESCRIPTION_PREVIEW_LENGTH = 450

type ProductDetailLocationState = {
  fromCatalog?: string
}

const getUniqueImages = (images: (string | null | undefined)[]): string[] => {
  return Array.from(
    new Set(
      images
        .filter((image): image is string => Boolean(image))
        .map((image) => image.trim())
        .filter(Boolean)
        .filter((image) => !image.includes('/gallery_thumbs/'))
        .filter((image) => !image.includes('/gallery_lows/')),
    ),
  )
}

const normalizeDescriptionText = (description?: string | null): string => {
  return String(description ?? '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

const getCombinedProductDescription = (
  extraDescription?: string | null,
  fullDescription?: string | null,
): string => {
  return [
    extraDescription,
    fullDescription,
  ]
    .map(normalizeDescriptionText)
    .filter(Boolean)
    .filter((description, index, descriptions) => {
      // Avoid showing duplicate text if both fields are effectively the same.
      return descriptions.indexOf(description) === index
    })
    .join('\n\n')
}

function ProductDetail() {
  const location = useLocation()

  const locationState = location.state as ProductDetailLocationState | null

  const backToCatalogPath =
    locationState?.fromCatalog ?? '/catalog'

  const {
    product,
    isLoading,
    error,
  } = useProductDetail()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const rawProductName =
    product?.description ?? product?.vendorPartNumber ?? 'Product'

  const productName = cleanProductName(rawProductName)

  const productImages = useMemo(() => {
    if (!product) {
      return []
    }

    return getUniqueImages([
      product.imageUrl,
      ...(product.galleryUrls ?? []),
    ])
  }, [product])

  const mainImage =
    selectedImage ??
    productImages[0] ??
    product?.thumbnailUrl ??
    (product ? getProductImage(product) : getPlaceholderImage())

  const combinedProductDescription = getCombinedProductDescription(
    product?.extraDescription,
    product?.fullDescription,
  )

  const hasLongDescription =
    combinedProductDescription.length > DESCRIPTION_PREVIEW_LENGTH

  const seoDescription =
    normalizeDescriptionText(
      product?.extraDescription ??
        product?.fullDescription ??
        `View details for ${productName} from Debrah's Digital Solutions.`,
    )

  return (
    <>
      <SEO
        title={`${productName} | Debrah's Digital Solutions`}
        description={seoDescription}
        path={
          product?.ingramPartNumber
            ? `/catalog/${product.ingramPartNumber}`
            : '/catalog'
        }
      />

      <div className="page-wrapper product-detail-page">
        <div className="product-detail-container">
          <p className="product-back-link">
            <Link to={backToCatalogPath}>← Back to catalog</Link>
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
              <div className="product-detail-media">
                <div className="product-detail-image-wrap">
                  <img
                    src={mainImage}
                    alt={productName}
                    className="product-detail-image"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = getPlaceholderImage()
                    }}
                  />
                </div>

                {productImages.length > 1 && (
                  <div className="product-detail-thumbnails">
                    {productImages.slice(0, 7).map((imageUrl, index) => (
                      <button
                        type="button"
                        className={
                          imageUrl === mainImage
                            ? 'product-detail-thumbnail product-detail-thumbnail-active'
                            : 'product-detail-thumbnail'
                        }
                        key={imageUrl}
                        onClick={() => setSelectedImage(imageUrl)}
                        aria-label={`View product image ${index + 1}`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${productName} thumbnail ${index + 1}`}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="product-detail-content">
                <p className="product-detail-category">
                  {product.category}
                  {product.subCategory ? ` / ${product.subCategory}` : ''}
                </p>

                <h1>{productName}</h1>

                <div className="product-detail-meta-group">
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
                </div>

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

                {combinedProductDescription && (
                  <section className="product-detail-section">
                    <h2>Description</h2>

                    <p
                      className={
                        showFullDescription
                          ? 'product-detail-description product-detail-description-expanded'
                          : 'product-detail-description'
                      }
                    >
                      {combinedProductDescription}
                    </p>

                    {hasLongDescription && (
                      <button
                        type="button"
                        className="product-detail-description-toggle"
                        onClick={() =>
                          setShowFullDescription((current) => !current)
                        }
                      >
                        {showFullDescription
                          ? 'Show less'
                          : 'Show full description'}
                      </button>
                    )}
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