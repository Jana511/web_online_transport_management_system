import { Link } from 'react-router-dom';

// Shown when the address does not match any page
function NotFoundPage() {
  return (
    <section className="container page not-found">
      <h1>Page not found</h1>
      <p>This page does not exist or is not ready yet.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </section>
  );
}

export default NotFoundPage;