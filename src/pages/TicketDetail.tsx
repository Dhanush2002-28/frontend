import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ticketsAPI, Ticket } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/layout/Navigation";
import "./TicketDetail.css";

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const ticketData = await ticketsAPI.getById(parseInt(ticketId));
      setTicket(ticketData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch ticket");
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
      month: "long",
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
          <div className="loading">Loading ticket details...</div>
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
          <Link to="/tickets" className="btn btn-secondary">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div>
        <Navigation />
        <div className="main-content">
          <div className="error-message">Ticket not found</div>
          <Link to="/tickets" className="btn btn-secondary">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="main-content">
        <div className="page-header">
          <h1>Ticket Details</h1>
          <div className="header-actions">
            <Link to="/tickets" className="btn btn-secondary">
              Back to Tickets
            </Link>
            {isAdmin && (
              <Link
                to={`/tickets/${ticket.id}/edit`}
                className="btn btn-primary"
              >
                Edit Ticket
              </Link>
            )}
          </div>
        </div>

        <div className="ticket-detail-card">
          <div className="ticket-detail-header">
            <div className="ticket-title-section">
              <h2>{ticket.title}</h2>
              <div className="ticket-badges">
                <span
                  className={`priority-badge ${getPriorityClass(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority.toUpperCase()}
                </span>
                <span
                  className={`status-badge ${getStatusClass(ticket.status)}`}
                >
                  {ticket.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="ticket-detail-content">
            <div className="detail-section">
              <h3>Description</h3>
              <div className="description-content">{ticket.description}</div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <strong>Created by:</strong>
                <span>{ticket.creator_name}</span>
              </div>

              <div className="detail-item">
                <strong>Created on:</strong>
                <span>{formatDate(ticket.created_at)}</span>
              </div>

              {ticket.resolver_name && (
                <div className="detail-item">
                  <strong>Assigned to:</strong>
                  <span>{ticket.resolver_name}</span>
                </div>
              )}

              {ticket.deadline && (
                <div className="detail-item">
                  <strong>Deadline:</strong>
                  <span>{formatDate(ticket.deadline)}</span>
                </div>
              )}

              <div className="detail-item">
                <strong>Last updated:</strong>
                <span>{formatDate(ticket.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
