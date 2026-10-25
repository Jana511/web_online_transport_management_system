import './Footer.css';

// Footer: shown at the bottom of every page
function Footer() {
  const year = new Date().getFullYear(); // gets the current year automatically

  return (
    <footer className="footer">
      <div className="container">
        <p>© {year} SchoolRide – School Van Transport Management System</p>
      </div>
    </footer>
  );
}

export default Footer;