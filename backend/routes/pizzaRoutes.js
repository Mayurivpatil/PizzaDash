const express = require("express");
const router = express.Router();
const db = require("../config/db");

// // Post a new order
router.post("/order", async (req, res) => {
  try {
    const { customer_name, customer_phone, delivery_address, payment_method, items, total_price } = req.body;

    const query = `
      INSERT INTO orders (customer_name, customer_phone, delivery_address, payment_method, items, total_price, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'Preparing')
    `;

    await db.execute(query, [
      customer_name, 
      customer_phone, 
      delivery_address, 
      payment_method, 
      JSON.stringify(items), 
      total_price
    ]);

    res.status(201).json({ message: "Order Placed!" });
  } catch (err) {
    console.error(err); // This helps you see the error in your terminal
    res.status(500).json({ error: err.message });
  }
});


// Ensure clean fetching
router.get('/orders', async (req, res) => {
    try {
        // Fetch all unique orders, ordered by newest first
        const [rows] = await db.execute("SELECT * FROM orders ORDER BY id DESC");
        const formattedRows = rows.map(row => ({
            ...row,
            items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        }));
        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// This route is for the ADMIN to change the status
router.put('/order/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
