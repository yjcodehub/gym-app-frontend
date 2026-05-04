"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Membership Plans</h1>
        <button className="btn-primary">Add Plan</button>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : plans.length === 0 ? (
          <div className={styles.emptyState}>No plans found. Add your first plan!</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Duration (Months)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan: any) => (
                <tr key={plan.id}>
                  <td>#{plan.id}</td>
                  <td>{plan.name}</td>
                  <td>${plan.price}</td>
                  <td>{plan.duration_months}</td>
                  <td>
                    <button style={{marginRight: '8px', color: 'var(--primary)', background: 'transparent'}}>Edit</button>
                    <button style={{color: 'var(--danger)', background: 'transparent'}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
