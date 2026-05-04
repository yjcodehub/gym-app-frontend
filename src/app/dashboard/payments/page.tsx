"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
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
        <h1 className={styles.pageTitle}>Payments</h1>
        <button className="btn-primary">Record Payment</button>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : payments.length === 0 ? (
          <div className={styles.emptyState}>No payments found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment: any) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.member_id}</td>
                  <td>${payment.amount}</td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>{payment.status}</td>
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
