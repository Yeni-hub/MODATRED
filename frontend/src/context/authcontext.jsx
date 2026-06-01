import { createContext, useContext, useState } from 'react'


// Crear el contexto
const AuthContext = createContext()

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario')) || null
  )
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )

  const login = (datos) => {
    // Guardar en localStorage para mantener la sesión
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(datos.usuario))
    setToken(datos.token)
    setUsuario(datos.usuario)
  }

  const logout = () => {
    // Limpiar sesión
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext)
}