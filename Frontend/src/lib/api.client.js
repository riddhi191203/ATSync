import axios from "axios"

const AUTH_TOKEN_KEY = "resume_ai_token"

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000"

export const getAuthToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const setAuthToken = (token) => {
  if (typeof window === "undefined") return

  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const clearAuthToken = () => setAuthToken(null)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default apiClient