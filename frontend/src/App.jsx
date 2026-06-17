import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import TenantList from "./components/tenants/TenantList";
import TenantDetail from "./components/tenants/TenantDetail";
import MaintenanceList from "./components/maintenance/MaintenanceList";
import RentList from "./components/rent/RentList";
import VisitorList from "./components/visitors/VisitorList";
import NoticeBoard from "./components/notices/NoticeBoard";
import ApartmentList from "./components/apartments/ApartmentList";
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {user && <Sidebar />}
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Navigate to="/dashboard" />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tenants"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "MANAGER"]}>
                  <TenantList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tenants/:id"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "MANAGER"]}>
                  <TenantDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <MaintenanceList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rent"
              element={
                <ProtectedRoute>
                  <RentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/visitors"
              element={
                <ProtectedRoute>
                  <VisitorList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notices"
              element={
                <ProtectedRoute>
                  <NoticeBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apartments"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "MANAGER"]}>
                  <ApartmentList />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
