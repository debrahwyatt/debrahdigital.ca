import styles from './home.module.css';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "Debrah's Digital Solutions",
  description: "Tech solutions in Fairview, Alberta.",
};

export default function HomePage() {
  return (
    <div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>
            Tech Help at Your Doorstep –{' '}
            <span className="highlight">Fast, Friendly, Local.</span>
          </h1>
          <p>Personalized IT, automation, and software solutions for homes, farms, and businesses in Fairview.</p>
          <br />
          <p>Serving Fairview, Alberta and surrounding areas.</p>

          <div className={styles.heroButtons}>
            <Link href="/contact">
              <button className="quote-btn btn">Request a Quote</button>
            </Link>
            <a href="tel:7803309965">
              <button className="call-btn btn">Call Now: (780) 330-9965</button>
            </a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            className={styles.aiHead}
            src="/logo.webp"
            alt="Logo"
            width={250}
            height={250}
            priority
          />
        </div>
      </section>

      {/* Services Icons Grid */}
      <section className={styles.servicesSection}>
        <h2>Our Services</h2>
        <p className={styles.subtitle}>Expert Tech Help with a Human Touch</p>

        <div className={styles.servicesGrid}>
          <div className={styles.serviceItem}>
            <Image
              src="/icon-web.webp"
              alt="Website Design"
              width={48}
              height={48}
              className=""
            />
            <p>Website Design</p>
          </div>
          
          <div className={styles.serviceItem}>
            <Image
              src="/icon-ai.webp"
              alt="AI Tools & Automation"
              width={48}
              height={48}
              className=""
            />
            <p>AI Tools & Automation</p>
          </div>

          <div className={styles.serviceItem}>
            <Image
              src="/icon-consulting.webp"
              alt="Business Tech Consulting"
              width={48}
              height={48}
              className=""
            />
            <p>Business Tech Consulting</p>
          </div>

          <div className={styles.serviceItem}>
            <Image
              src="/icon-network.webp"
              alt="Computer & Network Optimization"
              width={48}
              height={48}
              className=""
            />
            <p>Computer & Network Optimization</p>
          </div>

          <div className={styles.serviceItem}>
            <Image
              src="/icon-onsite.webp"
              alt="On-Site Troubleshooting and Training"
              width={48}
              height={48}
              className=""
            />
            <p>On-Site Troubleshooting & Training</p>
          </div>

          <div className={styles.serviceItem}>
            <Image
              src="/icon-software.webp"
              alt="Custom Software Development"
              width={48}
              height={48}
              className=""
            />
            <p>Custom Software Development</p>
          </div>

        </div>
      </section>

      {/* Info Grid Section */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>

          <div className={styles.infoCard}>
            <h3>What We Do</h3>
            <h4>Expert Tech Help with a Human Touch</h4>
            <ul>
              <li>Website Design</li>
              <li>AI Tools & Automation</li>
              <li>Business Tech Consulting</li>
              <li>Custom Software Development</li>
              <li>Computer & Network Optimization</li>
              <li>On-Site Troubleshooting and Training</li>
            </ul>
            <Link href="/services">
              <button className={`${styles.infoBtn} btn`}>Learn More About Our Services</button>
            </Link>
          </div>

          <div className={styles.infoCard}>
            <h3>Client-Focused Solutions</h3>
            <p>
              Need help with a computer, website, or system upgrade?
              <br /><br />
              I provide on-site visits, remote assistance, and tailored solutions built to match your needs.
            </p>
            <ul className={styles.checklist}>
              <li>Fast Response</li>
              <li>Clear Communication</li>
              <li>Affordable, Professional</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>About Debrah</h3>
            <h4>Debrah Wyatt, E.I.T.</h4>
            <p>
              Software Developer & Tech Consultant
              <br /><br />
              Based in Fairview, AB
              <br />
              Bachelor of Software Engineering, UVic
              <br />
              20+ years experience in tech & automation
            </p>
            <br />
            <em>“Tech made simple, right at your doorstep.”</em>
            <br />
            <Link href="/about">
              <button className={`${styles.infoBtn} btn`}>More About Us</button>
            </Link>
          </div>

          <div className={`${styles.infoCard} ${styles.fullWidth}`}>
            <h3>Contact or Book Now</h3>
            <p>Ready to simplify your tech? Let&apos;s talk.</p>
            <Link href="/contact">
              <button className={`${styles.infoBtn} btn`}>Contact or Book Now</button>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
