import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ticketsAPI, CreateTicketRequest } from "../services/api";
import Navigation from "../components/layout/Navigation";
import "./TicketForm.css";

const validationSchema = Yup.object({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must not exceed 255 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  priority: Yup.string()
    .oneOf(["low", "medium", "high", "urgent"], "Invalid priority")
    .required("Priority is required"),
});

const CreateTicket: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: CreateTicketRequest) => {
    try {
      setIsLoading(true);
      setError("");

      await ticketsAPI.create(values);
      navigate("/tickets");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="main-content">
        <div className="form-container">
          <div className="form-header">
            <h1>Create New Ticket</h1>
            <p>
              Please provide detailed information about your technical issue
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <Formik
            initialValues={{
              title: "",
              description: "",
              priority: "medium",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="ticket-form">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <Field
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="Brief description of the issue"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="field-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={6}
                    className="form-control"
                    placeholder="Detailed description of the issue, including steps to reproduce, error messages, and expected behavior"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="field-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className="form-control"
                  >
                    <option value="low">
                      Low - Minor issue, can work around
                    </option>
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
                    disabled={isSubmitting || isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? "Creating..." : "Create Ticket"}
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

export default CreateTicket;
