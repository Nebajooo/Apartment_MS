const db = require("../config/database");

// Get my payments (tenant)
const getMyPayments = async (req, res) => {
  try {
    const { year, status } = req.query;

    let query = "SELECT * FROM rent_payments WHERE tenant_id = $1";
    const params = [req.user.id];
    let paramCount = 1;

    if (year) {
      paramCount++;
      params.push(parseInt(year));
      query += ` AND year = $${paramCount}`;
    }

    if (status) {
      paramCount++;
      params.push(status);
      query += ` AND status = $${paramCount}`;
    }

    query += " ORDER BY year DESC, month DESC";

    const result = await db.query(query, params);

    // Calculate summary
    const totalPaid = result.rows
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalPending = result.rows
      .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      success: true,
      payments: result.rows,
      summary: {
        totalPaid,
        totalPending,
        totalPayments: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Get my payments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};

// Get all payments (manager)
const getAllPayments = async (req, res) => {
  try {
    const { status, month, year, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT r.*, u.name as tenant_name, u.email as tenant_email, a.unit_number
      FROM rent_payments r
      JOIN users u ON r.tenant_id = u.id
      LEFT JOIN apartments a ON u.apartment_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      params.push(status);
      query += ` AND r.status = $${paramCount}`;
    }

    if (month) {
      paramCount++;
      params.push(parseInt(month));
      query += ` AND r.month = $${paramCount}`;
    }

    if (year) {
      paramCount++;
      params.push(parseInt(year));
      query += ` AND r.year = $${paramCount}`;
    }

    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);
    query += ` ORDER BY r.year DESC, r.month DESC LIMIT $${paramCount - 1} OFFSET $${paramCount}`;

    const result = await db.query(query, params);

    // Get summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as total_collected
      FROM rent_payments
    `;
    const summaryResult = await db.query(summaryQuery);

    res.json({
      success: true,
      payments: result.rows,
      summary: summaryResult.rows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: summaryResult.rows[0].total,
        pages: Math.ceil(summaryResult.rows[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};

// Mark payment as paid
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE rent_payments 
       SET status = 'PAID', paid_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status != 'PAID'
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or already paid",
      });
    }

    res.json({
      success: true,
      message: "Payment marked as paid",
      payment: result.rows[0],
    });
  } catch (error) {
    console.error("Mark as paid error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking payment as paid",
    });
  }
};

// Create rent payment record
const createPayment = async (req, res) => {
  try {
    const { tenantId, month, year, amount, dueDate } = req.body;

    // Check if payment exists
    const existing = await db.query(
      "SELECT id FROM rent_payments WHERE tenant_id = $1 AND month = $2 AND year = $3",
      [tenantId, month, year],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Payment record already exists for this month",
      });
    }

    const result = await db.query(
      `INSERT INTO rent_payments (tenant_id, month, year, amount, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, month, year, amount, dueDate],
    );

    res.status(201).json({
      success: true,
      message: "Payment record created",
      payment: result.rows[0],
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment record",
    });
  }
};

module.exports = {
  getMyPayments,
  getAllPayments,
  markAsPaid,
  createPayment,
};
