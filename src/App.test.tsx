import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Mock the AuthContext
jest.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    isAdmin: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe("App Component", () => {
  test("renders login page when not authenticated", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });
  });

  test("renders with professional styling", () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const appElement = container.querySelector(".App");
    expect(appElement).toBeInTheDocument();
  });
});
