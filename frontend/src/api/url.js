import axios from "axios";

const BACKEND_URL = axios.create({
  baseURL:"https://note-taking-app-website-6-backend.onrender.com/api/v1/noteapp"
})

export default BACKEND_URL
