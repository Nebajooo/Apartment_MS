const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateStatus,
  getRequestDetails,
} = require("../controllers/maintenanceController");

// All routes require authentication
router.use(protect);

// Tenant routes
router.get("/my-requests", getMyRequests);
router.post("/", createRequest);

// Manager/Admin routes
router.get("/all", authorize("SUPER_ADMIN", "MANAGER"), getAllRequests);
router.put("/:id/status", authorize("SUPER_ADMIN", "MANAGER"), updateStatus);

// Both can view
router.get("/:id", getRequestDetails);

module.exports = router;
