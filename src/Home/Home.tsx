import './Home.css';

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateMetadata } from '../updateMetadata';


const Home: React.FC = () => {

  useEffect(() => {
    updateMetadata({
      ogUrl: "https://www.debrahdigital.ca",
      ogTitle: "Debrah's Digital Solutions",
      twitterTitle: "Debrah's Digital Solutions",
      title: "Debrah's Digital Solutions | Fairview Tech Help",
      ogImage: "https://www.debrahdigital.ca/assets/preview.webp",
      twitterImage: "https://www.debrahdigital.ca/assets/preview.webp",
      ogDescription: "Tech Help at Your Doorstep - Fast, Friendly, Local.",
      twitterDescription: "Tailored tech help and automation for businesses and homes in Alberta.",
      description: "Personalized IT, automation, and software solutions for homes, farms, and businesses in Fairview.",
    });
  }, []);
  

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">

        <div className="hero-text">
          <h1>
            Tech Help at Your Doorstep -{' '}
            <span className="highlight">Fast, Friendly, Local.</span>
          </h1>
          <p>
            Personalized IT, automation, and software solutions for homes, farms, and businesses in Fairview.
            <br />
            <br />
            Serving Fairview, Alberta and surrounding areas.
          </p>

          <div className="hero-buttons">
            <Link to="/contact">
              <button className="quote-btn btn">Request a Quote</button>
            </Link>
            <a href="tel:7803309965"><button className="call-btn btn">Call Now: (780) 330-9965</button></a>
          </div>
        </div>

        <div className="hero-image">
          <img className="ai-head" src="../assets/ai-head.webp" alt="AI Head" />
        </div>

      </section>

      {/* Services Icons Grid */}
      <section className="services-section">

        <h2>Our Services</h2>
        <p className="subtitle">Expert Tech Help with a Human Touch</p>

        <div className="services-grid">
          
          <div className="service-item">
            <img src="../assets/icon-web.webp" alt="Website Design" />
            <p>Website Design</p>
          </div>

          <div className="service-item">
            <img src="../assets/icon-ai.webp" alt="AI Tools & Automation" />
            <p>AI Tools & Automation</p>
          </div>

          <div className="service-item">
            <img src="../assets/icon-consulting.webp" alt="Business Tech Consulting" />
            <p>Business Tech Consulting</p>
          </div>

          <div className="service-item">
            <img src="../assets/icon-network.webp" alt="Computer & Network Optimization" />
            <p>Computer & Network Optimization</p>
          </div>

          <div className="service-item">
            <img src="../assets/icon-onsite.webp" alt="On-Site Troubleshooting and Training" />
            <p>On-Site Troubleshooting & Training</p>
          </div>

          <div className="service-item">
            <img src="../assets/icon-software.webp" alt="Custom Software Development" />
            <p>Custom Software Development</p>
          </div> 

        </div>

      </section>

      {/* Info Grid Section */}
      <section className="info-section">
        <div className="info-grid">
          
          <div className="info-card">
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
            <Link to="/services">
              <button className="info-btn btn">Learn More About Our Services</button>
            </Link> 
          </div>
          
          <div className="info-card">
            <h3>Client-Focused Solutions</h3>
            <p>
              Need help with a computer, website, or system upgrade?
              <br />
              <br />
              I provide on-site visits, remote assistance, and tailored solutions built to match your needs.
            </p>
            <ul className="checklist">
              <li>Fast Response</li>
              <li>Clear Communication</li>
              <li>Affordable, Professional</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>About Debrah</h3>
            <h4>Debrah Wyatt, E.I.T.</h4>
            <p>              
              Software Developer & Tech Consultant
              <br />
              <br />
              Based in Fairview, AB
              <br />
              Bachelor of Software Engineering, UVic
              <br />
              20+ years experience in tech & automation
            </p>
            <br />
            <em>“Tech made simple. right at your doorstep.”</em>
            <br />
            <Link to="/about">
              <button className="info-btn btn">More About Us</button>
            </Link>
          </div>

          <div className="info-card full-width">
            <h3>Contact or Book Now</h3>
            <p>Ready to simplify your tech? Let's talk.</p>
            <div className="button-row">
              <Link to="/contact">
                <button className="info-btn btn">Contact or Book Now</button>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Home;
