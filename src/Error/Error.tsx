import './Error.css';

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateMetadata } from '../updateMetadata';

const Error: React.FC = () => {

  useEffect(() => {
    updateMetadata({
      title: "Error | Debrah's Digital Solutions",
      ogUrl: "https://www.debrahdigital.ca/error",
      description: "Your message has not been sent, please try again later.",    
    });
  }, []);

  return (
    <>
      <div className="error-wrapper">
        <div className="error-message">
          <h1>Error</h1>
          <p>Your message has not been sent, please try again later or call us at <span className='highlight'>(780) 330-9965</span></p>
        </div>
        <img src="/assets/icon-mail.webp" alt="Mail icon" className="error-icon" />
      </div>
      <div className='center'>
      <Link to="/">
        <button className="quote-btn btn">Return to Homepage</button>
      </Link>    
      </div>
    </>
  );
};

export default Error;
