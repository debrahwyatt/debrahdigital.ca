import './Success.css';

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateMetadata } from '../updateMetadata';

const Success: React.FC = () => {

  useEffect(() => {
    updateMetadata({
      title: "Message Sent | Debrah's Digital Solutions",
      ogUrl: "https://www.debrahdigital.ca/success",
      ogTitle: "Thanks for Reaching Out!",
      twitterTitle: "Message Received | Debrah's Digital Solutions",    
      twitterDescription: "Thanks for contacting us! We'll be in touch soon.",
      ogDescription: "Your message was sent successfully. Expect a prompt reply from Fairview's local tech expert.",
      description: "Thank you for contacting Debrah's Digital Solutions. We'll get back to you shortly with personalized tech support.",    
    });
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
