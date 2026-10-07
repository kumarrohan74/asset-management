import { useEffect, useState } from "react";

import { getEmployees } from "../services/employeesApi";
import { getAssets } from "../services/assetsApi";
import { getAssignments } from "../services/assignmentsApi";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        employeesData,
        assetsData,
        assignmentsData,
      ] = await Promise.all([
        getEmployees(),
        getAssets(),
        getAssignments(),
      ]);

      setEmployees(employeesData);
      setAssets(assetsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load report data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  const availableAssets = assets.filter(
    (asset) => asset.status === "Available"
  ).length;

  const assignedAssets = assets.filter(
    (asset) => asset.status === "Assigned"
  ).length;

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  const returnedAssignments = assignments.filter(
    (assignment) => assignment.returned_date
  ).length;

  const activeAssignments = assignments.filter(
    (assignment) => !assignment.returned_date
  ).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Reports</h2>
            <p>View asset and employee insights.</p>
          </div>
        </div>

        <div className="empty-state">
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Reports</h2>
            <p>View asset and employee insights.</p>
          </div>
        </div>

        <div className="empty-state">
          <p>{error}</p>

          <button onClick={loadReportData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p>View asset and employee insights.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Employees</span>
          <strong>{employees.length}</strong>
        </div>

        <div className="stat-card">
          <span>Active Employees</span>
          <strong>{activeEmployees}</strong>
        </div>

        <div className="stat-card">
          <span>Total Assets</span>
          <strong>{assets.length}</strong>
        </div>

        <div className="stat-card">
          <span>Assigned Assets</span>
          <strong>{assignedAssets}</strong>
        </div>

        <div className="stat-card">
          <span>Available Assets</span>
          <strong>{availableAssets}</strong>
        </div>

        <div className="stat-card">
          <span>Maintenance Assets</span>
          <strong>{maintenanceAssets}</strong>
        </div>

        <div className="stat-card">
          <span>Active Assignments</span>
          <strong>{activeAssignments}</strong>
        </div>

        <div className="stat-card">
          <span>Returned Assignments</span>
          <strong>{returnedAssignments}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>Employee Overview</h3>
            <p>Current employee status summary.</p>
          </div>
        </div>

        <div className="report-summary">
          <div>
            <span>Active</span>
            <strong>{activeEmployees}</strong>
          </div>

          <div>
            <span>Inactive</span>
            <strong>{inactiveEmployees}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>{employees.length}</strong>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>Asset Overview</h3>
            <p>Current asset status summary.</p>
          </div>
        </div>

        <div className="report-summary">
          <div>
            <span>Available</span>
            <strong>{availableAssets}</strong>
          </div>

          <div>
            <span>Assigned</span>
            <strong>{assignedAssets}</strong>
          </div>

          <div>
            <span>Maintenance</span>
            <strong>{maintenanceAssets}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>{assets.length}</strong>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>Assignment Overview</h3>
            <p>Current and historical assignment summary.</p>
          </div>
        </div>

        <div className="report-summary">
          <div>
            <span>Active Assignments</span>
            <strong>{activeAssignments}</strong>
          </div>

          <div>
            <span>Returned</span>
            <strong>{returnedAssignments}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>{assignments.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;