import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { authAPI, LoginRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginRequest) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await authAPI.login(values);
      login(response.user, response.token);
      navigate("/tickets");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <Formik
          initialValues={{ username: "", password: "" }}
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

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn btn-primary"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p>
            <strong>Admin:</strong> admin / password123
          </p>
          <p>
            <strong>Employee:</strong> employee1 / password123
          </p>
          <p>
            <strong>Resolver:</strong> resolver1 / password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
