import { Link } from 'react-router-dom';
import './Success.css';
import { useEffect } from 'react';

const Success: React.FC = () => {

  useEffect(() => {
    document.title = "Message Sent | Debrah's Digital Solutions";

    // Standard meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", "Thank you for contacting Debrah's Digital Solutions. We'll get back to you shortly with personalized tech support.");
    }

    // Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "Thanks for Reaching Out!");
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", "Your message was sent successfully. Expect a prompt reply from Fairview's local tech expert.");
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", "https://www.debrahdigital.ca/success");
    }

    // Twitter metadata
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", "Message Received | Debrah's Digital Solutions");
    }

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute("content", "Thanks for contacting us! We'll be in touch soon.");
    }

  }, []);

  return (
    <>
      <div className="thank-you-wrapper">
        <div className="thank-you-message">
          <h1>Thank You!</h1>
          <p>Your message has been sent successfully.</p>
        </div>
        <img src="/assets/icon-mail.webp" alt="Mail icon" className="thank-you-icon" />
      </div>
      <div className='center'>
      <Link to="/">
        <button className="quote-btn btn">Return to Homepage</button>
      </Link>    
      </div>
    </>
  );
};

export default Success;
