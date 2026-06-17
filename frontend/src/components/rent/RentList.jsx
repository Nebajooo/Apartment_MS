import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const RentList = () => {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? "/rent/all" : "/rent/my-payments";
      const response = await api.get(endpoint);
      setPayments(response.data.payments);
      if (response.data.summary) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm("Mark this payment as paid?")) return;

    try {
      await api.put(`/rent/${id}/paid`);
      fetchPayments();
    } catch (error) {
      console.error("Error marking as paid:", error);
      alert("Failed to mark as paid");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      OVERDUE: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-10">Loading rent payments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isAdmin ? "Rent Payments" : "My Rent Payments"}
      </h1>

      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              ${summary.total_collected || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.pending_count || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.overdue_count || 0}
            </p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No rent payments found
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Month/Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4">
                    {payment.tenant_name || "You"}
                    {payment.unit_number && (
                      <span className="text-sm text-gray-500 block">
                        Unit: {payment.unit_number}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(payment.year, payment.month - 1).toLocaleString(
                      "default",
                      { month: "long" },
                    )}{" "}
                    {payment.year}
                  </td>
                  <td className="px-6 py-4">${payment.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  {isAdmin && payment.status !== "PAID" && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleMarkPaid(payment.id)}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Mark Paid
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RentList;
