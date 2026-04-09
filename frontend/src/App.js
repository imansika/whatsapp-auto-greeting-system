import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import authService from "./services/authservice";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={(
            <PublicRoute>
              <Login />
            </PublicRoute>
          )}
        />

        {/* Dashboard Page - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={authService.isAuthenticated() ? "/dashboard" : "/"} replace />}
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;