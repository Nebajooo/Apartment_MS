const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
} = require("../controllers/tenantController");

// All routes require authentication
router.use(protect);

// Manager and Admin only
router.use(authorize("SUPER_ADMIN", "MANAGER"));

router.get("/", getAllTenants);
router.get("/:id", getTenant);
router.post("/", createTenant);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);

module.exports = router;
