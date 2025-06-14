import Link from 'next/link';
import Image from 'next/image';
import styles from './success.module.css';

export const metadata = {
  title: "Success | Debrah's Digital Solutions",
  description: "Thank you for contacting us. Your message was successfully submitted.",
};

const Success: React.FC = () => {
  return (
    <>
      <div className={`pageWrapper ${styles.thankYouWrapper}`}>
        <div className={`pageHeader ${styles.thankYouMessage}`}>
          <h1>Thank You!</h1>
          <p>Your message has been sent successfully.</p>
        </div>
        <Image
          src="/icon-mail.webp"
          alt="Mail icon"
          width={100}
          height={100}
          className={styles.thankYouIcon}
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

export default Success;
