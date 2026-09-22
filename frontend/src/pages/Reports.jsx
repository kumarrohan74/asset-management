import { useEffect, useState } from "react";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const loadData = () => {
    const savedEmployees =
      localStorage.getItem("employees");

    const savedAssets =
      localStorage.getItem("assets");

    const savedAssignments =
      localStorage.getItem("assignments");

    setEmployees(
      savedEmployees
        ? JSON.parse(savedEmployees)
        : []
    );

    setAssets(
      savedAssets
        ? JSON.parse(savedAssets)
        : []
    );

    setAssignments(
      savedAssignments
        ? JSON.parse(savedAssignments)
        : []
    );
  };

  useEffect(() => {
    loadData();

    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener(
        "focus",
        loadData
      );
    };
  }, []);

  const totalAssets = assets.length;

  const assignedAssets = assets.filter(
    (asset) => asset.status === "Assigned"
  ).length;

  const availableAssets = assets.filter(
    (asset) => asset.status === "Available"
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

  const assetTypes = {};

  assets.forEach((asset) => {
    const type = asset.asset_type || "Other";

    assetTypes[type] =
      (assetTypes[type] || 0) + 1;
  });

  const assetTypeEntries = Object.entries(
    assetTypes
  ).sort((a, b) => b[1] - a[1]);

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

  const getEmployeeAssetCount = (employeeId) => {
    return assignments.filter(
      (assignment) =>
        assignment.employeeId === employeeId &&
        !assignment.returnedDate
    ).length;
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
    <div className="reports-page">
      {/* Header */}

      <div className="page-header">
        <div>
          <h2>Reports</h2>

          <p>
            View asset inventory and assignment
            reports.
          </p>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="reports-stats">
        <div className="report-stat-card">
          <span>Total Assets</span>

          <strong>{totalAssets}</strong>

          <small>All inventory</small>
        </div>

        <div className="report-stat-card">
          <span>Assigned</span>

          <strong>{assignedAssets}</strong>

          <small>Currently assigned</small>
        </div>

        <div className="report-stat-card">
          <span>Available</span>

          <strong>{availableAssets}</strong>

          <small>Ready to assign</small>
        </div>

        <div className="report-stat-card">
          <span>Employees</span>

          <strong>{activeEmployees}</strong>

          <small>Active employees</small>
        </div>
      </div>

      {/* Asset Distribution + Employee Usage */}

      <div className="reports-grid">

        {/* Asset Distribution */}

        <div className="report-panel">
          <div className="report-panel-header">
            <div>
              <h3>Asset Distribution</h3>

              <p>
                Assets grouped by type
              </p>
            </div>
          </div>

          <div className="distribution-list">
            {assetTypeEntries.length === 0 ? (
              <div className="report-empty">
                No assets available.
              </div>
            ) : (
              assetTypeEntries.map(
                ([type, count]) => {
                  const percentage =
                    totalAssets > 0
                      ? Math.round(
                          (count /
                            totalAssets) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className="distribution-item"
                      key={type}
                    >
                      <div className="distribution-top">
                        <span>{type}</span>

                        <strong>
                          {count}
                        </strong>
                      </div>

                      <div className="distribution-bar">
                        <div
                          className="distribution-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* Employee Asset Usage */}

        <div className="report-panel">
          <div className="report-panel-header">
            <div>
              <h3>
                Employee Asset Usage
              </h3>

              <p>
                Currently assigned assets
              </p>
            </div>
          </div>

          <div className="employee-usage-list">
            {employees.length === 0 ? (
              <div className="report-empty">
                No employees available.
              </div>
            ) : (
              employees.map((employee) => {
                const assetCount =
                  getEmployeeAssetCount(
                    employee.id
                  );

                return (
                  <div
                    className="employee-usage-item"
                    key={employee.id}
                  >
                    <div className="employee-usage-info">
                      <div className="employee-avatar">
                        {employee.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "?"}
                      </div>

                      <div>
                        <strong>
                          {employee.name}
                        </strong>

                        <span>
                          {employee.employee_id}
                        </span>
                      </div>
                    </div>

                    <div className="employee-usage-count">
                      <strong>
                        {assetCount}
                      </strong>

                      <span>
                        {assetCount === 1
                          ? "asset"
                          : "assets"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Asset Status */}

      <div className="report-panel status-report-panel">
        <div className="report-panel-header">
          <div>
            <h3>Asset Status Summary</h3>

            <p>
              Current status of all inventory
            </p>
          </div>
        </div>

        <div className="status-summary">
          <div className="status-summary-item">
            <span className="status-summary-dot available"></span>

            <div>
              <strong>Available</strong>
              <span>
                Ready for assignment
              </span>
            </div>

            <b>{availableAssets}</b>
          </div>

          <div className="status-summary-item">
            <span className="status-summary-dot assigned"></span>

            <div>
              <strong>Assigned</strong>
              <span>
                Currently with employees
              </span>
            </div>

            <b>{assignedAssets}</b>
          </div>

          <div className="status-summary-item">
            <span className="status-summary-dot maintenance"></span>

            <div>
              <strong>Maintenance</strong>
              <span>
                Requires attention
              </span>
            </div>

            <b>{maintenanceAssets}</b>
          </div>

          <div className="status-summary-item">
            <span className="status-summary-dot retired"></span>

            <div>
              <strong>Retired</strong>
              <span>
                No longer in service
              </span>
            </div>

            <b>{retiredAssets}</b>
          </div>
        </div>
      </div>

      {/* Assignment History */}

      <div className="report-panel assignment-report-panel">
        <div className="report-panel-header">
          <div>
            <h3>Assignment History</h3>

            <p>
              Complete asset assignment
              history
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Asset</th>
                <th>Assigned Date</th>
                <th>Returned Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-state"
                  >
                    No assignment history
                    available.
                  </td>
                </tr>
              ) : (
                [...assignments]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.assignedDate
                      ) -
                      new Date(
                        a.assignedDate
                      )
                  )
                  .map((assignment) => {
                    const employee =
                      getEmployee(
                        assignment.employeeId
                      );

                    const asset =
                      getAsset(
                        assignment.assetId
                      );

                    const returned =
                      Boolean(
                        assignment.returnedDate
                      );

                    return (
                      <tr
                        key={assignment.id}
                      >
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">
                              {employee?.name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "?"}
                            </div>

                            <div>
                              <strong>
                                {employee?.name ||
                                  "Unknown"}
                              </strong>

                              <span>
                                {employee?.employee_id ||
                                  "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {asset?.asset_name ||
                              "Unknown Asset"}
                          </strong>

                          <div className="table-subtext">
                            {asset?.asset_id ||
                              "-"}
                          </div>
                        </td>

                        <td>
                          {formatDate(
                            assignment.assignedDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            assignment.returnedDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`status-badge assignment-status ${
                              returned
                                ? "returned"
                                : "assigned"
                            }`}
                          >
                            {returned
                              ? "Returned"
                              : "Assigned"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;