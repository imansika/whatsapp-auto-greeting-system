import axios from "axios";

const API_URL = "http://localhost:3000/api/message-logs";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const messageLogService = {
  list: async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  },
};

export default messageLogService;