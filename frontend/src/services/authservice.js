import axios from 'axios';

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'
).replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/auth`;

const readStorageValue = (key) =>
  sessionStorage.getItem(key) || localStorage.getItem(key);

const setAuthState = (token, user) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));

  // Keep auth isolated per browser tab. Legacy values are cleaned up.
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const clearAuthState = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const parseJwtPayload = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
};

const isTokenStillValid = (token) => {
  if (!token) return false;

  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds;
};

// Create axios instance with token in headers
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = readStorageValue('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service functions
const authService = {
  // Register user
  register: async (username, email, phone, password) => {
    try {
      const response = await apiClient.post('/register', {
        username,
        email,
        phone,
        password,
      });
      // Store token in sessionStorage to avoid cross-tab user collisions
      if (response.data.token) {
        setAuthState(response.data.token, response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/login', {
        email,
        password,
      });
      // Store token in sessionStorage to avoid cross-tab user collisions
      if (response.data.token) {
        setAuthState(response.data.token, response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request password reset token
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/forgot-password/request', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reset password with token
  resetPasswordWithToken: async (token, newPassword) => {
    try {
      const response = await apiClient.post('/forgot-password/reset', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: () => {
    clearAuthState();
  },

  // Get current user
  getCurrentUser: () => {
    const user = readStorageValue('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = readStorageValue('token');
    const valid = isTokenStillValid(token);

    if (!valid) {
      clearAuthState();
    }

    return valid;
  },
};

export default authService;
