import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roles';

// Shows the page only if the user is logged in AND has an allowed role.
// Usage: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  // Not logged in -> go to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role -> go to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // Allowed -> show the page
  return children;
}

export default ProtectedRoute;