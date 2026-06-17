const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  registerVisitor,
  getMyVisitors,
  getAllVisitors,
  checkInVisitor,
  checkOutVisitor,
} = require("../controllers/visitorController");

router.use(protect);

// Tenant routes
router.post("/", registerVisitor);
router.get("/my-visitors", getMyVisitors);

// Manager/Admin routes
router.get("/all", authorize("SUPER_ADMIN", "MANAGER"), getAllVisitors);
router.put(
  "/:id/check-in",
  authorize("SUPER_ADMIN", "MANAGER"),
  checkInVisitor,
);
router.put(
  "/:id/check-out",
  authorize("SUPER_ADMIN", "MANAGER"),
  checkOutVisitor,
);

module.exports = router;
