const BASE_URL = "http://localhost:5000/api";

export async function authRequest(endpoint, data = null, method = "POST") {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (method !== "GET" && data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);

    // If token is invalid or expired, force logout
    if (response.status === 401) {
      localStorage.removeItem("token");
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
      return; // Stop execution after logout
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong");
    }

    return result;
  } catch (err) {
    console.error("API request failed:", err);
    throw err; // Ensure the error still bubbles up if needed
  }
}
