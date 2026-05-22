import '../styles/footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-headers">
            Debrah&apos;s Digital Solutions Ltd.
          </div>

          <a
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

          <p>
            <br />
            <a href="tel:+17803309965">(780) 330-9965</a>
            <br />
            <a href="mailto:info@debrahdigital.ca">info@debrahdigital.ca</a>
            <br />
          </p>
        </div>

        <div className="footer-section">
          <div className="footer-headers">Hours</div>

          Monday - Friday
          <br />
          9:00 AM - 5:30 PM
          <br />
        </div>

        <div className="footer-section">
          <div className="footer-headers">Helpful Resources</div>

          <ul>
            <li>
              <a
                href="https://support.microsoft.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Support
              </a>
            </li>

            <li>
              <a
                href="https://www.apple.com/support/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple Support
              </a>
            </li>

            <li>
              <a
                href="https://www.canada.ca/en/services/business.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Canada Business Services
              </a>
            </li>

            <li>
              <a
                href="https://haveibeenpwned.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Check Data Breaches
              </a>
            </li>

            <li>
              <a
                href="https://speedtest.net/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Internet Speed Test
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <div className="footer-headers">Partners</div>

          <ul>
            <li>
              <a
                href="https://fairviewchamber.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/chamber-of-commerce-logo_web.webp"
                  alt="Chamber of Commerce"
                  width="209"
                  height="100"
                  className="footer-logo"
                />
              </a>
            </li>

            <li>
              <a
                href="https://www.fairview.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/town_of_fairview_logo_web.webp"
                  alt="Town of Fairview"
                  width="213"
                  height="70"
                  className="footer-logo"
                />
              </a>
            </li>

            <li>
              <a
                href="http://nwpcalc.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/nwpcalc_logo_web.webp"
                  alt="Northwest Peace Community Adult Learning Council"
                  width="252"
                  height="57"
                  className="footer-logo"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        Serving Fairview &amp; surrounding area{' '}
        <span className="highlight">
          • On-site and remote support available
        </span>

        <div className="footer-bottom-footnote">
          &copy; {year} Debrah&apos;s Digital Solutions Ltd. All rights reserved. |
          <a href="/privacy-policy"> Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
