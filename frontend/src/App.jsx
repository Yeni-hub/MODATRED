import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import Layout       from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Productos    from './pages/Productos'
import Colecciones  from './pages/Colecciones'
import Variantes    from './pages/Variantes'
import Categorias   from './pages/Categorias'
import Proveedores  from './pages/Proveedores'
import Clientes     from './pages/Clientes'
import Ventas       from './pages/Ventas'
import Compras      from './pages/Compras'
import Reportes     from './pages/Reportes'
import Usuarios     from './pages/Usuarios'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.error) {
      const stack = this.state.error?.stack || '';
      return (
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h2 style={{ color: '#b91c1c' }}>Error en el módulo</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fef2f2', padding: 16, borderRadius: 8, border: '1px solid #fecaca' }}>
            {this.state.error?.message || 'Error desconocido'}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 8, border: '1px solid #ddd', marginTop: 12, fontSize: 12 }}>
            {stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <h1 style={{ fontSize: 72, color: '#F78DA7', margin: 0 }}>404</h1>
      <p style={{ fontSize: 18, color: '#4B5563' }}>Página no encontrada</p>
      <a href="/login" style={{ color: '#F78DA7', textDecoration: 'underline' }}>Volver al inicio</a>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"       element={<Login />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/productos"   element={<ProtectedRoute><Layout><Productos /></Layout></ProtectedRoute>} />
          <Route path="/colecciones" element={<ProtectedRoute><Layout><Colecciones /></Layout></ProtectedRoute>} />
          <Route path="/variantes"   element={<ProtectedRoute><Layout><Variantes /></Layout></ProtectedRoute>} />
          <Route path="/categorias"  element={<ProtectedRoute><Layout><Categorias /></Layout></ProtectedRoute>} />
          <Route path="/proveedores" element={<ProtectedRoute><Layout><Proveedores /></Layout></ProtectedRoute>} />
          <Route path="/clientes"    element={<ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>} />
          <Route path="/ventas"      element={<ProtectedRoute><Layout><ErrorBoundary><Ventas /></ErrorBoundary></Layout></ProtectedRoute>} />
          <Route path="/compras"     element={<ProtectedRoute><Layout><Compras /></Layout></ProtectedRoute>} />
          <Route path="/reportes"    element={<ProtectedRoute><Layout><Reportes /></Layout></ProtectedRoute>} />
          <Route path="/usuarios"    element={<ProtectedRoute><Layout><Usuarios /></Layout></ProtectedRoute>} />
          <Route path="/"            element={<Navigate to="/dashboard" />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
