import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
  return match ? match[1] : ''
}

api.interceptors.request.use(config => {
  if (!['get', 'head', 'options'].includes(config.method || '')) {
    const token = getCsrfToken()
    if (token) config.headers['X-CSRF-Token'] = token
  }
  return config
})

export default api
