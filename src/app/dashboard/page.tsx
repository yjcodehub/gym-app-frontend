"use client";

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ members: 0, trainers: 0, revenue: 0 });

  useEffect(() => {
    // Ideally fetch stats from backend API here
    // Mock data for now until API integration is complete
    setStats({ members: 120, trainers: 5, revenue: 4500 });
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3 className={styles.statLabel}>Total Members</h3>
          <p className={styles.statValue}>{stats.members}</p>
        </div>
        
        <div className={`glass-panel ${styles.statCard}`}>
          <h3 className={styles.statLabel}>Active Trainers</h3>
          <p className={styles.statValue}>{stats.trainers}</p>
        </div>
        
        <div className={`glass-panel ${styles.statCard}`}>
          <h3 className={styles.statLabel}>Monthly Revenue</h3>
          <p className={styles.statValue}>${stats.revenue}</p>
        </div>
      </div>
      
      <div className={styles.recentSection}>
        <div className={`glass-panel ${styles.panel}`}>
          <h3 className={styles.panelTitle}>Recent Members</h3>
          <p className={styles.placeholder}>No recent members found.</p>
        </div>
      </div>
    </div>
  );
}
