const bcrypt = require("bcryptjs");
const db = require("../config/database");

// Get all tenants
const getAllTenants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get tenants with apartment info
    const result = await db.query(
      `SELECT 
         u.id, u.email, u.name, u.phone, u.role, u.created_at,
         a.id as apartment_id, a.unit_number, a.rent_amount, a.floor, a.is_occupied
       FROM users u
       LEFT JOIN apartments a ON u.apartment_id = a.id
       WHERE u.role = 'TENANT'
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    // Get total count
    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = $1",
      ["TENANT"],
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      tenants: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tenants error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tenants",
    });
  }
};

// Get single tenant
const getTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // Get tenant with all details
    const result = await db.query(
      `SELECT u.*, a.unit_number, a.rent_amount, a.floor, a.is_occupied
       FROM users u
       LEFT JOIN apartments a ON u.apartment_id = a.id
       WHERE u.id = $1 AND u.role = 'TENANT'`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = result.rows[0];
    delete tenant.password;

    // Get maintenance requests
    const maintenance = await db.query(
      `SELECT * FROM maintenance_requests 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC`,
      [id],
    );

    // Get rent payments
    const payments = await db.query(
      `SELECT * FROM rent_payments 
       WHERE tenant_id = $1 
       ORDER BY year DESC, month DESC`,
      [id],
    );

    res.json({
      success: true,
      tenant: {
        ...tenant,
        maintenance_requests: maintenance.rows,
        rent_payments: payments.rows,
      },
    });
  } catch (error) {
    console.error("Get tenant error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tenant",
    });
  }
};

// Create tenant
const createTenant = async (req, res) => {
  try {
    const { email, password, name, phone, apartmentId } = req.body;

    // Validate
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if apartment is available
    if (apartmentId) {
      const aptCheck = await db.query(
        "SELECT is_occupied FROM apartments WHERE id = $1",
        [apartmentId],
      );

      if (aptCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
      }

      if (aptCheck.rows[0].is_occupied) {
        return res.status(400).json({
          success: false,
          message: "Apartment is already occupied",
        });
      }
    }

    // Check if email exists
    const emailCheck = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password, name, phone, role, apartment_id)
       VALUES ($1, $2, $3, $4, 'TENANT', $5)
       RETURNING id, email, name, phone, role, apartment_id, created_at`,
      [email, hashedPassword, name, phone, apartmentId || null],
    );

    const tenant = result.rows[0];

    // Update apartment status
    if (apartmentId) {
      await db.query("UPDATE apartments SET is_occupied = true WHERE id = $1", [
        apartmentId,
      ]);
    }

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      tenant,
    });
  } catch (error) {
    console.error("Create tenant error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tenant",
    });
  }
};

// Update tenant
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, apartmentId } = req.body;

    // Check if tenant exists
    const existing = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [id, "TENANT"],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const oldTenant = existing.rows[0];

    // If changing apartment
    if (apartmentId && apartmentId !== oldTenant.apartment_id) {
      // Check new apartment
      const aptCheck = await db.query(
        "SELECT is_occupied FROM apartments WHERE id = $1",
        [apartmentId],
      );

      if (aptCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Apartment not found",
        });
      }

      if (aptCheck.rows[0].is_occupied) {
        return res.status(400).json({
          success: false,
          message: "Apartment is already occupied",
        });
      }

      // Free old apartment
      if (oldTenant.apartment_id) {
        await db.query(
          "UPDATE apartments SET is_occupied = false WHERE id = $1",
          [oldTenant.apartment_id],
        );
      }

      // Occupy new apartment
      await db.query("UPDATE apartments SET is_occupied = true WHERE id = $1", [
        apartmentId,
      ]);
    }

    // Update tenant
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           apartment_id = COALESCE($4, apartment_id)
       WHERE id = $5
       RETURNING id, email, name, phone, role, apartment_id, created_at`,
      [name, phone, email, apartmentId, id],
    );

    res.json({
      success: true,
      message: "Tenant updated successfully",
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error("Update tenant error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tenant",
    });
  }
};

// Delete tenant
const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tenant exists
    const tenant = await db.query(
      "SELECT apartment_id FROM users WHERE id = $1 AND role = $2",
      [id, "TENANT"],
    );

    if (tenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Free apartment
    if (tenant.rows[0].apartment_id) {
      await db.query(
        "UPDATE apartments SET is_occupied = false WHERE id = $1",
        [tenant.rows[0].apartment_id],
      );
    }

    // Delete tenant
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    console.error("Delete tenant error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting tenant",
    });
  }
};

module.exports = {
  getAllTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
};
