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
import PaymentsPage from './pages/dashboard/PaymentsPage';
import ParentPaymentsPage from './pages/dashboard/ParentPaymentsPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import ParentReportsPage from './pages/dashboard/ParentReportsPage';
import DriverReportsPage from './pages/dashboard/DriverReportsPage';

// Helpers so we don't repeat <ProtectedRoute ...> many times
const adminOnly = (page) => <ProtectedRoute allowedRoles={['admin']}>{page}</ProtectedRoute>;
const parentOnly = (page) => <ProtectedRoute allowedRoles={['parent']}>{page}</ProtectedRoute>;
const driverOnly = (page) => <ProtectedRoute allowedRoles={['driver']}>{page}</ProtectedRoute>;

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
        <Route path="/admin/payments" element={adminOnly(<PaymentsPage />)} />
        <Route path="/admin/reports" element={adminOnly(<ReportsPage />)} />

        {/* Parent pages */}
        <Route path="/parent" element={parentOnly(<ParentDashboard />)} />
        <Route path="/parent/payments" element={parentOnly(<ParentPaymentsPage />)} />
        <Route path="/parent/reports" element={parentOnly(<ParentReportsPage />)} />

        {/* Driver pages */}
        <Route path="/driver" element={driverOnly(<DriverDashboard />)} />
        <Route path="/driver/reports" element={driverOnly(<DriverReportsPage />)} />

        {/* "*" means any other address */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;