import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { categoryLabel } from '../utils/reportLabels';

// Tabs for the parent pages + emergency alerts for their children's vans
function ParentNav() {
  const request = useApi();
  const [alerts, setAlerts] = useState([]);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await request('/reports/alerts');
      setAlerts(data.alerts);
    } catch {
      // Alerts are extra information - if loading fails, the page still works
    }
  }, [request]);

  // Load now, then check again every 60 seconds
  useEffect(() => {
    loadAlerts();
    const timer = setInterval(loadAlerts, 60000);
    return () => clearInterval(timer);
  }, [loadAlerts]);

  return (
    <>
      <nav className="admin-nav">
        <NavLink to="/parent" end>🎒 My Children</NavLink>
        <NavLink to="/parent/payments">💳 Payments</NavLink>
        <NavLink to="/parent/reports">💬 Complaints</NavLink>
      </nav>

      {alerts.map((alert) => (
        <div key={alert._id} className="alert alert-error">
          🚨 <strong>Van {alert.van?.vanNumber}: {categoryLabel(alert.category, 'emergency')}</strong> – {alert.description}{' '}
          ({new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
        </div>
      ))}
    </>
  );
}

export default ParentNav;