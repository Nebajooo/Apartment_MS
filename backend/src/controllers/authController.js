const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Register
const register = async (req, res) => {
  try {
    const { email, password, name, phone, role, apartmentId } = req.body;

    // Validate
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if user exists
    const userCheck = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password, name, phone, role, apartment_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, phone, role, apartment_id, created_at`,
      [
        email,
        hashedPassword,
        name,
        phone,
        role || "TENANT",
        apartmentId || null,
      ],
    );

    const user = result.rows[0];

    // If apartment assigned, mark as occupied
    if (apartmentId) {
      await db.query("UPDATE apartments SET is_occupied = true WHERE id = $1", [
        apartmentId,
      ]);
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Get user with apartment
    const result = await db.query(
      `SELECT u.*, a.unit_number, a.rent_amount, a.floor
       FROM users u
       LEFT JOIN apartments a ON u.apartment_id = a.id
       WHERE u.email = $1`,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.*, a.unit_number, a.rent_amount, a.floor
       FROM users u
       LEFT JOIN apartments a ON u.apartment_id = a.id
       WHERE u.id = $1`,
      [req.user.id],
    );

    const user = result.rows[0];
    delete user.password;

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};

// Logout
const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
