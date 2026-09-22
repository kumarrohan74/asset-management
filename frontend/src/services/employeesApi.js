
const API_BASE_URL = "http://127.0.0.1:8000";

export async function getEmployees() {
  const response = await fetch(
    `${API_BASE_URL}/employees/`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }

  return response.json();
}

export async function createEmployee(employee) {
  const response = await fetch(
    `${API_BASE_URL}/employees/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employee),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create employee"
    );
  }

  return data;
}

export async function getEmployee(id) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employee");
  }

  return response.json();
}

export async function updateEmployee(id, employee) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employee),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update employee"
    );
  }

  return data;
}


export async function deleteEmployee(id) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to delete employee"
    );
  }

  return data;
}
