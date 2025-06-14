import styles from './contact.module.css';

export const metadata = {
  title: "Contact Us | Debrah's Digital Solutions",
  description: "Reach out to Debrah's Digital Solutions for tech help, website design, and automation services in Fairview, Alberta. Open Monday to Friday, 10 AM – 3 PM.",
};

const Contact: React.FC = () => {
  return (
    <div className={`pageWrapper ${styles.contactPage}`}>
      <div className={`pageHeader ${styles.contactHeader}`}>
        <h1>Contact Us</h1>
        <p>Reach out — we&apos;re here to help.</p>
      </div>

      <div className={`pageText ${styles.contactText}`}>
        <p>
          Fill out the form below to send an email. Or feel free to give us a call at
          <span className="highlight"> (780) 330-9965</span>
        </p>
      </div>

      <div className={styles.contactFormWrapper}>
        <form action="/send-message.php" method="POST" className={styles.contactForm}>
          <label htmlFor="name">Name</label>
          <input type="text" name="name" id="name" autoComplete="name" required />

          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" autoComplete="email" required />

          <label htmlFor="subject">Subject</label>
          <input type="text" name="subject" id="subject" />

          <label htmlFor="message">Message</label>
          <textarea name="message" id="message" className={styles.formMessage} maxLength={2048} required />

          <button type="submit" className="btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
