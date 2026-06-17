const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllApartments,
  getAvailableApartments,
  createApartment,
  updateApartment,
  deleteApartment,
} = require("../controllers/apartmentController");

// All routes require authentication
router.use(protect);

// Manager/Admin routes
router.get("/", authorize("SUPER_ADMIN", "MANAGER"), getAllApartments);
router.post("/", authorize("SUPER_ADMIN", "MANAGER"), createApartment);
router.put("/:id", authorize("SUPER_ADMIN", "MANAGER"), updateApartment);
router.delete("/:id", authorize("SUPER_ADMIN", "MANAGER"), deleteApartment);

// Available apartments (tenant can view)
router.get("/available", getAvailableApartments);

module.exports = router;
