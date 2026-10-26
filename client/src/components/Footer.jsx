import { Link } from 'react-router-dom';
import './Footer.css';

// Footer: shown at the bottom of every page
function Footer() {
  const year = new Date().getFullYear(); // gets the current year automatically

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3 className="footer-logo">
            🚐 <span>School</span>Ride
          </h3>
          <p>
            Making school van transport safer and easier for parents,
            drivers and administrators.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>📍 Galle, Sri Lanka</li>
            <li>📞 +94 XX XXX XXXX</li>
            <li>✉️ info@schoolride.example</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} SchoolRide – School Van Transport Management System</p>
      </div>
    </footer>
  );
}

export default Footer;