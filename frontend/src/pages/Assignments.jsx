import { useEffect, useState } from "react";
import {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } from "../services/assignmentsApi";

import { getEmployees } from "../services/employeesApi";
import { getAssets } from "../services/assetsApi";

const emptyForm = {
  employeeId: "",
  assetId: "",
  assignedDate: "",
  remarks: "",
};

function Assignments() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadAssignments();
    loadEmployees();
    loadAssets();
  }, []);

  const mapAssignmentFromApi = (assignment) => ({
    id: assignment.id,
    employeeId: assignment.employee_id,
    assetId: assignment.asset_id,
    assignedDate: assignment.assigned_date,
    returnedDate: assignment.returned_date || "",
    remarks: assignment.remarks || "",
  });
  
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setApiError("");
  
      const data = await getAssignments();
      setAssignments(data.map(mapAssignmentFromApi));
    } catch (error) {
      console.error(error);
      setApiError(
        "Unable to load assignments. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      setApiError(
        "Unable to load employees. Please make sure the backend is running."
      );
    }
  };
  
  const loadAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      console.error(error);
      setApiError(
        "Unable to load assets. Please make sure the backend is running."
      );
    }
  };

  const availableAssets = assets.filter(
    (asset) => asset.status === "Available"
  );

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

  const getAssignmentStatus = (assignment) => {
    return assignment.returnedDate
      ? "Returned"
      : "Assigned";
  };

  const openAddModal = () => {
    setForm({
      ...emptyForm,
      assignedDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setSelectedAssignment(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.employeeId) {
      newErrors.employeeId =
        "Employee is required";
    }

    if (!form.assetId) {
      newErrors.assetId =
        "Asset is required";
    }

    if (!form.assignedDate) {
      newErrors.assignedDate =
        "Assignment date is required";
    }

    return newErrors;
  };

  const handleAssign = async (event) => {
    event.preventDefault();
  
    const validationErrors = validateForm();
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    const employeeId = Number(form.employeeId);
    const assetId = Number(form.assetId);
  
    try {
      setApiError("");
  
      const assignmentData = {
        employee_id: employeeId,
        asset_id: assetId,
        assigned_date: form.assignedDate,
        returned_date: null,
        remarks: form.remarks.trim(),
      };
  
      const newAssignment = await createAssignment(assignmentData);
  
      setAssignments((previous) => [
        ...previous,
        mapAssignmentFromApi(newAssignment),
      ]);
  
      closeModal();
    } catch (error) {
      console.error(error);
      setApiError(error.message || "Failed to create assignment");
    }
  };

  const handleReturn = async (assignment) => {
  const employee = getEmployee(assignment.employeeId);

  const asset = getAsset(assignment.assetId);

  const confirmed = window.confirm(
    `Return ${asset?.asset_name || "this asset"} from ${
      employee?.name || "this employee"
    }?`
  );

  if (!confirmed) {
    return;
  }

  const returnedDate = new Date()
    .toISOString()
    .split("T")[0];

  try {
    setApiError("");

    const assignmentData = {
      employee_id: assignment.employeeId,
      asset_id: assignment.assetId,
      assigned_date: assignment.assignedDate,
      returned_date: returnedDate,
      remarks: assignment.remarks || "",
    };

    const updatedAssignment = await updateAssignment(
      assignment.id,
      assignmentData
    );

    setAssignments((previous) =>
      previous.map((item) =>
        item.id === assignment.id
        ? mapAssignmentFromApi(updatedAssignment)
        : item
      )
    );
  } catch (error) {
    console.error(error);
    setApiError(
      error.message || "Failed to return asset"
    );
  }
};

const handleDelete = async (assignment) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );
  
    if (!confirmed) {
      return;
    }
  
    try {
      setApiError("");
  
      await deleteAssignment(assignment.id);
  
      setAssignments((previous) =>
        previous.filter(
          (item) => item.id !== assignment.id
        )
      );
    } catch (error) {
      console.error(error);
      setApiError(
        error.message || "Failed to delete assignment"
      );
    }
  };

  const filteredAssignments =
  assignments.filter((assignment) => {
    const employee = getEmployee(
      assignment.employeeId
    );

    const asset = getAsset(
      assignment.assetId
    );

    const search = searchTerm
      .toLowerCase()
      .trim();

    const matchesSearch =
      !search ||
      employee?.name
        ?.toLowerCase()
        .includes(search) ||
      employee?.employee_id
        ?.toLowerCase()
        .includes(search) ||
      asset?.asset_name
        ?.toLowerCase()
        .includes(search) ||
      asset?.asset_id
        ?.toLowerCase()
        .includes(search);

    const status =
      getAssignmentStatus(assignment);

    const matchesStatus =
      statusFilter === "All" ||
      status === statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Assignments</h2>
          <p>
            Assign company assets to employees and manage returns.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Assign Asset
        </button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Asset Assignment History</h3>
            <span>
              {assignments.length} assignment
              {assignments.length !== 1
                ? "s"
                : ""}
            </span>
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
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-state"
                  >
                    No assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => {
                  const employee = getEmployee(
                    assignment.employeeId
                  );

                  const asset = getAsset(
                    assignment.assetId
                  );

                  const status =
                    getAssignmentStatus(
                      assignment
                    );

                  return (
                    <tr key={assignment.id}>
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
                                "Unknown Employee"}
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
                          {asset?.asset_id || "-"}
                        </div>
                      </td>

                      <td>
                        {assignment.assignedDate
                          ? new Date(
                              assignment.assignedDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {assignment.returnedDate
                          ? new Date(
                              assignment.returnedDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={`status-badge assignment-status ${
                            status === "Assigned"
                              ? "assigned"
                              : "returned"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {assignment.remarks ||
                          "-"}
                      </td>

                      <td>
                        <div className="action-buttons">
                          {!assignment.returnedDate && (
                            <button
                              className="action-button"
                              onClick={() =>
                                handleReturn(
                                  assignment
                                )
                              }
                            >
                              Return
                            </button>
                          )}

                          <button
                            className="action-button danger"
                            onClick={() =>
                              handleDelete(
                                assignment
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Assign Asset</h3>
                <p>
                  Assign an available asset to an employee.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleAssign}
            >
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee *</label>

                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select employee
                    </option>

                    {employees
                      .filter(
                        (employee) =>
                          employee.status ===
                          "Active"
                      )
                      .map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.employee_id} -{" "}
                          {employee.name}
                        </option>
                      ))}
                  </select>

                  {errors.employeeId && (
                    <small className="error">
                      {errors.employeeId}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Asset *</label>

                  <select
                    name="assetId"
                    value={form.assetId}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select available asset
                    </option>

                    {availableAssets.map(
                      (asset) => (
                        <option
                          key={asset.id}
                          value={asset.id}
                        >
                          {asset.asset_id} -{" "}
                          {asset.asset_name}
                        </option>
                      )
                    )}
                  </select>

                  {errors.assetId && (
                    <small className="error">
                      {errors.assetId}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Assignment Date *</label>

                  <input
                    type="date"
                    name="assignedDate"
                    value={form.assignedDate}
                    onChange={handleChange}
                  />

                  {errors.assignedDate && (
                    <small className="error">
                      {errors.assignedDate}
                    </small>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Enter assignment remarks..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Assign Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assignments;