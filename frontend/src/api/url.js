import axios from "axios";

const BACKEND_URL = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:4001/api/v1/noteapp",
})

export default BACKEND_URL
