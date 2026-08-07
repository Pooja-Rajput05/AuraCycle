import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>AuraCycle</span>
          <p className={styles.tagline}>
            A compassionate digital health companion for menstrual wellness.
          </p>
        </div>

        <div className={styles.links}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/calendar">Tracker</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/wellness">Wellness</Link>
        </div>

        <p className={styles.disclaimer}>
          AuraCycle is for wellness tracking only and does not provide medical diagnosis or treatment.
          Always consult a qualified healthcare provider for medical concerns.
        </p>

        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} AuraCycle. Built with care for women&apos;s health.
        </p>
      </div>
    </footer>
  );
}
