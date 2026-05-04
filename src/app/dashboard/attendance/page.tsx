"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
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
        <h1 className={styles.pageTitle}>Attendance</h1>
        <button className="btn-primary">Mark Attendance</button>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : attendance.length === 0 ? (
          <div className={styles.emptyState}>No attendance records found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record: any) => (
                <tr key={record.id}>
                  <td>#{record.id}</td>
                  <td>{record.member_id}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.status}</td>
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
