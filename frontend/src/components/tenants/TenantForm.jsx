import { useState, useEffect } from "react";
import api from "../../api/axios";

const TenantForm = ({ onClose, onSuccess, tenant }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    apartmentId: "",
  });
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!tenant;

  useEffect(() => {
    fetchApartments();
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        email: tenant.email || "",
        password: "",
        phone: tenant.phone || "",
        apartmentId: tenant.apartment_id || "",
      });
    }
  }, [tenant]);

  const fetchApartments = async () => {
    try {
      const response = await api.get("/apartments");
      setApartments(response.data.apartments || []);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

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
      if (isEditing) {
        await api.put(`/tenants/${tenant.id}`, formData);
        alert("Tenant updated successfully!");
      } else {
        await api.post("/tenants", formData);
        alert("Tenant created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving tenant:", error);
      alert(error.response?.data?.message || "Failed to save tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">
        {isEditing ? "Edit Tenant" : "Add New Tenant"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter email address"
          />
        </div>

        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required={!isEditing}
              value={formData.password}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Create a password"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Apartment
          </label>
          <select
            name="apartmentId"
            value={formData.apartmentId}
            onChange={handleChange}
            className="input-field mt-1"
          >
            <option value="">Select an apartment</option>
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                Unit {apt.unit_number} - Floor {apt.floor} (${apt.rent_amount}
                /mo)
                {apt.is_occupied && " 🔴 Occupied"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Tenant"
                : "Create Tenant"}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenantForm;
