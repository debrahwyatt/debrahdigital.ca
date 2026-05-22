import '../styles/error.css'

function Error() {
  return (
    <>
      <div className="page-wrapper error-wrapper">
        <div className="page-header error-message">
          <h1>Error</h1>

          <p>
            Your message has not been sent, please try again later or call us
            at
            <span className="highlight"> (780) 330-9965</span>
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