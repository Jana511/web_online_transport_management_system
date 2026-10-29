import { NavLink } from 'react-router-dom';

// Tabs shown at the top of every admin page
const links = [
  { to: '/admin', label: '📊 Overview', end: true },
  { to: '/admin/students', label: '🎒 Students' },
  { to: '/admin/vans', label: '🚐 Vans' },
  { to: '/admin/drivers', label: '🧑‍✈️ Drivers' },
  { to: '/admin/routes', label: '🗺️ Routes' },
  { to: '/admin/payments', label: '💳 Payments' },
  { to: '/admin/reports', label: '🚨 Reports' },
];

function AdminNav() {
  return (
    <nav className="admin-nav">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminNav;