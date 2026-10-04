import axios from "axios";

const axiosInstanace = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

export default axiosInstanace;
