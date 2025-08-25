import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { authAPI, RegisterRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Must be a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  role: Yup.string()
    .oneOf(["employee", "admin", "resolver"], "Invalid role")
    .required("Role is required"),
});

const Register: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (
    values: RegisterRequest & { confirmPassword: string }
  ) => {
    try {
      setIsLoading(true);
      setError("");

      const { confirmPassword, ...registerData } = values;
      const response = await authAPI.register(registerData);
      login(response.user, response.token);
      navigate("/tickets");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>

        {error && <div className="error-message">{error}</div>}

        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "employee",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="Enter your username"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="field-error"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="field-error"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="field-error"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your password"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="field-error"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <Field
                  as="select"
                  id="role"
                  name="role"
                  className="form-control"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="resolver">Resolver</option>
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="field-error"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn btn-primary"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
