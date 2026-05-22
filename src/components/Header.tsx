import '../styles/header.css'

function Header() {
  return (
    <header className="site-header">
      <nav>
        <a className="banner-link" href="/">
          <img
            src="/banner_web.webp"
            srcSet="/banner_web_300x75.webp 2x"
            alt="Banner"
            width="200"
            height="50"
          />
        </a>

        <span className="nav-links">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/shop">Shop</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>

          <a
            className="social-icon-link"
            href="https://www.facebook.com/people/Debrahs-Digital-Solutions/61577075683150/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.675 0h-21.35C.598 0 0 .6 0 1.326v21.348C0 23.4.598 24 1.326 24H12.82V14.708h-3.22v-3.622h3.22V8.413c0-3.18 1.942-4.91 4.778-4.91 1.358 0 2.526.1 2.865.146v3.32h-1.965c-1.54 0-1.84.732-1.84 1.806v2.368h3.678l-.479 3.622h-3.2V24h6.268C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" />
            </svg>
          </a>
        </span>
      </nav>
    </header>
  )
}

export default Header