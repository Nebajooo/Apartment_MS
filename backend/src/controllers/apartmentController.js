const db = require("../config/database");

// Get all apartments
const getAllApartments = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM apartments ORDER BY unit_number",
    );
    res.json({
      success: true,
      apartments: result.rows,
    });
  } catch (error) {
    console.error("Get apartments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching apartments",
    });
  }
};

// Get available apartments
const getAvailableApartments = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM apartments WHERE is_occupied = false ORDER BY unit_number",
    );
    res.json({
      success: true,
      apartments: result.rows,
    });
  } catch (error) {
    console.error("Get available apartments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available apartments",
    });
  }
};

// Create apartment
const createApartment = async (req, res) => {
  try {
    const { unitNumber, floor, rentAmount, bedrooms, bathrooms } = req.body;

    if (!unitNumber || !floor || !rentAmount) {
      return res.status(400).json({
        success: false,
        message: "Unit number, floor, and rent amount are required",
      });
    }

    const result = await db.query(
      `INSERT INTO apartments (unit_number, floor, rent_amount, bedrooms, bathrooms)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [unitNumber, floor, rentAmount, bedrooms || 1, bathrooms || 1],
    );

    res.status(201).json({
      success: true,
      message: "Apartment created successfully",
      apartment: result.rows[0],
    });
  } catch (error) {
    console.error("Create apartment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating apartment",
    });
  }
};

// Update apartment
const updateApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { unitNumber, floor, rentAmount, bedrooms, bathrooms, isOccupied } =
      req.body;

    const result = await db.query(
      `UPDATE apartments 
       SET unit_number = COALESCE($1, unit_number),
           floor = COALESCE($2, floor),
           rent_amount = COALESCE($3, rent_amount),
           bedrooms = COALESCE($4, bedrooms),
           bathrooms = COALESCE($5, bathrooms),
           is_occupied = COALESCE($6, is_occupied)
       WHERE id = $7
       RETURNING *`,
      [unitNumber, floor, rentAmount, bedrooms, bathrooms, isOccupied, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
    }

    res.json({
      success: true,
      message: "Apartment updated successfully",
      apartment: result.rows[0],
    });
  } catch (error) {
    console.error("Update apartment error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating apartment",
    });
  }
};

// Delete apartment
const deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if apartment has tenants
    const tenantCheck = await db.query(
      "SELECT id FROM users WHERE apartment_id = $1",
      [id],
    );

    if (tenantCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete apartment with assigned tenants",
      });
    }

    const result = await db.query(
      "DELETE FROM apartments WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
    }

    res.json({
      success: true,
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    console.error("Delete apartment error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting apartment",
    });
  }
};

module.exports = {
  getAllApartments,
  getAvailableApartments,
  createApartment,
  updateApartment,
  deleteApartment,
};
