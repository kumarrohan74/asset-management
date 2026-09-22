import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Employees from "./pages/Employees";
import Assets from "./pages/Assets";
import Assignments from "./pages/Assignments";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="employees"
            element={<Employees />}
          />

          <Route
            path="assets"
            element={<Assets />}
          />

          <Route
            path="assignments"
            element={<Assignments />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;