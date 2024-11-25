// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Login from "~/pages/Login";
import Dashboard from "~/pages/Dashboard";

//outlet to show child routes
const ProtectedRoute = () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return <Navigate to="/login" replace={true} />;
  return <Outlet />;
};

//unauthorizedRoutes
const UnauthorizedRoutes = () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) return <Navigate to="/dashboard" replace={true} />;
  return <Outlet />;
};
function App() {
  const location = useLocation();

  return (
    <Routes>
      <Route element={<UnauthorizedRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* outlet will show */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
