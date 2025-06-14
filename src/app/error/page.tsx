import Link from 'next/link';
import Image from 'next/image';
import styles from './error.module.css';

export const metadata = {
  title: "Error | Debrah's Digital Solutions",
  description: "There was a problem sending your message. Please try again or call (780) 330-9965.",
};

const Error: React.FC = () => {
  return (
    <>
      <div className={`pageWrapper ${styles.errorWrapper}`}>
        <div className={`pageHeader ${styles.errorMessage}`}>
          <h1>Error</h1>
          <p>
            Your message has not been sent, please try again later or call us at
            <span className="highlight"> (780) 330-9965</span>
          </p>
        </div>
        <Image
          src="/icon-mail.webp"
          alt="Mail icon"
          width={100}
          height={100}
          className={styles.errorIcon}
        />
      </div>

      <div className={styles.center}>
        <Link href="/">
          <button className="quote-btn btn">Return to Homepage</button>
        </Link>
      </div>
    </>
  );
};

export default Error;
