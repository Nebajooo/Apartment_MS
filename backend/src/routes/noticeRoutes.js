const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

// Public routes
router.get("/", getAllNotices);
router.get("/:id", getNotice);

// Protected routes (Manager/Admin only)
router.post("/", protect, authorize("SUPER_ADMIN", "MANAGER"), createNotice);
router.put("/:id", protect, authorize("SUPER_ADMIN", "MANAGER"), updateNotice);
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "MANAGER"),
  deleteNotice,
);

module.exports = router;
