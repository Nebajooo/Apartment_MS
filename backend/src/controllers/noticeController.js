const db = require("../config/database");

// Get all notices (public)
const getAllNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, includeExpired } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT n.*, u.name as posted_by_name
      FROM notices n
      JOIN users u ON n.posted_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Only show active notices unless includeExpired is true
    if (!includeExpired) {
      paramCount++;
      params.push(new Date());
      query += ` AND (n.expires_at IS NULL OR n.expires_at > $${paramCount})`;
    }

    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);
    query += ` ORDER BY n.is_pinned DESC, n.created_at DESC LIMIT $${paramCount - 1} OFFSET $${paramCount}`;

    const result = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM notices WHERE 1=1";
    const countParams = [];
    let countParamCount = 0;

    if (!includeExpired) {
      countParamCount++;
      countParams.push(new Date());
      countQuery += ` AND (expires_at IS NULL OR expires_at > $${countParamCount})`;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      success: true,
      notices: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notices",
    });
  }
};

// Get single notice
const getNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT n.*, u.name as posted_by_name
       FROM notices n
       JOIN users u ON n.posted_by = u.id
       WHERE n.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.json({
      success: true,
      notice: result.rows[0],
    });
  } catch (error) {
    console.error("Get notice error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notice",
    });
  }
};

// Create notice (manager)
const createNotice = async (req, res) => {
  try {
    const { title, content, isPinned, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const result = await db.query(
      `INSERT INTO notices (title, content, is_pinned, expires_at, posted_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, content, isPinned || false, expiresAt || null, req.user.id],
    );

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice: result.rows[0],
    });
  } catch (error) {
    console.error("Create notice error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notice",
    });
  }
};

// Update notice
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPinned, expiresAt } = req.body;

    const result = await db.query(
      `UPDATE notices 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           is_pinned = COALESCE($3, is_pinned),
           expires_at = COALESCE($4, expires_at)
       WHERE id = $5
       RETURNING *`,
      [title, content, isPinned, expiresAt, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.json({
      success: true,
      message: "Notice updated successfully",
      notice: result.rows[0],
    });
  } catch (error) {
    console.error("Update notice error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notice",
    });
  }
};

// Delete notice
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM notices WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notice",
    });
  }
};

module.exports = {
  getAllNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
};
