import './Services.css';

import { useEffect } from 'react';
import { updateMetadata } from '../updateMetadata';


const Services: React.FC = () => {

  useEffect(() => {
    updateMetadata({
      title: "Services - Debrah's Digital Solutions",
      ogUrl: "https://www.debrahdigital.ca/services",
      ogTitle: "Services - Debrah's Digital Solutions",
      twitterTitle: "Services - Debrah's Digital Solutions",
      ogImage: "https://www.debrahdigital.ca/assets/banner2.webp",
      twitterImage: "https://www.debrahdigital.ca/assets/banner2.webp",       
      twitterDescription: "Explore custom IT solutions and friendly support for your home, business, or farm in Fairview, Alberta.",
      ogDescription: "Discover personalized tech support and innovative solutions including website design, AI tools, networking, and more.",
      description: "Explore expert IT services, automation, website design, and more tailored for homes, farms, and businesses in Fairview, Alberta.",    
    });
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
