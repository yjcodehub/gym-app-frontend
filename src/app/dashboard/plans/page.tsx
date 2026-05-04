"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'Only GYM',
    price: '',
    duration_months: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categoryFilter, setCategoryFilter] = useState('All Plans');

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

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Category is required';
    if (!formData.price || isNaN(Number(formData.price))) newErrors.price = 'Valid price is required';
    if (!formData.duration_months || isNaN(Number(formData.duration_months))) newErrors.duration_months = 'Valid duration is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = editId 
        ? `http://localhost:5000/api/plans/${editId}` 
        : 'http://localhost:5000/api/plans';
        
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditId(null);
        setFormData({ name: 'Only GYM', price: '', duration_months: '' });
        fetchPlans();
      } else {
        console.error('Failed to save plan');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (plan: any) => {
    setEditId(plan.id);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration_months: plan.duration_months
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: 'Only GYM', price: '', duration_months: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const getPlanGradient = (name: string) => {
    if (name === 'Only GYM') return 'grad-slate';
    if (name === 'Gym + Cardio') return 'grad-cyan';
    if (name === 'Gym + Cardio + Activities') return 'grad-purple';
    if (name === 'Personal Training (Basic)') return 'grad-amber';
    if (name === 'Personal Training (Moderate)') return 'grad-emerald';
    if (name === 'Personal Training (Advance)') return 'grad-ruby';
    return 'grad-slate';
  };

  const filteredPlans = plans.filter((plan: any) => {
    if (categoryFilter === 'All Plans') return true;
    if (categoryFilter === 'Personal Training') return plan.name.includes('Personal Training');
    return plan.name === categoryFilter;
  });

  return (
    <>
      <div className="animate-fade-in">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Membership Plans</h1>
          <button className="btn-primary" onClick={handleAddNew}>Add Plan</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <select 
            className="input-field" 
            style={{ maxWidth: '250px' }}
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
          >
            <option value="All Plans">All Plans</option>
            <option value="Only GYM">Only GYM</option>
            <option value="Gym + Cardio">Gym + Cardio</option>
            <option value="Gym + Cardio + Activities">Gym + Cardio + Activities</option>
            <option value="Personal Training">Personal Training (All)</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : filteredPlans.length === 0 ? (
          <div className={styles.emptyState}>No plans found.</div>
        ) : (
          <div className="plans-grid">
            {filteredPlans.map((plan: any) => (
              <div key={plan.id} className={`plan-card ${getPlanGradient(plan.name)}`}>
                <h3>{plan.name}</h3>
                <div className="price">₹{plan.price}</div>
                <div className="duration">{plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}</div>
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(plan)}
                >
                  Edit Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>{editId ? 'Edit Plan' : 'Add New Plan'}</h2>
            <form onSubmit={handleAddPlan}>
              <div className="form-group">
                <label>Plan Category</label>
                <select 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Only GYM">Only GYM</option>
                  <option value="Gym + Cardio">Gym + Cardio</option>
                  <option value="Gym + Cardio + Activities">Gym + Cardio + Activities</option>
                  <option value="Personal Training (Basic)">Personal Training (Basic)</option>
                  <option value="Personal Training (Moderate)">Personal Training (Moderate)</option>
                  <option value="Personal Training (Advance)">Personal Training (Advance)</option>
                </select>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. 50.00"
                  step="0.01"
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label>Duration (Months)</label>
                <input 
                  type="number" 
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. 3"
                />
                {errors.duration_months && <span className="error-text">{errors.duration_months}</span>}
              </div>
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '10px 20px', fontWeight: 500 }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
