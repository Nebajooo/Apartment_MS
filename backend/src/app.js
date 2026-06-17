const express = require("express");
const cors = require("cors");
const apartmentRoutes = require("./routes/apartmentRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/apartments", apartmentRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Smart Apartment API is running",
    timestamp: new Date().toISOString(),
  });
});

// ============ ROUTES (will add one by one) ============

// Try to load auth routes with error handling
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.log("⚠️ Auth routes not loaded:", error.message);
}

// Try to load tenant routes with error handling
try {
  const tenantRoutes = require("./routes/tenantRoutes");
  app.use("/api/tenants", tenantRoutes);
  console.log("✅ Tenant routes loaded");
} catch (error) {
  console.log("⚠️ Tenant routes not loaded:", error.message);
}

// Try to load maintenance routes with error handling
try {
  const maintenanceRoutes = require("./routes/maintenanceRoutes");
  app.use("/api/maintenance", maintenanceRoutes);
  console.log("✅ Maintenance routes loaded");
} catch (error) {
  console.log("⚠️ Maintenance routes not loaded:", error.message);
}
app.use("/api/apartments", apartmentRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

module.exports = app;
