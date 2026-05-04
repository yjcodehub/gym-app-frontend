"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    salary: '',
    responsibilities: '',
    status: 1
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.salary || isNaN(Number(formData.salary))) newErrors.salary = 'Valid salary is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = editId 
        ? `http://localhost:5000/api/trainers/${editId}` 
        : 'http://localhost:5000/api/trainers';
        
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setEditId(null);
        setFormData({ name: '', phone: '', specialization: '', salary: '', responsibilities: '', status: 1 });
        fetchTrainers();
      } else {
        console.error('Failed to save trainer');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (trainer: any) => {
    setEditId(trainer.id);
    setFormData({
      name: trainer.name,
      phone: trainer.phone,
      specialization: trainer.specialization,
      salary: trainer.salary,
      responsibilities: trainer.responsibilities || '',
      status: trainer.status !== undefined ? trainer.status : 1
    });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: '', phone: '', specialization: '', salary: '', responsibilities: '', status: 1 });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const filteredTrainers = trainers.filter((trainer: any) => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (trainer.phone && trainer.phone.includes(searchQuery));
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = trainer.status === 1;
    else if (statusFilter === 'inactive') matchesStatus = trainer.status === 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="animate-fade-in">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Trainers</h1>
          <button className="btn-primary" onClick={handleAddNew}>Add Trainer</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="input-field" 
            style={{ maxWidth: '300px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ maxWidth: '180px' }}
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
          >
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Statuses</option>
          </select>
        </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className={styles.emptyState}>No trainers found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Salary</th>
                <th>Responsibilities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.map((trainer: any) => (
                <tr key={trainer.id}>
                  <td>#{trainer.id}</td>
                  <td>{trainer.name}</td>
                  <td>{trainer.phone}</td>
                  <td>{trainer.specialization}</td>
                  <td>₹{trainer.salary}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {trainer.responsibilities || 'None'}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      backgroundColor: trainer.status === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: trainer.status === 1 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {trainer.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(trainer)}
                      style={{color: 'var(--primary)', background: 'transparent'}}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>{editId ? 'Edit Trainer' : 'Add New Trainer'}</h2>
            <form onSubmit={handleAddTrainer}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. Jane Smith"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. (123) 456-7890"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input 
                  type="text" 
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. Weightlifting, Yoga, CrossFit"
                />
                {errors.specialization && <span className="error-text">{errors.specialization}</span>}
              </div>
              <div className="form-group">
                <label>Salary (Monthly)</label>
                <input 
                  type="number" 
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. 5000"
                />
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>
              <div className="form-group">
                <label>Responsibilities</label>
                <textarea 
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. Morning shifts, maintain treadmills"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <div className="switch-container">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={formData.status === 1}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="switch-label">
                    {formData.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '10px 20px', fontWeight: 500 }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Trainer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
