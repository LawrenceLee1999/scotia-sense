import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../ResetPassword";
import { fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import axiosInstance from "../../api/axiosInstance";
vi.mock("../../api/axiosInstance");

test("renders reset password form", () => {
  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );
  expect(
    screen.getByRole("heading", { name: /reset password/i })
  ).toBeInTheDocument();
});

test("shows error if passwords do not match", async () => {
  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/new password/i), {
    target: { value: "StrongerPass123!" },
  });

  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: "Mismatch123!" },
  });

  fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

  expect(
    await screen.findByText(/passwords do not match/i)
  ).toBeInTheDocument();
});

test("shows warning if password is too weak", async () => {
  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/new password/i), {
    target: { value: "123" },
  });

  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: "123" },
  });

  const button = screen.getByRole("button", { name: /reset password/i });
  button.disabled = false;
  fireEvent.click(button);

  expect(await screen.findByText(/password is too weak/i)).toBeInTheDocument();
});

test("shows success message on successful reset", async () => {
  axiosInstance.post.mockResolvedValueOnce({});

  render(
    <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
      <ResetPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/new password/i), {
    target: { value: "StrongPass123!" },
  });

  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: "StrongPass123!" },
  });

  fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

  expect(
    await screen.findByText(/password reset successful/i)
  ).toBeInTheDocument();
});


