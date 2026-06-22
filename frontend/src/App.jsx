import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import Layout       from './components/layout/Layout'
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"       element={<Login />} />
          <Route path="/dashboard"   element={<Layout><Dashboard /></Layout>} />
          <Route path="/productos"   element={<Layout><Productos /></Layout>} />
          <Route path="/colecciones" element={<Layout><Colecciones /></Layout>} />
          <Route path="/variantes"   element={<Layout><Variantes /></Layout>} />
          <Route path="/categorias"  element={<Layout><Categorias /></Layout>} />
          <Route path="/proveedores" element={<Layout><Proveedores /></Layout>} />
          <Route path="/clientes"    element={<Layout><Clientes /></Layout>} />
          <Route path="/ventas"      element={<Layout><ErrorBoundary><Ventas /></ErrorBoundary></Layout>} />
          <Route path="/compras"     element={<Layout><Compras /></Layout>} />
          <Route path="/reportes"    element={<Layout><Reportes /></Layout>} />
          <Route path="/usuarios"    element={<Layout><Usuarios /></Layout>} />
          <Route path="*"            element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App