const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getMyPayments,
  getAllPayments,
  markAsPaid,
  createPayment,
} = require("../controllers/rentController");

router.use(protect);

// Tenant route
router.get("/my-payments", getMyPayments);

// Manager/Admin routes
router.get("/all", authorize("SUPER_ADMIN", "MANAGER"), getAllPayments);
router.put("/:id/paid", authorize("SUPER_ADMIN", "MANAGER"), markAsPaid);
router.post("/", authorize("SUPER_ADMIN", "MANAGER"), createPayment);

module.exports = router;
