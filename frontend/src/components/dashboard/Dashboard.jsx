import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTenants: 0,
    pendingMaintenance: 0,
    overdueRent: 0,
    totalVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats
      const [tenantsRes, maintenanceRes, rentRes, visitorsRes] =
        await Promise.all([
          api.get("/tenants?limit=1"),
          api.get("/maintenance/all?status=PENDING&limit=1"),
          api.get("/rent/all?status=OVERDUE&limit=1"),
          api.get("/visitors/all?status=EXPECTED&limit=1"),
        ]);

      setStats({
        totalTenants: tenantsRes.data.pagination?.total || 0,
        pendingMaintenance: maintenanceRes.data.pagination?.total || 0,
        overdueRent: rentRes.data.pagination?.total || 0,
        totalVisitors: visitorsRes.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{loading ? "..." : value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          icon="👥"
          color="text-blue-600"
        />
        <StatCard
          title="Pending Maintenance"
          value={stats.pendingMaintenance}
          icon="🔧"
          color="text-yellow-600"
        />
        <StatCard
          title="Overdue Rent"
          value={stats.overdueRent}
          icon="💰"
          color="text-red-600"
        />
        <StatCard
          title="Expected Visitors"
          value={stats.totalVisitors}
          icon="🚪"
          color="text-green-600"
        />
      </div>

      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">
            You are logged in as{" "}
            <span className="font-medium">{user?.role}</span>
          </p>
          {user?.apartment && (
            <p className="text-gray-600 mt-2">
              Apartment:{" "}
              <span className="font-medium">{user.apartment.unit_number}</span>
            </p>
          )}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Tip: Use the sidebar to navigate to different sections of the
              system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
