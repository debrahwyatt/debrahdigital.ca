import './Footer.css';

const Footer: React.FC = () => {

  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* <!-- About Section --> */}
        <div className="footer-section">
          <h3>Partners</h3>
          <ul>
          <li>
            <a href="https://fairviewchamber.com/" target="_blank" rel="noopener noreferrer">
              <img src="/assets/chamber-of-commerce-logo.webp" alt="Town of Fairview" />
            </a>
          </li>            
          <li>
            <a href="https://www.fairview.ca/" target="_blank" rel="noopener noreferrer">
              <img src="/assets/town_of_fairview_logo.webp" alt="Town of Fairview" />
            </a>
          </li>          
          </ul>      
        </div>

        {/* <!-- Quick Links --> */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/services">Our Services</a></li>
            <li><a href="/about">About Debrah</a></li>
            <li><a href="/contact">Contact Us</a></li>
            {/* <li><a href="/faq">FAQ</a></li> */}
            <li><a href="https://www.google.com/maps/search/Fairview+Alberta" target="_blank">Find Fairview, Alberta</a></li>
          </ul>
        </div>

        {/* <!-- Helpful Resources --> */}
        <div className="footer-section">
          <h3>Helpful Resources</h3>
          <ul>
            <li><a href="https://support.microsoft.com/" target="_blank">Microsoft Support</a></li>
            <li><a href="https://www.apple.com/support/" target="_blank">Apple Support</a></li>
            <li><a href="https://www.canada.ca/en/services/business.html" target="_blank">Canada Business Services</a></li>
            <li><a href="https://haveibeenpwned.com/" target="_blank">Check Data Breaches</a></li>
            <li><a href="https://speedtest.net/" target="_blank">Internet Speed Test</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        &copy; 2025 Debrah's Digital Solutions. All rights reserved.
        | <a href="/privacy-policy">Privacy Policy</a>
      </div>

    </footer>
  );
};

export default Footer;
