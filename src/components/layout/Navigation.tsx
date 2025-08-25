import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/tickets" className="brand-link">
          Tech Ticketing System
        </Link>
      </div>

      <div className="navbar-menu">
        <div className="navbar-nav">
          <Link to="/tickets" className="nav-link">
            Tickets
          </Link>

          <Link to="/tickets/new" className="nav-link">
            New Ticket
          </Link>

          {isAdmin && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            {user?.username} ({user?.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
