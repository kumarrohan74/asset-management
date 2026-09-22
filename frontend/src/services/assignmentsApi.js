const API_BASE_URL = "http://127.0.0.1:8000";

export async function getAssignments() {
  const response = await fetch(`${API_BASE_URL}/assignments/`);

  if (!response.ok) {
    throw new Error("Failed to fetch assignments");
  }

  return response.json();
}

export async function createAssignment(assignment) {
  const response = await fetch(`${API_BASE_URL}/assignments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignment),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create assignment");
  }

  return data;
}

export async function getAssignment(id) {
  const response = await fetch(`${API_BASE_URL}/assignments/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch assignment");
  }

  return response.json();
}

export async function updateAssignment(id, assignment) {
  const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignment),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update assignment");
  }

  return data;
}

export async function deleteAssignment(id) {
  const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete assignment");
  }

  return data;
}