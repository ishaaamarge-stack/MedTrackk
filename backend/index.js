const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let db;

// Initialize db and start server
async function start() {
  db = await getDb();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Routes

// 1. Inward Logging (Distributor adds stock)
app.post('/api/inventory', async (req, res) => {
  const { batch_id, medicine_name, expiry_date, unit_count, threshold_count } = req.body;
  try {
    // Check if medicine already exists
    const existing = await db.get('SELECT * FROM inventory WHERE medicine_name = ?', [medicine_name]);
    if (existing) {
      await db.run(
        'UPDATE inventory SET unit_count = unit_count + ?, batch_id = ?, expiry_date = ? WHERE medicine_name = ?',
        [unit_count, batch_id, expiry_date, medicine_name]
      );
    } else {
      await db.run(
        'INSERT INTO inventory (batch_id, medicine_name, expiry_date, unit_count, threshold_count) VALUES (?, ?, ?, ?, ?)',
        [batch_id, medicine_name, expiry_date, unit_count, threshold_count]
      );
    }
    res.status(201).json({ message: 'Stock added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Verified Dispensation (Pharmacist dispenses)
app.post('/api/dispense', async (req, res) => {
  const { patient_id, patient_phone, medicine_name, quantity } = req.body;
  try {
    const item = await db.get('SELECT * FROM inventory WHERE medicine_name = ?', [medicine_name]);
    if (!item || item.unit_count < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Auto-Depletion
    await db.run('UPDATE inventory SET unit_count = unit_count - ? WHERE medicine_name = ?', [quantity, medicine_name]);
    
    // Log dispensation
    await db.run(
      'INSERT INTO dispensations (patient_id, patient_phone, medicine_name, quantity) VALUES (?, ?, ?, ?)',
      [patient_id, patient_phone, medicine_name, quantity]
    );

    // Send Real SMS using Textbelt (1 free per day)
    let smsMessage = `Simulated SMS to ${patient_phone}: MedTrack Receipt - Patient ${patient_id} received ${quantity}x ${medicine_name}.`;
    try {
      const tbRes = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: patient_phone,
          message: `MedTrack Receipt: Patient ${patient_id} received ${quantity}x ${medicine_name}.`,
          key: 'textbelt',
        }),
      });
      const tbData = await tbRes.json();
      if (tbData.success) {
        smsMessage = `Real SMS successfully sent to ${patient_phone}! (1 free/day limit)`;
      } else {
        smsMessage = `SMS failed (Textbelt limit or invalid format): ${tbData.error}. Simulated receipt recorded.`;
      }
    } catch (err) {
      smsMessage = `SMS API Error: ${err.message}. Simulated instead.`;
    }

    // Low-Stock Trigger (Check if below threshold 15%)
    let restockTriggered = false;
    const newCount = item.unit_count - quantity;
    if (newCount <= item.threshold_count) {
      // Check if there is already a pending order
      const pendingOrder = await db.get("SELECT * FROM restock_orders WHERE medicine_name = ? AND status = 'pending'", [medicine_name]);
      if (!pendingOrder) {
        const orderQty = item.threshold_count * 5; // Re-order amount
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 96); // 96 hour SLA
        await db.run(
          'INSERT INTO restock_orders (medicine_name, ordered_quantity, sla_deadline) VALUES (?, ?, ?)',
          [medicine_name, orderQty, deadline.toISOString()]
        );
        restockTriggered = true;
      }
    }

    res.json({ 
      message: 'Dispensed successfully', 
      sms: smsMessage,
      restockTriggered 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Inventory Dashboard
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await db.all('SELECT * FROM inventory');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pending Orders & Check SLAs
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.all('SELECT * FROM restock_orders');
    const now = new Date();
    // Dynamically flag breaches if SLA passed and status still pending
    const processedOrders = orders.map(o => {
      const isBreached = o.status === 'pending' && new Date(o.sla_deadline) < now;
      if (isBreached && o.status !== 'breached') {
        o.is_breached = true;
      } else {
        o.is_breached = o.status === 'breached';
      }
      return o;
    });
    res.json(processedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark order as delivered
app.post('/api/orders/:id/deliver', async (req, res) => {
  try {
    await db.run("UPDATE restock_orders SET status = 'delivered' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Order delivered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

start();
