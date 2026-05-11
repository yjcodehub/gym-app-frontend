"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 1,
    plan_ids: [] as number[]
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchMembers();
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
        setAvailablePlans(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = editId 
        ? `http://localhost:5000/api/members/${editId}` 
        : 'http://localhost:5000/api/members';
      
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
        setFormData({ name: '', email: '', phone: '', status: 1, plan_ids: [] });
        fetchMembers();
      } else {
        console.error('Failed to save member');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (member: any) => {
    setEditId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status !== undefined ? member.status : 1,
      plan_ids: member.plan_ids || []
    });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: '', email: '', phone: '', status: 1, plan_ids: [] });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (member.phone && member.phone.includes(searchQuery));
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = member.status === 1;
    else if (statusFilter === 'inactive') matchesStatus = member.status === 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="animate-fade-in">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Members</h1>
          <button className="btn-primary" onClick={handleAddNew}>Add Member</button>
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
        ) : filteredMembers.length === 0 ? (
          <div className={styles.emptyState}>No members found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Plans</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member: any) => (
                <tr key={member.id}>
                  <td>#{member.id}</td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {member.plan_names && member.plan_names.length > 0 ? (
                        member.plan_names.map((name: string, i: number) => (
                          <span key={i} style={{ 
                            fontSize: '0.75rem', 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            color: 'var(--primary)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}>
                            {name}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No plans</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      backgroundColor: member.status === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: member.status === 1 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {member.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(member)}
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
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>{editId ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. John Doe"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. john@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
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
                <label>Assign Plans</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '12px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {availablePlans.map((plan: any) => (
                    <label key={plan.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: formData.plan_ids.includes(plan.id) ? 'var(--text-main)' : 'var(--text-muted)',
                      transition: 'color 0.2s'
                    }}>
                      <input 
                        type="checkbox"
                        checked={formData.plan_ids.includes(plan.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...formData.plan_ids, plan.id]
                            : formData.plan_ids.filter(id => id !== plan.id);
                          setFormData({ ...formData, plan_ids: newIds });
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      {plan.name} (₹{plan.price})
                    </label>
                  ))}
                  {availablePlans.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No plans available. Create plans first!</div>}
                </div>
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
                <button type="submit" className="btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
