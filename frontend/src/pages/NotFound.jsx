import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>

        <h2>Page not found</h2>

        <p>
          The page you're looking for doesn't exist
          or may have been moved.
        </p>

        <Link to="/" className="primary-button">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;