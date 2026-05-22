import { Helmet } from 'react-helmet-async'
import siteMetadata from '../seo/siteMetadata'

type SEOProps = {
  title?: string
  description?: string
  path?: string
  image?: string
}

function SEO({
  title = siteMetadata.defaultTitle,
  description = siteMetadata.defaultDescription,
  path = '/',
  image = siteMetadata.defaultOgImage,
}: SEOProps) {
  const canonicalUrl = `${siteMetadata.siteUrl}${path}`

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="author" content={siteMetadata.author} />
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
      />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_CA" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteMetadata.siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteMetadata.siteUrl}${image}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteMetadata.siteUrl}${image}`} />

    </Helmet>
  )
}

export default SEO