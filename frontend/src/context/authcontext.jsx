import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUsuario(res.data.usuario)
        setToken('autenticado')
      })
      .catch(() => {
        setUsuario(null)
        setToken(null)
      })
      .finally(() => setCargando(false))
  }, [])

  const login = (datos) => {
    setToken('autenticado')
    setUsuario(datos.usuario)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch { }
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}