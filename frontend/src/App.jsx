import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import Layout       from './components/layout/Layout'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Productos    from './pages/Productos'
import Colecciones  from './pages/Colecciones'
import Variantes    from './pages/Variantes'
import Proveedores  from './pages/Proveedores'
import Clientes     from './pages/Clientes'
import Ventas       from './pages/Ventas'
import Compras      from './pages/Compras'
import Reportes     from './pages/Reportes'
import Usuarios     from './pages/Usuarios'

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
          <Route path="/proveedores" element={<Layout><Proveedores /></Layout>} />
          <Route path="/clientes"    element={<Layout><Clientes /></Layout>} />
          <Route path="/ventas"      element={<Layout><Ventas /></Layout>} />
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