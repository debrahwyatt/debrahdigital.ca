import './Services.css';
import { useEffect } from 'react';

const Services: React.FC = () => {

  useEffect(() => {
    document.title = "Services – Debrah's Digital Solutions";

    // Standard meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", "Explore expert IT services, automation, website design, and more tailored for homes, farms, and businesses in Fairview, Alberta.");
    }

    // Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "Services – Debrah's Digital Solutions");
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", "Discover personalized tech support and innovative solutions including website design, AI tools, networking, and more.");
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute("content", "https://www.debrahdigital.ca/assets/services-preview.webp");
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", "https://www.debrahdigital.ca/services");
    }

    // Twitter metadata
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", "Services – Debrah's Digital Solutions");
    }

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute("content", "Explore custom IT solutions and friendly support for your home, business, or farm in Fairview, Alberta.");
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute("content", "https://www.debrahdigital.ca/assets/services-preview.webp");
    }

  }, []);

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>Tailored Tech Solutions for Your Needs</p>
      </div>

      <section className="services-grid">
        <div className="service-card">
          <img src="../assets/icon-web.webp" alt="Website Design" />
          <h2>Website Design</h2>
          <p>Custom, responsive websites that are user-friendly and visually appealing.</p>
        </div>
        <div className="service-card">
          <img src="../assets/icon-ai.webp" alt="AI Tools & Automation" />
          <h2>AI Tools & Automation</h2>
          <p>Boost your productivity with smart AI solutions and automated processes.</p>
        </div>
        <div className="service-card">
          <img src="../assets/icon-software.webp" alt="Custom Software Development" />
          <h2>Custom Software Development</h2>
          <p>Software tailored to your specific requirements and goals.</p>
        </div>
        <div className="service-card">
          <img src="../assets/icon-consulting.webp" alt="Business Tech Consulting" />
          <h2>Business Tech Consulting</h2>
          <p>Expert advice to align your technology with business objectives.</p>
        </div>
        <div className="service-card">
          <img src="../assets/icon-network.webp" alt="Computer & Network Optimization" />
          <h2>Computer & Network Optimization</h2>
          <p>Speed up your systems and ensure your network runs smoothly.</p>
        </div>
        <div className="service-card">
          <img src="../assets/icon-onsite.webp" alt="On-Site Troubleshooting & Training" />
          <h2>On-Site Troubleshooting & Training</h2>
          <p>Get direct help and training right at your location.</p>
        </div>
      </section>
    </div>
  );
};

export default Services;
