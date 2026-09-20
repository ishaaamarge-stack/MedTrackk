import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock } from 'lucide-react';

export default function DistributorPortal() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ medicine_name: '', batch_id: '', expiry_date: '', unit_count: 500, threshold_count: 75 });
  const [msg, setMsg] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/orders');
      setOrders(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleInward = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg('Consignment logged successfully!');
        setForm({ medicine_name: '', batch_id: '', expiry_date: '', unit_count: 500, threshold_count: 75 });
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeliver = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/orders/${id}/deliver`, { method: 'POST' });
      fetchOrders();
    } catch(e) { console.error(e); }
  }

  return (
    <div>
      <div className="hero-banner" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <div className="hero-content">
          <h1>Distributor Portal</h1>
          <p>Log incoming medical supplies and fulfill pending restock orders triggered by the MedTrack SLA system.</p>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
        <div className="image-card">
          <img src="/truck.jpg" alt="Medical Delivery Truck" style={{ height: '300px' }} />
          <div className="image-card-body">
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>MedTrack Logistics</h2>
            <p>Ensure rural clinics never face artificial stockouts. Log your inward consignments below and monitor SLA deadlines in real-time.</p>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Package size={28} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Inward Consignment Logging</h2>
          </div>
          <p style={{ marginBottom: '24px' }}>Log new medicine batches delivered to the clinic.</p>
          
          {msg && <div className="badge badge-success" style={{ padding: '12px', marginBottom: '20px', display: 'block' }}>{msg}</div>}

          <form onSubmit={handleInward}>
            <div className="input-group">
              <label>Medicine Name</label>
              <input className="glass-input" required value={form.medicine_name} onChange={e => setForm({...form, medicine_name: e.target.value})} placeholder="e.g. Paracetamol 500mg" />
            </div>
            <div className="input-group">
              <label>Batch ID</label>
              <input className="glass-input" required value={form.batch_id} onChange={e => setForm({...form, batch_id: e.target.value})} placeholder="BATCH-2023-XY" />
            </div>
            <div className="input-group">
              <label>Expiry Date</label>
              <input type="date" className="glass-input" required value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div className="input-group">
                <label>Unit Count</label>
                <input type="number" className="glass-input" required value={form.unit_count} onChange={e => setForm({...form, unit_count: parseInt(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>15% Threshold</label>
                <input type="number" className="glass-input" required value={form.threshold_count} onChange={e => setForm({...form, threshold_count: parseInt(e.target.value)})} />
              </div>
            </div>
            <button type="submit" className="btn" style={{ width: '100%' }}>Register Consignment</button>
          </form>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Truck size={28} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>Pending Restock Orders</h2>
        </div>
        <p>Orders generated automatically by MedTrack threshold triggers.</p>
        
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.filter(o => o.status === 'pending').map(order => {
            const isBreached = order.is_breached;
            return (
              <div key={order.id} className="glass-panel" style={{ padding: '16px', background: isBreached ? 'var(--danger-bg)' : 'var(--surface)', borderColor: isBreached ? 'var(--danger)' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{order.medicine_name}</h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Quantity Requested: {order.ordered_quantity}</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '8px', color: isBreached ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> SLA Deadline: {new Date(order.sla_deadline).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => handleDeliver(order.id)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={16} /> Mark Delivered
                  </button>
                </div>
                {isBreached && <div className="badge badge-danger" style={{ marginTop: '12px', display: 'inline-block' }}>CRITICAL SLA BREACH</div>}
              </div>
            )
          })}
          {orders.filter(o => o.status === 'pending').length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending orders.</p>}
        </div>
      </div>
    </div>
  );
}
