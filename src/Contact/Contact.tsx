import './Contact.css';
import { useEffect } from 'react';

const Contact: React.FC = () => {

  useEffect(() => {
    document.title = "Contact Debrah's Digital Solutions | Local Tech Help";

    // Standard meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", "Get in touch with Debrah's Digital Solutions for personalized IT support, troubleshooting, or a quick tech consultation.");
    }

    // Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "Contact Debrah's Digital Solutions");
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", "Reach out for fast, friendly, and expert tech help in Fairview and surrounding areas.");
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", "https://www.debrahdigital.ca/contact");
    }

    // Twitter metadata
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", "Contact Debrah's Digital Solutions");
    }

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute("content", "Request help, book a visit, or talk to Debrah directly about your tech needs.");
    }

  }, []);

  return (
    <div className='contact-page'>
      <div className="contact-header">
        <h1>Contact</h1>
        <p>
          Fill out the form below to send me an email. Or feel free to give me a call at <span className="highlight">(780) 330-9965</span>
        </p>
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
