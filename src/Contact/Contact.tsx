import './Contact.css';

const Contact: React.FC = () => {

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
