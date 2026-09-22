const API_BASE_URL = "http://127.0.0.1:8000";

export async function getAssets() {
  const response = await fetch(
    `${API_BASE_URL}/assets/`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch assets");
  }

  return response.json();
}

export async function createAsset(asset) {
  const response = await fetch(
    `${API_BASE_URL}/assets/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asset),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create asset"
    );
  }

  return data;
}

export async function getAsset(id) {
  const response = await fetch(
    `${API_BASE_URL}/assets/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch asset");
  }

  return response.json();
}

export async function updateAsset(id, asset) {
  const response = await fetch(
    `${API_BASE_URL}/assets/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asset),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update asset"
    );
  }

  return data;
}

export async function deleteAsset(id) {
  const response = await fetch(
    `${API_BASE_URL}/assets/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to delete asset"
    );
  }

  return data;
}