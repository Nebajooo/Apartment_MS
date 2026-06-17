import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tenants/${id}`);
      setTenant(response.data.tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      alert("Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Tenant not found</p>
        <Link to="/tenants" className="text-blue-600 hover:underline">
          Back to Tenants
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tenant Details</h1>
        <Link to="/tenants" className="text-blue-600 hover:underline">
          ← Back to Tenants
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Personal Information
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{tenant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{tenant.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{tenant.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {tenant.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Apartment Information
            </h3>
            {tenant.apartment ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Unit Number</p>
                  <p className="font-medium">{tenant.apartment.unit_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Floor</p>
                  <p className="font-medium">{tenant.apartment.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rent Amount</p>
                  <p className="font-medium">
                    ${tenant.apartment.rent_amount}/month
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tenant.apartment.is_occupied
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tenant.apartment.is_occupied ? "Occupied" : "Vacant"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mt-3">No apartment assigned</p>
            )}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Maintenance Requests</h3>
          {tenant.maintenance_requests &&
          tenant.maintenance_requests.length > 0 ? (
            <div className="space-y-3">
              {tenant.maintenance_requests.map((req) => (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{req.title}</h4>
                      <p className="text-sm text-gray-600">{req.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        req.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "ASSIGNED"
                            ? "bg-blue-100 text-blue-800"
                            : req.status === "RESOLVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No maintenance requests</p>
          )}
        </div>

        {/* Rent Payments */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Rent Payments</h3>
          {tenant.rent_payments && tenant.rent_payments.length > 0 ? (
            <div className="space-y-3">
              {tenant.rent_payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(payment.year, payment.month - 1).toLocaleString(
                        "default",
                        { month: "long" },
                      )}{" "}
                      {payment.year}
                    </p>
                    <p className="text-sm text-gray-600">${payment.amount}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "OVERDUE"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No rent payments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDetail;
