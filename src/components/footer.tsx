import Image from 'next/image';
import styles from './footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerContainer}>

        <div className={styles.footerSection}>
          <h3>Partners</h3>
          <ul>
            <li>
              <a href="https://fairviewchamber.com/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/chamber-of-commerce-logo.webp"
                  alt="Town of Fairview"
                  width={200}
                  height={100}
                  className={styles.footerLogo}
                />
              </a>
            </li>
            <li>
              <a href="https://www.fairview.ca/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/town_of_fairview_logo.webp"
                  alt="Town of Fairview"
                  width={210}
                  height={70}
                  className={styles.footerLogo}
                />
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/services">Our Services</a></li>
            <li><a href="/about">About Debrah</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="https://www.google.com/maps/search/Fairview+Alberta" target="_blank">Find Fairview, Alberta</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
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

      <div className={styles.footerBottom}>
        &copy; 2025 Debrah&apos;s Digital Solutions. All rights reserved. | <a href="/privacy-policy">Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;
