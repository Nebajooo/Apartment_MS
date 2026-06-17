import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import MaintenanceForm from "./MaintenanceForm";

const MaintenanceList = () => {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin
        ? "/maintenance/all"
        : "/maintenance/my-requests";
      const response = await api.get(endpoint);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      alert("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      const response = await api.put(`/maintenance/${id}/status`, { status });

      if (response.data.success) {
        // Update the request in the local state
        setRequests(
          requests.map((req) =>
            req.id === id ? { ...req, status: status } : req,
          ),
        );
        alert(`Request status updated to ${status}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update status";
      alert(errorMsg);
      // Refresh to get latest data
      fetchRequests();
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      RESOLVED: "bg-green-100 text-green-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="text-center py-10">Loading maintenance requests...</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "Maintenance Requests" : "My Maintenance Requests"}
        </h1>
        {!isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + New Request
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <MaintenanceForm
            onClose={() => setShowForm(false)}
            onSuccess={fetchRequests}
          />
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No maintenance requests found
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(request.priority)}`}
                    >
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{request.description}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}
                    >
                      Status: {request.status}
                    </span>
                    {request.tenant_name && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        Tenant: {request.tenant_name}
                      </span>
                    )}
                    {request.unit_number && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        Unit: {request.unit_number}
                      </span>
                    )}
                    {request.created_at && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        Created:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="ml-4 min-w-[140px]">
                    <select
                      value={request.status}
                      onChange={(e) =>
                        handleStatusUpdate(request.id, e.target.value)
                      }
                      disabled={updating === request.id}
                      className="w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">📋 Pending</option>
                      <option value="ASSIGNED">👤 Assign</option>
                      <option value="IN_PROGRESS">⚙️ In Progress</option>
                      <option value="RESOLVED">✅ Resolve</option>
                      <option value="CANCELLED">❌ Cancel</option>
                    </select>
                    {updating === request.id && (
                      <span className="text-xs text-gray-500 mt-1 block text-center">
                        Updating...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Show assigned to if set */}
              {request.assigned_to && (
                <div className="mt-3 text-sm text-gray-500">
                  Assigned to: {request.assigned_to_name || "Staff Member"}
                </div>
              )}

              {/* Show resolved at if set */}
              {request.resolved_at && (
                <div className="mt-1 text-sm text-gray-500">
                  Resolved: {new Date(request.resolved_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
