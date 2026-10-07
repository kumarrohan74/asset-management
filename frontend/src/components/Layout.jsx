import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { getAssets } from "../services/assetsApi";
import { getAssignments } from "../services/assignmentsApi";

function Layout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const loadNotifications = async () => {
    try {
      const [assetsData, assignmentsData] = await Promise.all([
        getAssets(),
        getAssignments(),
      ]);

      setAssets(assetsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();

    window.addEventListener("focus", loadNotifications);

    return () => {
      window.removeEventListener("focus", loadNotifications);
    };
  }, []);

  const maintenanceCount = assets.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  const availableCount = assets.filter(
    (asset) => asset.status === "Available"
  ).length;

  const recentAssignmentCount = assignments.filter((assignment) => {
    if (!assignment.assigned_date) {
      return false;
    }

    const assignedDate = new Date(assignment.assigned_date);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return assignedDate >= sevenDaysAgo;
  }).length;

  const notificationCount = maintenanceCount + recentAssignmentCount;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "▦",
    },
    {
      name: "Employees",
      path: "/employees",
      icon: "♙",
    },
    {
      name: "Assets",
      path: "/assets",
      icon: "▣",
    },
    {
      name: "Assignments",
      path: "/assignments",
      icon: "⇄",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "▤",
    },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">A</div>

          <div>
            <h1>AssetHub</h1>
            <span>Management System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">A</div>

          <div className="user-info">
            <strong>Admin User</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div>
            <span className="topbar-label">ASSET MANAGEMENT</span>
          </div>

          <div className="topbar-right">
            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={() =>
                  setNotificationsOpen((previous) => !previous)
                }
              >
                ♢

                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <div>
                      <strong>Notifications</strong>
                      <span>System overview</span>
                    </div>

                    <button
                      onClick={() => setNotificationsOpen(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="notification-list">
                    {maintenanceCount > 0 && (
                      <div className="notification-item">
                        <div className="notification-item-icon warning">
                          !
                        </div>

                        <div>
                          <strong>Maintenance required</strong>

                          <span>
                            {maintenanceCount} asset
                            {maintenanceCount !== 1 ? "s" : ""} need
                            attention
                          </span>
                        </div>
                      </div>
                    )}

                    {recentAssignmentCount > 0 && (
                      <div className="notification-item">
                        <div className="notification-item-icon">
                          ⇄
                        </div>

                        <div>
                          <strong>Recent assignments</strong>

                          <span>
                            {recentAssignmentCount} asset
                            {recentAssignmentCount !== 1 ? "s" : ""}{" "}
                            assigned in the last 7 days
                          </span>
                        </div>
                      </div>
                    )}

                    {availableCount > 0 && (
                      <div className="notification-item">
                        <div className="notification-item-icon">
                          ✓
                        </div>

                        <div>
                          <strong>Available assets</strong>

                          <span>
                            {availableCount} asset
                            {availableCount !== 1 ? "s" : ""} currently
                            available
                          </span>
                        </div>
                      </div>
                    )}

                    {notificationCount === 0 && (
                      <div className="notification-empty">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;