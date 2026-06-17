const db = require("../config/database");

// Register visitor
const registerVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, checkIn } = req.body;
    const tenantId = req.user.id;

    console.log("=== REGISTER VISITOR ===");
    console.log("Tenant ID:", tenantId);
    console.log("Visitor Name:", name);
    console.log("Phone:", phone);

    // Validate required fields
    if (!name || !phone || !checkIn) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and check-in time are required",
      });
    }

    // Get tenant's apartment
    const tenantResult = await db.query(
      "SELECT id, apartment_id FROM users WHERE id = $1 AND role = $2",
      [tenantId, "TENANT"],
    );

    console.log("Tenant query result:", tenantResult.rows);

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found. Please contact management.",
      });
    }

    const tenant = tenantResult.rows[0];

    if (!tenant.apartment_id) {
      return res.status(400).json({
        success: false,
        message: "No apartment assigned to you. Please contact management.",
      });
    }

    // Generate OTP (6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Insert visitor
    const result = await db.query(
      `INSERT INTO visitors 
       (name, phone, purpose, host_id, apartment_id, check_in, otp_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        phone,
        purpose || null,
        tenantId,
        tenant.apartment_id,
        checkIn,
        otpCode,
        "EXPECTED",
      ],
    );

    console.log("✅ Visitor registered:", result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      visitor: result.rows[0],
      otpCode,
    });
  } catch (error) {
    console.error("❌ Register visitor error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error registering visitor",
      error: error.message,
    });
  }
};

// Get my visitors (tenant)
const getMyVisitors = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = "SELECT * FROM visitors WHERE host_id = $1";
    const params = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      params.push(status);
      query += ` AND status = $${paramCount}`;
    }

    if (date) {
      paramCount++;
      params.push(date);
      query += ` AND DATE(check_in) = $${paramCount}`;
    }

    query += ` ORDER BY check_in DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM visitors WHERE host_id = $1";
    const countParams = [req.user.id];
    let countParamCount = 1;

    if (status) {
      countParamCount++;
      countParams.push(status);
      countQuery += ` AND status = $${countParamCount}`;
    }

    if (date) {
      countParamCount++;
      countParams.push(date);
      countQuery += ` AND DATE(check_in) = $${countParamCount}`;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      visitors: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get my visitors error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitors",
    });
  }
};

// Get all visitors (manager)
const getAllVisitors = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT v.*, u.name as host_name, u.email as host_email, a.unit_number
      FROM visitors v
      JOIN users u ON v.host_id = u.id
      LEFT JOIN apartments a ON v.apartment_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      params.push(status);
      query += ` AND v.status = $${paramCount}`;
    }

    if (date) {
      paramCount++;
      params.push(date);
      query += ` AND DATE(v.check_in) = $${paramCount}`;
    }

    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);
    query += ` ORDER BY v.check_in DESC LIMIT $${paramCount - 1} OFFSET $${paramCount}`;

    const result = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM visitors WHERE 1=1";
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countParams.push(status);
      countQuery += ` AND status = $${countParamCount}`;
    }

    if (date) {
      countParamCount++;
      countParams.push(date);
      countQuery += ` AND DATE(check_in) = $${countParamCount}`;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      visitors: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all visitors error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitors",
    });
  }
};

// Check-in visitor
const checkInVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE visitors 
       SET status = 'CHECKED_IN', check_in = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'EXPECTED'
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found or already checked in",
      });
    }

    res.json({
      success: true,
      message: "Visitor checked in successfully",
      visitor: result.rows[0],
    });
  } catch (error) {
    console.error("Check-in visitor error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking in visitor",
    });
  }
};

// Check-out visitor
const checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE visitors 
       SET status = 'CHECKED_OUT', check_out = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'CHECKED_IN'
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found or not checked in",
      });
    }

    res.json({
      success: true,
      message: "Visitor checked out successfully",
      visitor: result.rows[0],
    });
  } catch (error) {
    console.error("Check-out visitor error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking out visitor",
    });
  }
};

module.exports = {
  registerVisitor,
  getMyVisitors,
  getAllVisitors,
  checkInVisitor,
  checkOutVisitor,
};
