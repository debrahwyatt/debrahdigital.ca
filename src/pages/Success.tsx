import '../styles/success.css'
import SEO from '../components/SEO'

function Success() {
  return (
    <>
      <SEO
        title="Message Sent | Debrah's Digital Solutions"
        description="Your message has been successfully sent to Debrah's Digital Solutions. We’ll get back to you as soon as possible."
        path="/success"
      />

      <div className="page-wrapper thank-you-wrapper">
        <div className="page-header thank-you-message">
          <h1>Thank You!</h1>
          <p>Your message has been sent successfully.</p>
        </div>

        <img
          src="/icon-mail.webp"
          alt="Mail icon"
          width="100"
          height="100"
          className="thank-you-icon"
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

export default Success