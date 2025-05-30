import './Contact.css';

import { useEffect } from 'react';
import { updateMetadata } from '../updateMetadata';

const Contact: React.FC = () => {

  useEffect(() => {
    updateMetadata({
      ogUrl: "https://www.debrahdigital.ca/contact",
      ogTitle: "Contact Debrah's Digital Solutions",
      twitterTitle: "Contact Debrah's Digital Solutions",
      title: "Contact Debrah's Digital Solutions | Local Tech Help",
      twitterDescription: "Request help, book a visit, or talk to Debrah directly about your tech needs.",
      ogDescription: "Reach out for fast, friendly, and expert tech help in Fairview and surrounding areas.",
      description: "Get in touch with Debrah's Digital Solutions for personalized IT support, troubleshooting, or a quick tech consultation.",      
    });
  }, []);

  return (
    <div className='contact-page'>

      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="contact-hours">
          Monday to Friday, 10 AM - 3 PM
        </p>   
      </div>     

      <div className='contact-text'>
        <p>
          Fill out the form below to send an email. Or feel free to give us a call at <span className="highlight">(780) 330-9965</span>
        </p>
        <br />
      </div>

      <form action="../send-message.php" method="POST" className="contact-form">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" required />

        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required />

        <label htmlFor="subject">Subject</label>
        <input type="text" name="subject" id="subject" />

        <label htmlFor="message">Message</label>
        <textarea name="message" id="message" maxLength={2048} required />

        <button type="submit" className="btn">Send Message</button>
      </form>
      
    </div>
  );
};

export default Contact;
