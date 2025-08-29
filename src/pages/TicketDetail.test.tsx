import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TicketDetail from "./TicketDetail";

// Mock the API
jest.mock("../services/api", () => ({
  ticketsAPI: {
    getById: jest.fn(),
  },
}));

// Mock the AuthContext
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, username: "testuser", role: "employee" },
    isAdmin: false,
  }),
}));

// Mock the Navigation component
jest.mock("../components/layout/Navigation", () => {
  return function Navigation() {
    return <div data-testid="navigation">Navigation</div>;
  };
});

const mockTicket = {
  id: 1,
  title: "Test Ticket",
  description: "This is a test ticket description",
  priority: "high",
  status: "open",
  created_by: 1,
  assigned_to: 2,
  created_at: "2025-08-25T10:00:00Z",
  updated_at: "2025-08-25T10:00:00Z",
  creator_name: "Test User",
  resolver_name: "Test Resolver",
  deadline: "2025-08-30T10:00:00Z",
};

describe("TicketDetail Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    const { ticketsAPI } = require("../services/api");
    ticketsAPI.getById.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter initialEntries={["/tickets/1"]}>
        <TicketDetail />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading ticket details/i)).toBeInTheDocument();
  });

  test("renders ticket details when data is loaded", async () => {
    const { ticketsAPI } = require("../services/api");
    ticketsAPI.getById.mockResolvedValue(mockTicket);

    render(
      <MemoryRouter initialEntries={["/tickets/1"]}>
        <TicketDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Ticket")).toBeInTheDocument();
    });

    expect(
      screen.getByText("This is a test ticket description")
    ).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    expect(screen.getByText("OPEN")).toBeInTheDocument();
  });

  test("renders error state when API call fails", async () => {
    const { ticketsAPI } = require("../services/api");
    ticketsAPI.getById.mockRejectedValue(new Error("API Error"));

    render(
      <MemoryRouter initialEntries={["/tickets/1"]}>
        <TicketDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch ticket/i)).toBeInTheDocument();
    });
  });

  test("displays ticket metadata correctly", async () => {
    const { ticketsAPI } = require("../services/api");
    ticketsAPI.getById.mockResolvedValue(mockTicket);

    render(
      <MemoryRouter initialEntries={["/tickets/1"]}>
        <TicketDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Resolver")).toBeInTheDocument();
  });

  test("renders back to tickets link", async () => {
    const { ticketsAPI } = require("../services/api");
    ticketsAPI.getById.mockResolvedValue(mockTicket);

    render(
      <MemoryRouter initialEntries={["/tickets/1"]}>
        <TicketDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Back to Tickets")).toBeInTheDocument();
    });
  });
});
