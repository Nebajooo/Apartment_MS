const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  registerVisitor,
  getMyVisitors,
  getAllVisitors,
  checkInVisitor,
  checkOutVisitor,
} = require("../controllers/visitorController");

// All routes require authentication
router.use(protect);

// Tenant routes
router.post("/", registerVisitor); // POST /api/visitors
router.get("/my-visitors", getMyVisitors); // GET /api/visitors/my-visitors

// Manager/Admin routes
router.get("/all", getAllVisitors); // GET /api/visitors/all
router.put("/:id/check-in", checkInVisitor); // PUT /api/visitors/:id/check-in
router.put("/:id/check-out", checkOutVisitor); // PUT /api/visitors/:id/check-out

module.exports = router;
