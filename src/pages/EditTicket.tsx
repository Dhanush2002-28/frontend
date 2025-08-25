import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  ticketsAPI,
  usersAPI,
  Ticket,
  User,
  UpdateTicketRequest,
} from "../services/api";
import Navigation from "../components/layout/Navigation";
import "./TicketForm.css";

const validationSchema = Yup.object({
  priority: Yup.string()
    .oneOf(["low", "medium", "high", "urgent"], "Invalid priority")
    .required("Priority is required"),
  status: Yup.string()
    .oneOf(["open", "in_progress", "resolved", "closed"], "Invalid status")
    .required("Status is required"),
  assigned_to: Yup.number().nullable(),
  deadline: Yup.date().nullable(),
});

const EditTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [resolvers, setResolvers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketData, resolversData] = await Promise.all([
        ticketsAPI.getById(parseInt(id!)),
        usersAPI.getResolvers(),
      ]);
      setTicket(ticketData);
      setResolvers(resolversData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setError("");

      const updateData: UpdateTicketRequest = {
        priority: values.priority,
        status: values.status,
        assigned_to: values.assigned_to
          ? parseInt(values.assigned_to)
          : undefined,
        deadline: values.deadline || undefined,
      };

      await ticketsAPI.update(parseInt(id!), updateData);
      navigate("/tickets");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update ticket");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="main-content">
          <div className="loading">Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div>
        <Navigation />
        <div className="main-content">
          <div className="error-message">{error}</div>
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
        </div>
      </div>
    );
  }

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div>
      <Navigation />
      <div className="main-content">
        <div className="form-container">
          <div className="form-header">
            <h1>Edit Ticket</h1>
            <p>Manage ticket assignment, priority, and status</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Ticket Details (Read-only) */}
          <div className="ticket-details">
            <h3>Ticket Information</h3>
            <div className="detail-row">
              <strong>Title:</strong> {ticket.title}
            </div>
            <div className="detail-row">
              <strong>Description:</strong> {ticket.description}
            </div>
            <div className="detail-row">
              <strong>Created by:</strong> {ticket.creator_name} (
              {ticket.creator_email})
            </div>
            <div className="detail-row">
              <strong>Created:</strong>{" "}
              {new Date(ticket.created_at).toLocaleString()}
            </div>
          </div>

          <Formik
            initialValues={{
              priority: ticket.priority,
              status: ticket.status,
              assigned_to: ticket.assigned_to || "",
              deadline: formatDateForInput(ticket.deadline),
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="ticket-form">
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className="form-control"
                  >
                    <option value="low">Low - Minor issue</option>
                    <option value="medium">
                      Medium - Affects productivity
                    </option>
                    <option value="high">
                      High - Significantly impacts work
                    </option>
                    <option value="urgent">Urgent - Blocking all work</option>
                  </Field>
                  <ErrorMessage
                    name="priority"
                    component="div"
                    className="field-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <Field
                    as="select"
                    id="status"
                    name="status"
                    className="form-control"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="field-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assigned_to">Assign to Resolver</label>
                  <Field
                    as="select"
                    id="assigned_to"
                    name="assigned_to"
                    className="form-control"
                  >
                    <option value="">-- Not Assigned --</option>
                    {resolvers.map((resolver) => (
                      <option key={resolver.id} value={resolver.id}>
                        {resolver.username} ({resolver.email})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="assigned_to"
                    component="div"
                    className="field-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Deadline (Optional)</label>
                  <Field
                    type="datetime-local"
                    id="deadline"
                    name="deadline"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="deadline"
                    component="div"
                    className="field-error"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate("/tickets")}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? "Updating..." : "Update Ticket"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditTicket;
