import axios from "axios";

const BACKEND_URL = axios.create({
  baseURL:"https://note-taking-app-website-backend-newly.onrender.com"
})

export default BACKEND_URL
