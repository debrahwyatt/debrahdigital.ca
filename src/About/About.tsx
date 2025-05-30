import './About.css';

import { useEffect } from 'react';


const About: React.FC = () => {

  useEffect(() => {
    document.title = "About – Debrah's Digital Solutions";

    // Standard meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Meet Debrah Wyatt – a software engineer bringing personalized tech support, automation, and IT services to Fairview, Alberta.");

    // Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "About – Debrah's Digital Solutions");

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Learn more about Debrah Wyatt's mission to simplify technology and provide human-centered IT support to rural Alberta.");

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", "https://www.debrahdigital.ca/assets/about-preview.webp");

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", "https://www.debrahdigital.ca/about");

    // Twitter metadata
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "About – Debrah's Digital Solutions");

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", "Get to know Debrah Wyatt and the story behind Fairview's friendliest tech support and automation business.");

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute("content", "https://www.debrahdigital.ca/assets/about-preview.webp");

  }, []);


  return (
    <div className="about-page">

      <div className="about-header">
        <h1>About Us</h1>
        <p>Tech made simple, right at your doorstep</p>
      </div>

      <div className="about-content">

        <div className="about-text">
          <p>
            Hi, I'm <strong>Debrah Wyatt</strong> — a software engineer-in-training, automation specialist and founder of 
            <span className="highlight"> Debrah's Digital Solutions</span>.
          </p>
          <p>
            With over 20 years of experience in tech, I help individuals and businesses in Fairview and surrounding 
            areas simplify their digital needs. From streamlining operations with smart automation to building clean, 
            responsive websites, I bring a human touch to modern tech.
          </p>
          <p>
            Let's make your <span className="highlight">tech simple, efficient, and tailored to your needs.</span>
          </p>
        </div>

        <div className="about-image">
          <img src="../assets/debrah.webp" alt="Debrah Portrait" />
        </div>

      </div>

    </div>
  );
};

export default About;
