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

  const response = await fetch(`${BASE_URL}/${endpoint}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}
