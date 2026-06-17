import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import TenantForm from "./TenantForm";

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tenants");
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant?")) return;

    try {
      await api.delete(`/tenants/${id}`);
      fetchTenants();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      alert("Failed to delete tenant");
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center py-10">Loading tenants...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <button
          onClick={() => {
            setEditingTenant(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Add Tenant
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <TenantForm
            tenant={editingTenant}
            onClose={() => {
              setShowForm(false);
              setEditingTenant(null);
            }}
            onSuccess={fetchTenants}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No tenants found
          </div>
        ) : (
          tenants.map((tenant) => (
            <div key={tenant.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{tenant.name}</h3>
                  <p className="text-sm text-gray-500">{tenant.email}</p>
                  <p className="text-sm text-gray-500">
                    {tenant.phone || "No phone"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <Link
                    to={`/tenants/${tenant.id}`}
                    className="text-green-600 hover:text-green-800"
                  >
                    👁️
                  </Link>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {tenant.apartment && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    Unit:{" "}
                    <span className="font-medium">
                      {tenant.apartment.unit_number}
                    </span>{" "}
                    • Floor: {tenant.apartment.floor}
                  </p>
                  <p className="text-sm">
                    Rent: ${tenant.apartment.rent_amount}/month
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantList;
