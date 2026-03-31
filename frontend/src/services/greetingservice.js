import axios from "axios";

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/api/greetings`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const greetingService = {
  list: async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  },

  create: async (payload) => {
    const response = await axios.post(API_URL, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.put(`${API_URL}/${id}`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updateStatus: async (id, enabled) => {
    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { enabled },
      { headers: getAuthHeaders() },
    );
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default greetingService;