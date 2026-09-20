import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, LineChart, ShieldAlert } from 'lucide-react';

export default function AdminConsole() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchData = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        fetch('http://localhost:3001/api/inventory'),
        fetch('http://localhost:3001/api/orders')
      ]);
      setInventory(await invRes.json());
      setOrders(await ordRes.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Live update
    return () => clearInterval(interval);
  }, []);

  const breachedOrders = orders.filter(o => o.is_breached);
  const totalStock = inventory.reduce((acc, curr) => acc + curr.unit_count, 0);
  const lowStockCount = inventory.filter(i => i.unit_count <= i.threshold_count).length;

  return (
    <div>
      <div className="hero-banner" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <div className="hero-content">
          <h1>District Health Admin Console</h1>
          <p>Real-time district-wide stock visibility and SLA escalation monitoring for health officials.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Total District Stock</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>{totalStock}</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Low Stock Facilities</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: lowStockCount > 0 ? 'var(--warning)' : 'var(--success)' }}>{lowStockCount}</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', background: breachedOrders.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--glass-bg)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>SLA Breaches (96h)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: breachedOrders.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{breachedOrders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* District Stock Visibility */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <LineChart size={24} color="var(--secondary-color)" />
            <h2 style={{ margin: 0 }}>Live Stock Visibility</h2>
          </div>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Medicine Batch</th>
                <th>Units</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td>{item.medicine_name} <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.batch_id}</span></td>
                  <td>{item.unit_count}</td>
                  <td>
                    {item.unit_count <= item.threshold_count ? 
                      <span className="badge badge-danger">Restocking</span> : 
                      <span className="badge badge-success">Healthy</span>}
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No data</td></tr>}
            </tbody>
          </table>
        </div>

        {/* SLA Escalations */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <ShieldAlert size={24} color="var(--danger)" />
            <h2 style={{ margin: 0 }}>Escalation Watchdog</h2>
          </div>
          <p>Orders that exceed the 96h fulfillment window are automatically surfaced here for officer intervention.</p>
          
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breachedOrders.map(order => (
              <div key={order.id} className="glass-panel" style={{ borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'var(--danger)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18}/> Critical Breach</h3>
                    <p style={{ margin: 0, fontWeight: 500 }}>{order.medicine_name}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ordered: {new Date(order.order_timestamp).toLocaleString()}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Deadline Missed: {new Date(order.sla_deadline).toLocaleString()}</p>
                  </div>
                  <div>
                    <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Contact Distributor</button>
                  </div>
                </div>
              </div>
            ))}
            {breachedOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--success)' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px auto', display: 'block' }} />
                <p>No SLA breaches. All distributors are delivering on time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure CheckCircle is imported for the empty state
import { CheckCircle } from 'lucide-react';
