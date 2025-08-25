import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketsAPI, Ticket } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/layout/Navigation";
import "./TicketList.css";

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await ticketsAPI.getAll();
      setTickets(ticketsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority: string) => {
    const classes = {
      urgent: "priority-urgent",
      high: "priority-high",
      medium: "priority-medium",
      low: "priority-low",
    };
    return classes[priority as keyof typeof classes] || "priority-medium";
  };

  const getStatusClass = (status: string) => {
    const classes = {
      open: "status-open",
      in_progress: "status-in-progress",
      resolved: "status-resolved",
      closed: "status-closed",
    };
    return classes[status as keyof typeof classes] || "status-open";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="main-content">
          <div className="loading">Loading tickets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="main-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="main-content">
        <div className="page-header">
          <h1>{isAdmin ? "All Tickets" : "My Tickets"}</h1>
          <Link to="/tickets/new" className="btn btn-primary">
            Create New Ticket
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <h3>No tickets found</h3>
            <p>
              {isAdmin
                ? "No tickets have been created yet."
                : "You haven't created any tickets yet."}
            </p>
            <Link to="/tickets/new" className="btn btn-primary">
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <h3 className="ticket-title">
                    <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                  </h3>
                  <div className="ticket-badges">
                    <span
                      className={`priority-badge ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span
                      className={`status-badge ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="ticket-description">
                  {ticket.description.length > 150
                    ? `${ticket.description.substring(0, 150)}...`
                    : ticket.description}
                </div>

                <div className="ticket-meta">
                  <div className="meta-item">
                    <strong>Created by:</strong> {ticket.creator_name}
                  </div>
                  {ticket.resolver_name && (
                    <div className="meta-item">
                      <strong>Assigned to:</strong> {ticket.resolver_name}
                    </div>
                  )}
                  <div className="meta-item">
                    <strong>Created:</strong> {formatDate(ticket.created_at)}
                  </div>
                  {ticket.deadline && (
                    <div className="meta-item">
                      <strong>Deadline:</strong> {formatDate(ticket.deadline)}
                    </div>
                  )}
                </div>

                <div className="ticket-actions">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </Link>
                  {isAdmin && (
                    <Link
                      to={`/tickets/${ticket.id}/edit`}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
