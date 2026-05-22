import '../styles/error.css'
import SEO from '../components/SEO'

function Error() {
  return (
    <>
      <SEO
        title="Message Failed | Debrah's Digital Solutions"
        description="There was a problem sending your message to Debrah's Digital Solutions. Please try again later or contact us directly."
        path="/error"
      />

      <div className="page-wrapper error-wrapper">
        <div className="page-header error-message">
          <h1>Error</h1>

          <p>
            Your message could not be sent at this time.
          </p>

          <p>
            Please try again later or call us at
            <span className="highlight">
              {' '}
              (780) 330-9965
            </span>
          </p>
        </div>

        <img
          src="/icon-mail.webp"
          alt="Mail icon"
          width="100"
          height="100"
          className="error-icon"
        />
      </div>

      <div className="center">
        <a href="/" className="btn quote-btn">
          Return to Homepage
        </a>
      </div>
    </>
  )
}

export default Error