import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roles';
import './Navbar.css';

// Navbar: top navigation menu shown on every page
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // "Kamala Perera" -> "Kamala"
  const firstName = user?.fullName?.split(' ')[0];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          🚐 <span className="logo-highlight">School</span>Ride
        </Link>

        {/* Hamburger button - only visible on mobile */}
        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <a href="/#features" onClick={closeMenu}>Features</a>
          <a href="/#how-it-works" onClick={closeMenu}>How It Works</a>

          {user ? (
            // Shown when logged in
            <>
              <NavLink to={getDashboardPath(user.role)} onClick={closeMenu}>Dashboard</NavLink>
              <span className="nav-user">Hi, {firstName}</span>
              <button type="button" className="btn btn-primary nav-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            // Shown when logged out
            <>
              <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
              <Link to="/register" className="btn btn-primary nav-btn" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;