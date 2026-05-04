"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/trainers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrainers(data);
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
        <h1 className={styles.pageTitle}>Trainers</h1>
        <button className="btn-primary">Add Trainer</button>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : trainers.length === 0 ? (
          <div className={styles.emptyState}>No trainers found. Add your first trainer!</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer: any) => (
                <tr key={trainer.id}>
                  <td>#{trainer.id}</td>
                  <td>{trainer.name}</td>
                  <td>{trainer.phone}</td>
                  <td>{trainer.specialization}</td>
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
