import { useEffect, useState } from "react";
import api from "../../api/axios";

const ApartmentList = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/apartments");
      setApartments(response.data.apartments || []);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this apartment?"))
      return;

    try {
      await api.delete(`/apartments/${id}`);
      fetchApartments();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete apartment");
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading apartments...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Apartments</h1>
        <button
          onClick={() => {
            setEditingApartment(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Add Apartment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apt) => (
          <div key={apt.id} className="card">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">Unit {apt.unit_number}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  apt.is_occupied
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {apt.is_occupied ? "Occupied" : "Available"}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <p>Floor: {apt.floor}</p>
              <p>Rent: ${apt.rent_amount}/month</p>
              <p>Bedrooms: {apt.bedrooms}</p>
              <p>Bathrooms: {apt.bathrooms}</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setEditingApartment(apt);
                  setShowForm(true);
                }}
                className="btn-secondary text-sm px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(apt.id)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              {editingApartment ? "Edit Apartment" : "Add New Apartment"}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  unitNumber: formData.get("unitNumber"),
                  floor: parseInt(formData.get("floor")),
                  rentAmount: parseFloat(formData.get("rentAmount")),
                  bedrooms: parseInt(formData.get("bedrooms")),
                  bathrooms: parseInt(formData.get("bathrooms")),
                };

                try {
                  if (editingApartment) {
                    await api.put(`/apartments/${editingApartment.id}`, data);
                  } else {
                    await api.post("/apartments", data);
                  }
                  fetchApartments();
                  setShowForm(false);
                  setEditingApartment(null);
                } catch (error) {
                  alert(
                    error.response?.data?.message || "Failed to save apartment",
                  );
                }
              }}
            >
              <div className="space-y-4">
                <input
                  type="text"
                  name="unitNumber"
                  placeholder="Unit Number"
                  defaultValue={editingApartment?.unit_number}
                  required
                  className="input-field"
                />
                <input
                  type="number"
                  name="floor"
                  placeholder="Floor"
                  defaultValue={editingApartment?.floor}
                  required
                  className="input-field"
                />
                <input
                  type="number"
                  name="rentAmount"
                  placeholder="Rent Amount"
                  defaultValue={editingApartment?.rent_amount}
                  required
                  className="input-field"
                />
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="Bedrooms"
                  defaultValue={editingApartment?.bedrooms || 1}
                  className="input-field"
                />
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="Bathrooms"
                  defaultValue={editingApartment?.bathrooms || 1}
                  className="input-field"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingApartment ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingApartment(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentList;
