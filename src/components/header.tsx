import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.siteHeader}>
      <nav>

        <Link className={styles.bannerLink} href="/">
          <Image
            src="/banner.webp"
            alt="Banner"
            width={230}
            height={60}
            priority
          />
        </Link>

        <span className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </span>

      </nav>
    </header>
  );
};

export default Header;
