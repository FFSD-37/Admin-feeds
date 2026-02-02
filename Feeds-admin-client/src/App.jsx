import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/dashboard.jsx";
import AdminLoginPage from "./components/login.jsx";
import ProtectedRoute from "./Routes/PrivateRoute.jsx";
import PublicRoute from "./Routes/PublicRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AdminLoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
