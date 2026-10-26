import './HomePage.css';

// ----- Data for the page -----
// We keep the text in arrays, then use .map() to create the cards.
// This avoids repeating the same HTML many times.

const features = [
  { icon: '✅', title: 'Safe Pickup Verification', text: 'Drivers confirm every pickup, school arrival and drop-off, so parents always know where their child is.' },
  { icon: '🚐', title: 'Van Capacity Management', text: 'The system prevents assigning more students than a van has seats.' },
  { icon: '⏰', title: 'Delay Notifications', text: 'Drivers report delays and the affected parents are notified straight away.' },
  { icon: '🗺️', title: 'Smart Route Planning', text: 'Manage pickup points and the order of stops on every route.' },
  { icon: '🚨', title: 'Emergency Reporting', text: 'Report vehicle breakdowns, driver absences and other problems quickly.' },
  { icon: '💳', title: 'Monthly Payment Tracking', text: 'View monthly fees, paid and pending payments, and full payment history.' },
];

const steps = [
  { number: 1, title: 'Register', text: "Parents create an account and add their child's details and pickup location." },
  { number: 2, title: 'Get Assigned', text: 'The administrator assigns a suitable van, driver and route.' },
  { number: 3, title: 'Track the Journey', text: 'The driver updates each pickup and drop-off, and parents see the status online.' },
];

const roles = [
  { icon: '🧑‍💼', title: 'Administrators', items: ['Manage vans, drivers and routes', 'Assign students to vans', 'Track payments and reports'] },
  { icon: '👨‍👩‍👧', title: 'Parents', items: ["Add children's details", 'Check pickup and drop-off status', 'View fees and payment history'] },
  { icon: '🛣️', title: 'Drivers', items: ['View the daily pickup list', 'Update student journey status', 'Report delays and emergencies'] },
];

function HomePage() {
  return (
    <>
      {/* ===== Hero section ===== */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-badge">School Van Transport Management</span>
            <h1>
              Safe, simple and reliable <span>school rides</span>
            </h1>
            <p>
              SchoolRide connects parents, drivers and administrators on one
              platform. Know when your child is picked up, when they reach
              school and when they arrive home.
            </p>
            <div className="hero-buttons">
              <a href="#features" className="btn btn-primary">Explore Features</a>
              <a href="#how-it-works" className="btn btn-outline">How It Works</a>
            </div>
          </div>

          {/* Example card showing a child's journey status */}
          <div className="hero-card">
            <h3>Today's Journey</h3>
            <p className="hero-card-student">Student: Nimal Perera · Van SR-01</p>
            <ul className="journey-list">
              <li className="journey-step done">
                <span className="dot"></span>
                <div>
                  <strong>Picked up from home</strong>
                  <small>6:45 AM</small>
                </div>
              </li>
              <li className="journey-step done">
                <span className="dot"></span>
                <div>
                  <strong>Arrived at school</strong>
                  <small>7:20 AM</small>
                </div>
              </li>
              <li className="journey-step pending">
                <span className="dot"></span>
                <div>
                  <strong>Dropped off at home</strong>
                  <small>Expected 1:45 PM</small>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Features section ===== */}
      <section id="features" className="section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Everything needed to manage school van transport safely
          </p>
          <div className="features-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works section ===== */}
      <section id="how-it-works" className="section section-light">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.number}>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== User roles section ===== */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Built for Everyone</h2>
          <p className="section-subtitle">One platform, three types of users</p>
          <div className="roles-grid">
            {roles.map((role) => (
              <div className="role-card" key={role.title}>
                <div className="role-icon">{role.icon}</div>
                <h3>{role.title}</h3>
                <ul>
                  {role.items.map((item) => (
                    <li key={item}>✔ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;