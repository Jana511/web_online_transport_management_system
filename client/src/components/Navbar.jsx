import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

// Navbar: top navigation menu shown on every page
function Navbar() {
  // menuOpen remembers whether the mobile menu is open (true) or closed (false)
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
          <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
          <Link to="/register" className="btn btn-primary nav-btn" onClick={closeMenu}>
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;