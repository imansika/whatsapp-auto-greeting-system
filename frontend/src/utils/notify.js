import { toast } from "react-toastify";

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (typeof error?.error === "string") return error.error;
  if (typeof error?.message === "string") return error.message;
  if (typeof error?.response?.data?.error === "string") return error.response.data.error;
  if (typeof error?.response?.data?.message === "string") return error.response.data.message;

  return fallback;
};

const notify = {
  success: (message, options = {}) => toast.success(message, options),
  error: (message, options = {}) => toast.error(message, options),
  warning: (message, options = {}) => toast.warning(message, options),
  info: (message, options = {}) => toast.info(message, options),
};

export default notify;
