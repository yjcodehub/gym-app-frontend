"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!mounted) return null; // Prevent hydration errors

  const navItems = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Members', path: '/dashboard/members' },
    { name: 'Trainers', path: '/dashboard/trainers' },
    { name: 'Plans', path: '/dashboard/plans' },
    { name: 'Payments', path: '/dashboard/payments' },
    { name: 'Attendance', path: '/dashboard/attendance' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>GymManager</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navLink} ${pathname === item.path ? styles.activeLink : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
