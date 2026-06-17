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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/visitors", formData);
      alert("Visitor registered successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error registering visitor:", error);
      alert("Failed to register visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Register Visitor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visitor Name
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
            Phone
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
            placeholder="Reason for visit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expected Check-in Time
          </label>
          <input
            type="datetime-local"
            name="checkIn"
            required
            value={formData.checkIn}
            onChange={handleChange}
            className="input-field mt-1"
          />
        </div>

        <div className="flex space-x-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Registering..." : "Register Visitor"}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorForm;
