import { useState, useEffect } from "react";
import api from "../../api/axios";

const VisitorForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "",
    checkIn: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set default check-in time when component mounts
  useEffect(() => {
    const now = new Date();
    // Format: YYYY-MM-DDThh:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const defaultCheckIn = `${year}-${month}-${day}T${hours}:${minutes}`;

    setFormData((prev) => ({
      ...prev,
      checkIn: defaultCheckIn,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Debug: Log all form data
    console.log("=== FORM DATA ===");
    console.log("Name:", formData.name);
    console.log("Phone:", formData.phone);
    console.log("Purpose:", formData.purpose);
    console.log("CheckIn:", formData.checkIn);
    console.log("=================");

    // Validate each field individually with clear messages
    if (!formData.name || formData.name.trim() === "") {
      setError("❌ Visitor name is required");
      setLoading(false);
      return;
    }

    if (!formData.phone || formData.phone.trim() === "") {
      setError("❌ Phone number is required");
      setLoading(false);
      return;
    }

    if (!formData.checkIn || formData.checkIn === "") {
      setError("❌ Check-in time is required");
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const dataToSend = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        purpose: formData.purpose ? formData.purpose.trim() : "",
        checkIn: formData.checkIn,
      };

      console.log("Sending to API:", dataToSend);

      const response = await api.post("/visitors", dataToSend);

      console.log("API Response:", response.data);

      if (response.data.success) {
        alert(
          `✅ Visitor registered successfully!\nOTP Code: ${response.data.otpCode}`,
        );
        onSuccess();
        onClose();
      } else {
        setError(response.data.message || "Failed to register visitor");
      }
    } catch (error) {
      console.error("❌ Error registering visitor:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        "Failed to register visitor. Please try again.";
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Register Visitor</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visitor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter visitor's full name"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">
            Current value: "{formData.name || "(empty)"}"
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter phone number (e.g., +1234567890)"
          />
          <p className="text-xs text-gray-400 mt-1">
            Current value: "{formData.phone || "(empty)"}"
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Reason for visit (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expected Check-in Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="checkIn"
            required
            value={formData.checkIn}
            onChange={handleChange}
            className="input-field mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">
            Current value: "{formData.checkIn || "(empty)"}"
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? "Registering..." : "Register Visitor"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorForm;
