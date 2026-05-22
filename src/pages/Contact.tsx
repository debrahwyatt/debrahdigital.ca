import '../styles/contact.css'
import SEO from '../components/SEO'

function Contact() {
  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Contact"
        description="Contact Debrah's Digital Solutions in Fairview, Alberta for computer repair, IT support, website development, networking, and technology consulting services."
        path="/contact"
      />

      <div className="page-wrapper contact-page">
        <div className="page-header contact-header">
          <h1>Contact Us</h1>

          <p>
            Reach out — we&apos;re here to help.
          </p>
        </div>

        <div className="contact-card">
          <h2>
            Debrah&apos;s Digital Solutions Ltd.
          </h2>

          <div className="contact-info-group">
            <div className="contact-info-item">
              <span className="contact-label">
                Address
              </span>

              <a
                className="contact-address"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.google.com/maps/place/Debrah's+Digital+Solutions/@56.068149,-118.4672741,12z/data=!4m16!1m9!4m8!1m0!1m6!1m2!1s0xa1883905c94de97d:0x2e832a1a08abed4d!2s10308+110+St+unit+4,+Fairview,+AB+T0H+1L0!2m2!1d-118.3847035!2d56.0681766!3m5!1s0xa1883905c94de97d:0x2e832a1a08abed4d!8m2!3d56.0681766!4d-118.3847035!16s%2Fg%2F11x7zc25gf"
              >
                Mall On Main - Unit 4
                <br />
                10308 110 St.
                <br />
                P.O. Box 2589
                <br />
                Fairview, AB T0H 1L0
              </a>
            </div>

            <div className="contact-info-item">
              <span className="contact-label">
                Phone
              </span>

              <a href="tel:+17803309965">
                (780) 330-9965
              </a>
            </div>

            <div className="contact-info-item">
              <span className="contact-label">
                Email
              </span>

              <a href="mailto:info@debrahdigital.ca">
                info@debrahdigital.ca
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <form
            action="/send-message.php"
            method="POST"
            className="contact-form"
          >
            <label htmlFor="name">
              Name
            </label>

            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              required
            />

            <label htmlFor="email">
              Email
            </label>

            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
            />

            <label htmlFor="subject">
              Subject
            </label>

            <input
              type="text"
              name="subject"
              id="subject"
            />

            <label htmlFor="message">
              Message
            </label>

            <textarea
              name="message"
              id="message"
              className="form-message"
              maxLength={2048}
              required
            />

            <button
              type="submit"
              className="btn"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Contact