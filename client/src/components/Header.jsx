import './Header.css';

// Header: shown at the top of every page
function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="logo">
          🚐 <span className="logo-highlight">School</span>Ride
        </a>
        <p className="header-tagline">Safe rides to school, every day</p>
      </div>
    </header>
  );
}

export default Header;