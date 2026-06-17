import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import VisitorForm from "./VisitorForm";

const VisitorList = () => {
  const { user, isAdmin } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? "/visitors/all" : "/visitors/my-visitors";
      const response = await api.get(endpoint);
      setVisitors(response.data.visitors);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await api.put(`/visitors/${id}/check-in`);
      fetchVisitors();
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check in visitor");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/visitors/${id}/check-out`);
      fetchVisitors();
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Failed to check out visitor");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      EXPECTED: "bg-blue-100 text-blue-800",
      CHECKED_IN: "bg-green-100 text-green-800",
      CHECKED_OUT: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-10">Loading visitors...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "All Visitors" : "My Visitors"}
        </h1>
        {!isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Register Visitor
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <VisitorForm
            onClose={() => setShowForm(false)}
            onSuccess={fetchVisitors}
          />
        </div>
      )}

      {visitors.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No visitors found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{visitor.name}</h3>
                  <p className="text-sm text-gray-500">{visitor.phone}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(visitor.status)}`}
                >
                  {visitor.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Purpose:</span>{" "}
                  {visitor.purpose || "N/A"}
                </p>
                <p>
                  <span className="text-gray-500">Check-in:</span>{" "}
                  {new Date(visitor.check_in).toLocaleString()}
                </p>
                {visitor.check_out && (
                  <p>
                    <span className="text-gray-500">Check-out:</span>{" "}
                    {new Date(visitor.check_out).toLocaleString()}
                  </p>
                )}
                {visitor.otp_code && (
                  <p>
                    <span className="text-gray-500">OTP:</span>{" "}
                    <span className="font-mono font-bold">
                      {visitor.otp_code}
                    </span>
                  </p>
                )}
                {visitor.host_name && (
                  <p>
                    <span className="text-gray-500">Host:</span>{" "}
                    {visitor.host_name}
                  </p>
                )}
              </div>
              {isAdmin && visitor.status === "EXPECTED" && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleCheckIn(visitor.id)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Check In
                  </button>
                </div>
              )}
              {isAdmin && visitor.status === "CHECKED_IN" && (
                <div className="mt-4">
                  <button
                    onClick={() => handleCheckOut(visitor.id)}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    Check Out
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorList;
