import { useEffect, useState } from "react";
import { getEmployees } from "../services/employeesApi";
import { getAssets } from "../services/assetsApi";
import { getAssignments } from "../services/assignmentsApi";

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const loadDashboardData = async () => {
    try {
      const [employeesData, assetsData, assignmentsData] =
        await Promise.all([
          getEmployees(),
          getAssets(),
          getAssignments(),
        ]);
  
      setEmployees(employeesData);
      setAssets(assetsData);
      setAssignments(
        assignmentsData.map((assignment) => ({
          id: assignment.id,
          employeeId: assignment.employee_id,
          assetId: assignment.asset_id,
          assignedDate: assignment.assigned_date,
          returnedDate: assignment.returned_date || "",
          remarks: assignment.remarks || "",
        }))
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard data:",
        error
      );
    }
  };

  useEffect(() => {
    loadDashboardData();

    window.addEventListener(
      "focus",
      loadDashboardData
    );

    return () => {
      window.removeEventListener(
        "focus",
        loadDashboardData
      );
    };
  }, []);

  const totalAssets = assets.length;

  const availableAssets = assets.filter(
    (asset) => asset.status === "Available"
  ).length;

  const assignedAssets = assets.filter(
    (asset) => asset.status === "Assigned"
  ).length;

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  const retiredAssets = assets.filter(
    (asset) => asset.status === "Retired"
  ).length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const recentAssignments = [...assignments]
    .sort(
      (a, b) =>
        new Date(b.assignedDate) -
        new Date(a.assignedDate)
    )
    .slice(0, 5);

  const getEmployee = (employeeId) => {
    return employees.find(
      (employee) => employee.id === employeeId
    );
  };

  const getAsset = (assetId) => {
    return assets.find(
      (asset) => asset.id === assetId
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Good morning, Admin 👋</h2>

          <p>
            Here's what's happening with your
            assets.
          </p>
        </div>
      </div>

      {/* Statistics */}

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <div className="dashboard-card-top">
            <span>Employees</span>

            <div className="dashboard-icon">
              ♙
            </div>
          </div>

          <h3>{activeEmployees}</h3>

          <p>Active employees</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-top">
            <span>Total Assets</span>

            <div className="dashboard-icon">
              ▣
            </div>
          </div>

          <h3>{totalAssets}</h3>

          <p>Assets in inventory</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-top">
            <span>Assigned</span>

            <div className="dashboard-icon">
              ⇄
            </div>
          </div>

          <h3>{assignedAssets}</h3>

          <p>Currently assigned</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-top">
            <span>Available</span>

            <div className="dashboard-icon">
              ✓
            </div>
          </div>

          <h3>{availableAssets}</h3>

          <p>Ready to assign</p>
        </div>
      </div>

      {/* Main dashboard grid */}

      <div className="dashboard-grid">

        {/* Asset Overview */}

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Asset Overview</h3>

              <p>
                Current inventory status
              </p>
            </div>
          </div>

          <div className="asset-overview">
            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot available"></span>
                Available
              </div>

              <strong>{availableAssets}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot assigned"></span>
                Assigned
              </div>

              <strong>{assignedAssets}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot maintenance"></span>
                Maintenance
              </div>

              <strong>{maintenanceAssets}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot retired"></span>
                Retired
              </div>

              <strong>{retiredAssets}</strong>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recent Assignments</h3>

              <p>
                Latest asset activity
              </p>
            </div>
          </div>

          <div className="recent-list">
            {recentAssignments.length === 0 ? (
              <div className="dashboard-empty">
                No assignments yet.
              </div>
            ) : (
              recentAssignments.map(
                (assignment) => {
                  const employee =
                    getEmployee(
                      assignment.employeeId
                    );

                  const asset =
                    getAsset(
                      assignment.assetId
                    );

                  return (
                    <div
                      className="recent-item"
                      key={assignment.id}
                    >
                      <div className="recent-avatar">
                        {employee?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "?"}
                      </div>

                      <div className="recent-content">
                        <strong>
                          {employee?.name ||
                            "Unknown Employee"}
                        </strong>

                        <span>
                          →{" "}
                          {asset?.asset_name ||
                            "Unknown Asset"}
                        </span>
                      </div>

                      <div className="recent-date">
                        {formatDate(
                          assignment.assignedDate
                        )}
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}

      <div className="dashboard-panel activity-panel">
        <div className="dashboard-panel-header">
          <div>
            <h3>Recent Activity</h3>

            <p>
              Latest changes in the system
            </p>
          </div>
        </div>

        <div className="activity-list">

          {recentAssignments.length === 0 ? (
            <div className="dashboard-empty">
              No recent activity.
            </div>
          ) : (
            recentAssignments
              .slice(0, 5)
              .map((assignment) => {
                const employee =
                  getEmployee(
                    assignment.employeeId
                  );

                const asset =
                  getAsset(
                    assignment.assetId
                  );

                const isReturned =
                  Boolean(
                    assignment.returnedDate
                  );

                return (
                  <div
                    className="activity-item"
                    key={`activity-${assignment.id}`}
                  >
                    <div className="activity-icon">
                      {isReturned
                        ? "↩"
                        : "⇄"}
                    </div>

                    <div className="activity-content">
                      <strong>
                        {isReturned
                          ? "Asset returned"
                          : "Asset assigned"}
                      </strong>

                      <span>
                        {asset?.asset_name ||
                          "Unknown Asset"}{" "}
                        {isReturned
                          ? `returned by ${
                              employee?.name ||
                              "Unknown Employee"
                            }`
                          : `assigned to ${
                              employee?.name ||
                              "Unknown Employee"
                            }`}
                      </span>
                    </div>

                    <div className="activity-date">
                      {formatDate(
                        isReturned
                          ? assignment.returnedDate
                          : assignment.assignedDate
                      )}
                    </div>
                  </div>
                );
              })
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;