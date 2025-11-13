import axios from "axios";

const BACKEND_URL = axios.create({
  baseURL: "https://note-taking-app-website-backend-newest.onrender.com"
})

export default BACKEND_URL
