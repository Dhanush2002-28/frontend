import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";

// Mock the API
jest.mock("../services/api", () => ({
  authAPI: {
    login: jest.fn(),
  },
}));

// Mock the AuthContext
const mockLogin = jest.fn();
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form with all elements", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  test("displays demo credentials", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText("Demo Credentials:")).toBeInTheDocument();
    expect(screen.getByText(/admin.*password123/)).toBeInTheDocument();
    expect(screen.getByText(/employee1.*password123/)).toBeInTheDocument();
    expect(screen.getByText(/resolver1.*password123/)).toBeInTheDocument();
  });

  test("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test("shows validation error for short username", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "ab");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 3 characters/i)
      ).toBeInTheDocument();
    });
  });

  test("successful login navigates to tickets page", async () => {
    const user = userEvent.setup();
    const { authAPI } = require("../services/api");

    authAPI.login.mockResolvedValue({
      user: { id: 1, username: "admin", role: "admin" },
      token: "fake-token",
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        username: "admin",
        password: "password123",
      });
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/tickets");
    });
  });

  test("displays error message on login failure", async () => {
    const user = userEvent.setup();
    const { authAPI } = require("../services/api");

    authAPI.login.mockRejectedValue({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test("disables submit button during login process", async () => {
    const user = userEvent.setup();
    const { authAPI } = require("../services/api");

    // Mock a slow login process
    authAPI.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "admin");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  });
});
