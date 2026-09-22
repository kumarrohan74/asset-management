import { useEffect, useState } from "react";
import {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  } from "../services/assetsApi";

const initialAssets = [
  {
    id: 1,
    asset_id: "AST001",
    asset_name: "MacBook Pro 14",
    asset_type: "Laptop",
    serial_number: "C02ABC123",
    purchase_date: "2026-01-15",
    status: "Assigned",
    remarks: "Development laptop",
  },
  {
    id: 2,
    asset_id: "AST002",
    asset_name: "Dell UltraSharp Monitor",
    asset_type: "Monitor",
    serial_number: "MON456789",
    purchase_date: "2025-11-20",
    status: "Available",
    remarks: "",
  },
  {
    id: 3,
    asset_id: "AST003",
    asset_name: "Dell Latitude 7450",
    asset_type: "Laptop",
    serial_number: "DL789456",
    purchase_date: "2025-08-10",
    status: "Maintenance",
    remarks: "Screen replacement required",
  },
];

const emptyForm = {
  asset_id: "",
  asset_name: "",
  asset_type: "",
  serial_number: "",
  purchase_date: "",
  status: "Available",
  remarks: "",
};

function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setApiError("");
  
      const data = await getAssets();
  
      setAssets(data);
    } catch (error) {
      console.error(error);
  
      setApiError(
        "Unable to load assets. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const assetTypes = [
    ...new Set(
      assets
        .map((asset) => asset.asset_type)
        .filter(Boolean)
    ),
  ];

  const filteredAssets = assets.filter((asset) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      asset.asset_id.toLowerCase().includes(searchText) ||
      asset.asset_name.toLowerCase().includes(searchText) ||
      asset.serial_number
        .toLowerCase()
        .includes(searchText);

    const matchesType =
      typeFilter === "All" ||
      asset.asset_type === typeFilter;

    const matchesStatus =
      statusFilter === "All" ||
      asset.status === statusFilter;

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus
    );
  });

  const openAddModal = () => {
    setModalMode("add");
    setForm(emptyForm);
    setErrors({});
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const openEditModal = (asset) => {
    setModalMode("edit");

    setForm({
      asset_id: asset.asset_id,
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      serial_number: asset.serial_number,
      purchase_date: asset.purchase_date,
      status: asset.status,
      remarks: asset.remarks,
    });

    setSelectedAsset(asset);
    setErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (asset) => {
    setModalMode("view");
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
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

    if (!form.asset_id.trim()) {
      newErrors.asset_id = "Asset ID is required";
    }

    if (!form.asset_name.trim()) {
      newErrors.asset_name = "Asset name is required";
    }

    if (!form.asset_type) {
      newErrors.asset_type = "Asset type is required";
    }

    if (!form.serial_number.trim()) {
      newErrors.serial_number =
        "Serial number is required";
    }

    if (!form.purchase_date) {
      newErrors.purchase_date =
        "Purchase date is required";
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
  
      const assetData = {
        asset_id: form.asset_id.trim(),
        asset_name: form.asset_name.trim(),
        asset_type: form.asset_type,
        serial_number: form.serial_number.trim(),
        purchase_date: form.purchase_date || null,
        status: form.status,
        remarks: form.remarks.trim(),
      };
  
      if (modalMode === "add") {
        const newAsset = await createAsset(assetData);
  
        setAssets((previous) => [
          ...previous,
          newAsset,
        ]);
      }
  
      if (modalMode === "edit") {
        const updatedAsset = await updateAsset(
          selectedAsset.id,
          assetData
        );
  
        setAssets((previous) =>
          previous.map((asset) =>
            asset.id === selectedAsset.id
              ? updatedAsset
              : asset
          )
        );
      }
  
      closeModal();
    } catch (error) {
      console.error(error);
  
      setApiError(
        error.message ||
          "Failed to save asset"
      );
    }
  };

  const handleDelete = async (asset) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${asset.asset_name}?`
    );
  
    if (!confirmed) {
      return;
    }
  
    try {
      setApiError("");
  
      await deleteAsset(asset.id);
  
      setAssets((previous) =>
        previous.filter(
          (item) => item.id !== asset.id
        )
      );
    } catch (error) {
      console.error(error);
  
      setApiError(
        error.message ||
          "Failed to delete asset"
      );
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Assets</h2>
          <p>
            Manage company assets and their current status.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Asset
        </button>
      </div>

      <div className="employee-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by asset ID, name or serial number..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="All">All Types</option>

          {assetTypes.map((type) => (
            <option key={type} value={type}>
              {type}
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
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">
            Maintenance
          </option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Asset Inventory</h3>
            <span>
              {filteredAssets.length} asset
              {filteredAssets.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Purchase Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-state"
                  >
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <strong>{asset.asset_id}</strong>
                    </td>

                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {asset.asset_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {asset.asset_name}
                          </strong>

                          <span>
                            {asset.remarks ||
                              "No remarks"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{asset.asset_type}</td>

                    <td>{asset.serial_number}</td>

                    <td>
                      {asset.purchase_date
                        ? new Date(
                            asset.purchase_date
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={`status-badge asset-status ${getStatusClass(
                          asset.status
                        )}`}
                      >
                        {asset.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          onClick={() =>
                            openViewModal(asset)
                          }
                        >
                          View
                        </button>

                        <button
                          className="action-button"
                          onClick={() =>
                            openEditModal(asset)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="action-button danger"
                          onClick={() =>
                            handleDelete(asset)
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
                    ? "Add Asset"
                    : modalMode === "edit"
                    ? "Edit Asset"
                    : "Asset Details"}
                </h3>

                <p>
                  {modalMode === "add"
                    ? "Enter asset information."
                    : modalMode === "edit"
                    ? "Update asset information."
                    : "View asset information."}
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
                  <span>Asset ID</span>
                  <strong>
                    {selectedAsset.asset_id}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Asset Name</span>
                  <strong>
                    {selectedAsset.asset_name}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Asset Type</span>
                  <strong>
                    {selectedAsset.asset_type}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Serial Number</span>
                  <strong>
                    {selectedAsset.serial_number}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Purchase Date</span>
                  <strong>
                    {selectedAsset.purchase_date
                      ? new Date(
                          selectedAsset.purchase_date
                        ).toLocaleDateString()
                      : "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Status</span>
                  <strong>
                    {selectedAsset.status}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Remarks</span>
                  <strong>
                    {selectedAsset.remarks || "-"}
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
                    <label>Asset ID *</label>

                    <input
                      name="asset_id"
                      value={form.asset_id}
                      onChange={handleChange}
                      placeholder="e.g. AST004"
                    />

                    {errors.asset_id && (
                      <small className="error">
                        {errors.asset_id}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Asset Name *</label>

                    <input
                      name="asset_name"
                      value={form.asset_name}
                      onChange={handleChange}
                      placeholder="e.g. MacBook Pro 14"
                    />

                    {errors.asset_name && (
                      <small className="error">
                        {errors.asset_name}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Asset Type *</label>

                    <select
                      name="asset_type"
                      value={form.asset_type}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select asset type
                      </option>
                      <option value="Laptop">
                        Laptop
                      </option>
                      <option value="Desktop">
                        Desktop
                      </option>
                      <option value="Monitor">
                        Monitor
                      </option>
                      <option value="Keyboard">
                        Keyboard
                      </option>
                      <option value="Mouse">
                        Mouse
                      </option>
                      <option value="Mobile">
                        Mobile
                      </option>
                      <option value="Tablet">
                        Tablet
                      </option>
                      <option value="Headset">
                        Headset
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>

                    {errors.asset_type && (
                      <small className="error">
                        {errors.asset_type}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Serial Number *</label>

                    <input
                      name="serial_number"
                      value={form.serial_number}
                      onChange={handleChange}
                      placeholder="Enter serial number"
                    />

                    {errors.serial_number && (
                      <small className="error">
                        {errors.serial_number}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Purchase Date *</label>

                    <input
                      type="date"
                      name="purchase_date"
                      value={form.purchase_date}
                      onChange={handleChange}
                    />

                    {errors.purchase_date && (
                      <small className="error">
                        {errors.purchase_date}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Available">
                        Available
                      </option>
                      <option value="Assigned">
                        Assigned
                      </option>
                      <option value="Maintenance">
                        Maintenance
                      </option>
                      <option value="Retired">
                        Retired
                      </option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Remarks</label>

                    <textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      placeholder="Enter additional information..."
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
                    {modalMode === "add"
                      ? "Save Asset"
                      : "Update Asset"}
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

export default Assets;