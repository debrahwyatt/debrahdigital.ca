import Image from 'next/image';
import styles from './services.module.css';

export const metadata = {
  title: "Our Services | Debrah's Digital Solutions",
  description: "Explore our range of personalized IT services, including web design, AI tools, consulting, and on-site tech support in Fairview, Alberta.",
};

const Services: React.FC = () => {
  return (
    <div className={`pageWrapper ${styles.servicesPage}`}>

      <div className={`pageHeader ${styles.servicesHeader}`}>
        <h1>Our Services</h1>
        <p>Tailored Tech Solutions for Your Needs</p>
      </div>

      <section className={styles.servicesGrid}>
        <div className={styles.serviceCard}>
          <Image src="/icon-web.webp" alt="Website Design" width={64} height={64} />
          <h2>Website Design</h2>
          <p>Custom, responsive websites that are user-friendly and visually appealing.</p>
        </div>

        <div className={styles.serviceCard}>
          <Image src="/icon-ai.webp" alt="AI Tools & Automation" width={64} height={64} />
          <h2>AI Tools & Automation</h2>
          <p>Boost your productivity with smart AI solutions and automated processes.</p>
        </div>

        <div className={styles.serviceCard}>
          <Image src="/icon-software.webp" alt="Custom Software Development" width={64} height={64} />
          <h2>Custom Software Development</h2>
          <p>Software tailored to your specific requirements and goals.</p>
        </div>

        <div className={styles.serviceCard}>
          <Image src="/icon-consulting.webp" alt="Business Tech Consulting" width={64} height={64} />
          <h2>Business Tech Consulting</h2>
          <p>Expert advice to align your technology with business objectives.</p>
        </div>

        <div className={styles.serviceCard}>
          <Image src="/icon-network.webp" alt="Computer & Network Optimization" width={64} height={64} />
          <h2>Computer & Network Optimization</h2>
          <p>Speed up your systems and ensure your network runs smoothly.</p>
        </div>

        <div className={styles.serviceCard}>
          <Image src="/icon-onsite.webp" alt="On-Site Troubleshooting & Training" width={64} height={64} />
          <h2>On-Site Troubleshooting & Training</h2>
          <p>Get direct help and training right at your location.</p>
        </div>

      </section>
    </div>
  );
};

export default Services;
