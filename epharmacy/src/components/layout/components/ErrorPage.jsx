import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/ErrorPage.css";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-box">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <button
          className="home-button"
          onClick={() => navigate("/")}
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;