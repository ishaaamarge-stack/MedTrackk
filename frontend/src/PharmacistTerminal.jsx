import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Pill, CheckCircle, AlertCircle } from 'lucide-react';

export default function PharmacistTerminal() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ patient_id: '', patient_phone: '', medicine_name: '', quantity: 1 });
  const [notification, setNotification] = useState(null);

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNotification({ type: 'success', message: data.sms, alert: data.restockTriggered });
      setForm({ patient_id: '', patient_phone: '', medicine_name: '', quantity: 1 });
      fetchInventory();
      setTimeout(() => setNotification(null), 5000);
    } catch (e) {
      setNotification({ type: 'error', message: e.message });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div>
      <div className="hero-banner" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <div className="hero-content">
          <h1>Pharmacist Terminal</h1>
          <p>Secure, patient-verified dispensation with real-time inventory tracking and automatic restocking triggers.</p>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            <h2 style={{ margin: 0 }} className="gradient-text">Secure Dispensing</h2>
        </div>
        
        {notification && (
          <div className={`glass-panel ${notification.type === 'error' ? 'badge-danger' : 'badge-success'}`} style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            {notification.type === 'error' ? <AlertCircle /> : <CheckCircle />}
            <div>
              <p style={{ color: 'inherit', margin: 0 }}>{notification.message}</p>
              {notification.alert && <p style={{ color: 'var(--warning)', marginTop: '8px', fontSize: '0.9rem' }}>⚠️ Stock below 15% - Auto restock triggered!</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleDispense}>
          <div className="input-group">
            <label><Phone size={14} style={{ display: 'inline', marginRight: '4px' }}/> Patient Phone (for SMS receipt)</label>
            <input className="glass-input" required value={form.patient_phone} onChange={e => setForm({...form, patient_phone: e.target.value})} placeholder="+91 9876543210" />
          </div>
          <div className="input-group">
            <label>Patient ID (Aadhaar / Health ID)</label>
            <input className="glass-input" required value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})} placeholder="XXXX-XXXX-XXXX" />
          </div>
          <div className="input-group">
            <label><Pill size={14} style={{ display: 'inline', marginRight: '4px' }}/> Medicine</label>
            <select className="glass-input" required value={form.medicine_name} onChange={e => setForm({...form, medicine_name: e.target.value})}>
              <option value="">Select Medicine...</option>
              {inventory.map(i => (
                <option key={i.id} value={i.medicine_name}>{i.medicine_name} (Stock: {i.unit_count})</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Quantity Dispensed</label>
            <input type="number" min="1" className="glass-input" required value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} /> Dispense & Send SMS
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h2>Live Inventory Counter</h2>
        <p>Real-time stock visibility. Restocks trigger automatically below 15% threshold.</p>
        <table className="glass-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Available Units</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const status = item.unit_count > item.threshold_count * 2 ? 'badge-success' : item.unit_count > item.threshold_count ? 'badge-warning' : 'badge-danger';
              const statusText = item.unit_count > item.threshold_count * 2 ? 'Optimal' : item.unit_count > item.threshold_count ? 'Low Stock' : 'Critical / Restocking';
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.medicine_name}</td>
                  <td>{item.unit_count}</td>
                  <td><span className={`badge ${status}`}>{statusText}</span></td>
                </tr>
              )
            })}
            {inventory.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No inventory loaded yet.</td></tr>}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
