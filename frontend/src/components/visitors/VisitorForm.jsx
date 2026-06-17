import { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  // Set default check-in time to now
  const getDefaultCheckIn = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Submitting visitor:", formData);

      const response = await api.post("/visitors", formData);
      console.log("Response:", response.data);

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

      const errorMsg =
        error.response?.data?.message ||
        "Failed to register visitor. Please try again.";
      setError(errorMsg);

      if (error.response?.data?.error) {
        console.error("Server error details:", error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Register Visitor</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          ❌ {error}
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
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Phone number"
          />
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
            value={formData.checkIn || getDefaultCheckIn()}
            onChange={handleChange}
            className="input-field mt-1"
          />
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
