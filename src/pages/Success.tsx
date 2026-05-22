import '../styles/success.css'

function Success() {
  return (
    <>
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