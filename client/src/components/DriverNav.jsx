import { NavLink } from 'react-router-dom';

// Tabs for the driver pages
function DriverNav() {
  return (
    <nav className="admin-nav">
      <NavLink to="/driver" end>🚐 Today's Trip</NavLink>
      <NavLink to="/driver/reports">🚨 Report a Problem</NavLink>
    </nav>
  );
}

export default DriverNav;