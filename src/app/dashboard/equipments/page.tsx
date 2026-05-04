"use client";

import { useEffect, useState } from 'react';
import styles from '../sharedTable.module.css';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // Form data
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [assignData, setAssignData] = useState({ equipment_id: '', trainer_id: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [equipRes, trainRes] = await Promise.all([
        fetch('http://localhost:5000/api/equipments', { headers }),
        fetch('http://localhost:5000/api/trainers', { headers })
      ]);
      
      if (equipRes.ok) setEquipments(await equipRes.json());
      if (trainRes.ok) setTrainers(await trainRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipmentName.trim()) {
      setErrors({ name: 'Equipment name is required' });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/equipments', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newEquipmentName })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewEquipmentName('');
        setErrors({});
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAssignModal = (equipmentId: string) => {
    setAssignData({ equipment_id: equipmentId, trainer_id: '' });
    setErrors({});
    setIsAssignModalOpen(true);
  };

  const handleAssignEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.trainer_id) {
      setErrors({ trainer_id: 'Please select a trainer' });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/equipments/${assignData.equipment_id}/assign`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trainer_id: assignData.trainer_id })
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReturnEquipment = async (equipmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/equipments/${equipmentId}/return`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if(!confirm('Are you sure you want to delete this equipment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/equipments/${equipmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Equipments</h1>
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>Add Equipment</button>
        </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : equipments.length === 0 ? (
          <div className={styles.emptyState}>No equipment found. Add your first equipment!</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((eq: any) => (
                <tr key={eq.id}>
                  <td>#{eq.id}</td>
                  <td>{eq.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      backgroundColor: eq.status === 'Available' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: eq.status === 'Available' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {eq.status}
                    </span>
                  </td>
                  <td>{eq.assigned_to || '-'}</td>
                  <td>
                    {eq.status === 'Available' ? (
                      <button 
                        onClick={() => openAssignModal(eq.id)}
                        style={{marginRight: '8px', color: 'var(--primary)', background: 'transparent'}}
                      >
                        Assign
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReturnEquipment(eq.id)}
                        style={{marginRight: '8px', color: '#f59e0b', background: 'transparent'}}
                      >
                        Return
                      </button>
                    )}
                    <button onClick={() => handleDeleteEquipment(eq.id)} style={{color: 'var(--danger)', background: 'transparent'}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Add New Equipment</h2>
            <form onSubmit={handleAddEquipment}>
              <div className="form-group">
                <label>Equipment Name</label>
                <input 
                  type="text" 
                  value={newEquipmentName}
                  onChange={(e) => { setNewEquipmentName(e.target.value); setErrors({}); }}
                  className="input-field" 
                  placeholder="e.g. Resistance Bands"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '10px 20px', fontWeight: 500 }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Equipment Modal */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setIsAssignModalOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Assign Equipment</h2>
            <form onSubmit={handleAssignEquipment}>
              <div className="form-group">
                <label>Select Trainer</label>
                <select 
                  value={assignData.trainer_id}
                  onChange={(e) => { setAssignData({...assignData, trainer_id: e.target.value}); setErrors({}); }}
                  className="input-field"
                >
                  <option value="">-- Choose a Trainer --</option>
                  {trainers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.trainer_id && <span className="error-text">{errors.trainer_id}</span>}
              </div>
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" onClick={() => setIsAssignModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '10px 20px', fontWeight: 500 }}>Cancel</button>
                <button type="submit" className="btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
