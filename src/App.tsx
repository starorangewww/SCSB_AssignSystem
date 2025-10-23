import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import LoginPlatform from "./components/Login";
import AdminDashboard from "./components/Admin";
import GeneralManagerDashboard from "./components/General_Manager";
import AreaManagerDashboard from "./components/Area_Manager";
import BranchManagerDashboard from "./components/Branch_Manager";
import RMDashboard from "./components/RM";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPlatform />} />
        <Route
          path="/Admin_Dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/General_Manager"
          element={
            <ProtectedRoute>
              <GeneralManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Area_Manager/:area"
          element={
            <ProtectedRoute>
              <AreaManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Branch_Manager/:branch"
          element={
            <ProtectedRoute>
              <BranchManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/RM/:branch"
          element={
            <ProtectedRoute>
              <RMDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
