import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true
});

export const apiCall = async (requestFn, showError) => {
  try {
    const res = await requestFn();
    return res.data;
  } catch (err) {
    const apiError = {
      statusCode: err.response?.status || 500,
      message:
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Something went wrong"
    };

    showError(apiError);
    throw apiError;
  }
};

export default api;