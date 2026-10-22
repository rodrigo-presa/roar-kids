import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './pages/admin/AdminLayout'

// Public pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import MyOrders from './pages/MyOrders'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Profile
import ProfilePage from './pages/ProfilePage'

// Wholesale pages
import WholesaleLanding from './pages/wholesale/WholesaleLanding'
import WholesaleDashboard from './pages/wholesale/WholesaleDashboard'
import MyWholesaleRequests from './pages/wholesale/MyWholesaleRequests'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductEdit from './pages/admin/AdminProductEdit'
import AdminOrders from './pages/admin/AdminOrders'
import AdminWholesale from './pages/admin/AdminWholesale'

export default function App() {
  return (
    <Routes>
      {/* Public layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/productos/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedido-confirmado/:orderId" element={<OrderConfirmation />} />
        <Route path="/mis-pedidos" element={<MyOrders />} />

        {/* Auth */}
        <Route path="/ingresar" element={<Login />} />
        <Route path="/registrarse" element={<Register />} />
        <Route path="/olvide-contrasena" element={<ForgotPassword />} />
        <Route path="/nueva-contrasena" element={<ResetPassword />} />

        {/* Profile */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* Wholesale */}
        <Route path="/mayoristas" element={<WholesaleLanding />} />
        <Route path="/mayoristas/panel" element={<WholesaleDashboard />} />
        <Route path="/mayoristas/solicitudes" element={<MyWholesaleRequests />} />
      </Route>

      {/* Admin layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="productos/nuevo" element={<AdminProductEdit />} />
        <Route path="productos/:id" element={<AdminProductEdit />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="mayoristas" element={<AdminWholesale />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
