import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, cargando } = useAuth()

  if (cargando) return null

  if (!token) return <Navigate to="/login" replace />

  return children
}
