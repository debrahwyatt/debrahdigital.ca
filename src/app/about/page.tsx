import Image from 'next/image';
import styles from './about.module.css';

export const metadata = {
  title: "About Debrah | Debrah's Digital Solutions",
  description: "Learn more about Debrah Wyatt — a software engineer and automation specialist providing friendly, local tech help in Fairview, Alberta.",
};

const About: React.FC = () => {
  return (
    <div className={`pageWrapper ${styles.aboutPage}`}>
      <div className={`pageHeader ${styles.aboutHeader}`}>
        <h1>About Us</h1>
        <p>Tech made simple, right at your doorstep</p>
      </div>

      <div className={styles.aboutContent}>
        <div className={`pageText ${styles.aboutText}`}>
          <p>
            Hi, I&apos;m <strong>Debrah Wyatt</strong> — a software engineer-in-training, automation specialist and founder of
            <span className="highlight"> Debrah&apos;s Digital Solutions</span>.
          </p>
          <p>
            With over 20 years of experience in tech, I help individuals and businesses in Fairview and surrounding
            areas simplify their digital needs. From streamlining operations with smart automation to building clean,
            responsive websites, I bring a human touch to modern tech.
          </p>
          <p>Let&apos;s make your <span className="highlight">tech simple, efficient, and tailored to your needs.</span></p>
        </div>

        <div className={styles.aboutImage}>
          <Image
            src="/debrah.webp"
            alt="Debrah Portrait"
            width={280}
            height={280}
          />
        </div>
      </div>
    </div>
  );
};

export default About;
