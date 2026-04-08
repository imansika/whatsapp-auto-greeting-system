import axios from "axios";

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/api/message-logs`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const messageLogService = {
  list: async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  },
};

export default messageLogService;