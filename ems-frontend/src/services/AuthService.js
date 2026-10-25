import axios from "axios";

// Always allow cookies for cross-origin credentials
axios.defaults.withCredentials = true;

const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || "http://localhost:8080/api/auth";

// Bank-Grade Security: Access Token is strictly held IN-MEMORY to protect against XSS attacks.
// Long-lived Refresh Token is stored by the browser in an HttpOnly, SameSite=Lax cookie.
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

export const loginApi = (email, password) => {
  return axios.post(`${AUTH_API_BASE_URL}/login`, { email, password });
};

export const verifyOtpApi = async (email, otpCode) => {
  const response = await axios.post(
    `${AUTH_API_BASE_URL}/verify-otp`,
    { email, otpCode },
    { withCredentials: true }
  );

  const { accessToken, name, role } = response.data;
  if (accessToken) {
    setAccessToken(accessToken);
  }
  // Store only non-sensitive profile metadata for UI display (NO token in localStorage)
  localStorage.setItem("paypulse_user", JSON.stringify({ email, name, role }));

  return response;
};

export const resendOtpApi = (email) => {
  return axios.post(`${AUTH_API_BASE_URL}/resend-otp?email=${encodeURIComponent(email)}`);
};

export const registerApi = (name, email, password, role) => {
  return axios.post(`${AUTH_API_BASE_URL}/register`, { name, email, password, role });
};

export const refreshTokenApi = async () => {
  try {
    const response = await axios.post(
      `${AUTH_API_BASE_URL}/refresh-token`,
      {},
      { withCredentials: true }
    );
    const { accessToken, email, name, role } = response.data;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (email && name) {
      localStorage.setItem("paypulse_user", JSON.stringify({ email, name, role }));
    }
    return response.data;
  } catch (err) {
    clearAccessToken();
    localStorage.removeItem("paypulse_user");
    throw err;
  }
};

export const logoutApi = async () => {
  try {
    await axios.post(`${AUTH_API_BASE_URL}/logout`, {}, { withCredentials: true });
  } catch (e) {
    // Ignore network error during logout
  } finally {
    clearAccessToken();
    localStorage.removeItem("paypulse_user");
  }
};

export const getAuthUser = () => {
  const userStr = localStorage.getItem("paypulse_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!inMemoryAccessToken || !!localStorage.getItem("paypulse_user");
};
