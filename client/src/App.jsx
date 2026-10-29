import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import DriverDashboard from './pages/dashboard/DriverDashboard';
import DriversPage from './pages/dashboard/DriversPage';
import RoutesPage from './pages/dashboard/RoutesPage';
import VansPage from './pages/dashboard/VansPage';
import StudentsPage from './pages/dashboard/StudentsPage';

// Wraps a page so only admins can open it
const adminOnly = (page) => <ProtectedRoute allowedRoles={['admin']}>{page}</ProtectedRoute>;

// App: decides which page to show for each address
function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin pages */}
        <Route path="/admin" element={adminOnly(<AdminDashboard />)} />
        <Route path="/admin/students" element={adminOnly(<StudentsPage />)} />
        <Route path="/admin/vans" element={adminOnly(<VansPage />)} />
        <Route path="/admin/drivers" element={adminOnly(<DriversPage />)} />
        <Route path="/admin/routes" element={adminOnly(<RoutesPage />)} />

        {/* Parent and driver pages */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* "*" means any other address */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;