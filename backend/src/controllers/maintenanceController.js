const db = require("../config/database");

// Create maintenance request
const createRequest = async (req, res) => {
  try {
    const { title, description, priority, apartmentId } = req.body;
    const tenantId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Get tenant's apartment
    const tenant = await db.query(
      "SELECT apartment_id FROM users WHERE id = $1",
      [tenantId],
    );

    const aptId = apartmentId || tenant.rows[0].apartment_id;

    if (!aptId) {
      return res.status(400).json({
        success: false,
        message: "No apartment assigned to this tenant",
      });
    }

    // Handle file upload (if any)
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Create request
    const result = await db.query(
      `INSERT INTO maintenance_requests 
       (title, description, priority, tenant_id, apartment_id, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, priority || "MEDIUM", tenantId, aptId, photoUrl],
    );

    res.status(201).json({
      success: true,
      message: "Maintenance request submitted successfully",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create maintenance error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating maintenance request",
    });
  }
};

// Get my requests (tenant)
const getMyRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = "SELECT * FROM maintenance_requests WHERE tenant_id = $1";
    const params = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    const countQuery =
      "SELECT COUNT(*) as total FROM maintenance_requests WHERE tenant_id = $1";
    const countResult = await db.query(countQuery, [req.user.id]);

    res.json({
      success: true,
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching requests",
    });
  }
};

// Get all requests (manager)
// Get all requests (manager) - with assigned_to name
const getAllRequests = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT 
        m.*, 
        u.name as tenant_name, 
        u.email as tenant_email, 
        a.unit_number,
        assigned.name as assigned_to_name
      FROM maintenance_requests m
      JOIN users u ON m.tenant_id = u.id
      JOIN apartments a ON m.apartment_id = a.id
      LEFT JOIN users assigned ON m.assigned_to = assigned.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      params.push(status);
      query += ` AND m.status = $${paramCount}`;
    }

    if (priority) {
      paramCount++;
      params.push(priority);
      query += ` AND m.priority = $${paramCount}`;
    }

    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);
    query += ` ORDER BY 
      CASE m.priority 
        WHEN 'URGENT' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
      END, 
      m.created_at DESC 
      LIMIT $${paramCount - 1} OFFSET $${paramCount}`;

    const result = await db.query(query, params);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM maintenance_requests WHERE 1=1";
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countParams.push(status);
      countQuery += ` AND status = $${countParamCount}`;
    }

    if (priority) {
      countParamCount++;
      countParams.push(priority);
      countQuery += ` AND priority = $${countParamCount}`;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching requests",
    });
  }
};

// Update status

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Check if request exists
    const checkResult = await db.query(
      "SELECT * FROM maintenance_requests WHERE id = $1",
      [id],
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Update status based on the new status
    let updateQuery;
    let params;

    switch (status) {
      case "RESOLVED":
        updateQuery = `
          UPDATE maintenance_requests 
          SET status = $1, 
              resolved_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        params = [status, id];
        break;

      case "ASSIGNED":
        updateQuery = `
          UPDATE maintenance_requests 
          SET status = $1, 
              assigned_to = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `;
        params = [status, req.user.id, id];
        break;

      case "CANCELLED":
        updateQuery = `
          UPDATE maintenance_requests 
          SET status = $1, 
              assigned_to = NULL,
              resolved_at = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        params = [status, id];
        break;

      default: // PENDING or IN_PROGRESS
        updateQuery = `
          UPDATE maintenance_requests 
          SET status = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        params = [status, id];
    }

    const result = await db.query(updateQuery, params);

    // Get full request details with joins
    const fullResult = await db.query(
      `SELECT m.*, 
              u.name as tenant_name, 
              u.email as tenant_email, 
              a.unit_number,
              assigned.name as assigned_to_name
       FROM maintenance_requests m
       JOIN users u ON m.tenant_id = u.id
       JOIN apartments a ON m.apartment_id = a.id
       LEFT JOIN users assigned ON m.assigned_to = assigned.id
       WHERE m.id = $1`,
      [id],
    );

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
      request: fullResult.rows[0],
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating request status",
      error: error.message,
    });
  }
};

// Get single request details
const getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT m.*, u.name as tenant_name, u.email as tenant_email, a.unit_number
       FROM maintenance_requests m
       JOIN users u ON m.tenant_id = u.id
       JOIN apartments a ON m.apartment_id = a.id
       WHERE m.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check if user has access
    if (
      req.user.role === "TENANT" &&
      result.rows[0].tenant_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own requests",
      });
    }

    res.json({
      success: true,
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Get request details error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching request details",
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateStatus,
  getRequestDetails,
};
