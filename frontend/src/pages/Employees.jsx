import { useEffect, useState } from "react";
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from "../services/employeesApi";

const emptyForm = {
    employee_id: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    phone: "",
    status: "Active",
};

function Employees() {
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const departments = [
        ...new Set(
            employees
                .map((employee) => employee.department)
                .filter(Boolean)
        ),
    ];

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setApiError("");

            const data = await getEmployees();

            setEmployees(data);
        } catch (error) {
            console.error(error);
            setApiError(
                "Unable to load employees. Please make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter((employee) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            employee.name.toLowerCase().includes(searchText) ||
            employee.employee_id.toLowerCase().includes(searchText) ||
            employee.email.toLowerCase().includes(searchText);

        const matchesDepartment =
            departmentFilter === "All" ||
            employee.department === departmentFilter;

        const matchesStatus =
            statusFilter === "All" ||
            employee.status === statusFilter;

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
        );
    });

    const openAddModal = () => {
        setModalMode("add");
        setForm(emptyForm);
        setErrors({});
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setModalMode("edit");
        setForm({
            employee_id: employee.employee_id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            designation: employee.designation,
            phone: employee.phone,
            status: employee.status,
        });
        setSelectedEmployee(employee);
        setErrors({});
        setIsModalOpen(true);
    };

    const openViewModal = (employee) => {
        setModalMode("view");
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
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

        if (!form.employee_id.trim()) {
            newErrors.employee_id = "Employee ID is required";
        }

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!form.department) {
            newErrors.department = "Department is required";
        }

        if (!form.designation.trim()) {
            newErrors.designation = "Designation is required";
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setApiError("");

            const employeeData = {
                employee_id: form.employee_id.trim(),
                name: form.name.trim(),
                email: form.email.trim() || null,
                department: form.department.trim(),
                designation: form.designation.trim(),
                phone: form.phone.trim(),
                status: form.status,
            };

            if (modalMode === "edit" && selectedEmployee) {
                const updatedEmployee = await updateEmployee(
                    selectedEmployee.id,
                    employeeData
                );

                setEmployees((previous) =>
                    previous.map((employee) =>
                        employee.id === selectedEmployee.id
                            ? updatedEmployee
                            : employee
                    )
                );
            } else {
                const newEmployee =
                    await createEmployee(employeeData);

                setEmployees((previous) => [
                    ...previous,
                    newEmployee,
                ]);
            }

            closeModal();
        } catch (error) {
            console.error(error);

            setApiError(
                error.message ||
                "Failed to save employee"
            );
        }
    };


    const handleDelete = async (employee) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${employee.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setApiError("");

            await deleteEmployee(employee.id);

            setEmployees((previous) =>
                previous.filter(
                    (item) => item.id !== employee.id
                )
            );
        } catch (error) {
            console.error(error);

            setApiError(
                error.message ||
                "Failed to delete employee"
            );
        }
    };


    return (
        <div className="page">
            {apiError && (
                <div className="api-error">
                    {apiError}
                    <button
                        type="button"
                        onClick={() => setApiError("")}
                    >
                        ×
                    </button>
                </div>
            )}
            <div className="page-header">
                <div>
                    <h2>Employees</h2>
                    <p>
                        Manage employees and their organizational details.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={openAddModal}
                >
                    + Add Employee
                </button>
            </div>

            <div className="employee-toolbar">
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search by name, ID or email..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                <select
                    className="filter-select"
                    value={departmentFilter}
                    onChange={(event) =>
                        setDepartmentFilter(event.target.value)
                    }
                >
                    <option value="All">All Departments</option>

                    {departments.map((department) => (
                        <option
                            key={department}
                            value={department}
                        >
                            {department}
                        </option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <div>
                        <h3>Employee Directory</h3>
                        <span>
                            {filteredEmployees.length} employee
                            {filteredEmployees.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        No employees found.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>
                                            <strong>
                                                {employee.employee_id}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="employee-cell">
                                                <div className="employee-avatar">
                                                    {employee.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {employee.name}
                                                    </strong>

                                                    <span>
                                                        {employee.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{employee.department}</td>

                                        <td>{employee.designation}</td>

                                        <td>{employee.phone || "-"}</td>

                                        <td>
                                            <span
                                                className={`status-badge ${employee.status.toLowerCase()
                                                    }`}
                                            >
                                                {employee.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-button"
                                                    title="View"
                                                    onClick={() =>
                                                        openViewModal(employee)
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="action-button"
                                                    title="Edit"
                                                    onClick={() =>
                                                        openEditModal(employee)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="action-button danger"
                                                    title="Delete"
                                                    onClick={() =>
                                                        handleDelete(employee)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h3>
                                    {modalMode === "add"
                                        ? "Add Employee"
                                        : modalMode === "edit"
                                            ? "Edit Employee"
                                            : "Employee Details"}
                                </h3>

                                <p>
                                    {modalMode === "add"
                                        ? "Enter employee information."
                                        : modalMode === "edit"
                                            ? "Update employee information."
                                            : "View employee information."}
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        {modalMode === "view" ? (
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span>Employee ID</span>
                                    <strong>
                                        {selectedEmployee.employee_id}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Name</span>
                                    <strong>
                                        {selectedEmployee.name}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Email</span>
                                    <strong>
                                        {selectedEmployee.email}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Department</span>
                                    <strong>
                                        {selectedEmployee.department}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Designation</span>
                                    <strong>
                                        {selectedEmployee.designation}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Phone</span>
                                    <strong>
                                        {selectedEmployee.phone || "-"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Status</span>
                                    <strong>
                                        {selectedEmployee.status}
                                    </strong>
                                </div>
                            </div>
                        ) : (
                            <form
                                className="employee-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Employee ID *</label>

                                        <input
                                            name="employee_id"
                                            value={form.employee_id}
                                            onChange={handleChange}
                                            placeholder="e.g. EMP004"
                                        />

                                        {errors.employee_id && (
                                            <small className="error">
                                                {errors.employee_id}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Name *</label>

                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                        />

                                        {errors.name && (
                                            <small className="error">
                                                {errors.name}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Email *</label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="name@company.com"
                                        />

                                        {errors.email && (
                                            <small className="error">
                                                {errors.email}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Department *</label>

                                        <select
                                            name="department"
                                            value={form.department}
                                            onChange={handleChange}
                                        >
                                            <option value="">
                                                Select department
                                            </option>
                                            <option value="IT">IT</option>
                                            <option value="HR">HR</option>
                                            <option value="Finance">
                                                Finance
                                            </option>
                                            <option value="Operations">
                                                Operations
                                            </option>
                                            <option value="Sales">Sales</option>
                                        </select>

                                        {errors.department && (
                                            <small className="error">
                                                {errors.department}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Designation *</label>

                                        <input
                                            name="designation"
                                            value={form.designation}
                                            onChange={handleChange}
                                            placeholder="e.g. Software Engineer"
                                        />

                                        {errors.designation && (
                                            <small className="error">
                                                {errors.designation}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Phone</label>

                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="10 digit phone number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label>

                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Active">
                                                Active
                                            </option>
                                            <option value="Inactive">
                                                Inactive
                                            </option>
                                        </select>
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
                                        {modalMode === "add"
                                            ? "Save Employee"
                                            : "Update Employee"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Employees;