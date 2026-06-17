const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const rentRoutes = require("./routes/rentRoutes");
const visitorRoutes = require("./routes/visitorRoutes"); // Make sure this exists
const noticeRoutes = require("./routes/noticeRoutes");
const apartmentRoutes = require("./routes/apartmentRoutes");

const app = express();

// ============ MIDDLEWARE ============

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Parse JSON
app.use(express.json());

// Parse URL-encoded
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// ============ ROUTES ============

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Smart Apartment API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes - MAKE SURE ALL ARE REGISTERED
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/rent", rentRoutes);
app.use("/api/visitors", visitorRoutes); // <-- THIS MUST BE HERE
app.use("/api/notices", noticeRoutes);
app.use("/api/apartments", apartmentRoutes);

// ============ ERROR HANDLING ============

// 404 handler - THIS SHOULD BE LAST
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
