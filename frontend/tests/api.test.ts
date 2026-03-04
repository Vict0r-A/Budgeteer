import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  changePassword,
  clearAuth,
  deleteMyAccount,
  login,
  register,
  setAuth,
} from "../src/api";

describe("api auth client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAuth();
  });

  it("stores token and user after register", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            token: "token-1",
            user: { id: 7, email: "sam@example.com", displayName: "Sam" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const result = await register({
      email: "sam@example.com",
      password: "password123",
      displayName: "Sam",
    });

    expect(result.token).toBe("token-1");
    expect(localStorage.getItem("budgeteer_token")).toBe("token-1");
    expect(localStorage.getItem("budgeteer_user")).toContain("sam@example.com");
  });

  it("updates stored token after password change", async () => {
    setAuth("old-token", { id: 9, email: "lee@example.com", displayName: "Lee" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: "new-token",
          user: { id: 9, email: "lee@example.com", displayName: "Lee" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await changePassword({ currentPassword: "oldPass123", newPassword: "newPass123" });

    expect(localStorage.getItem("budgeteer_token")).toBe("new-token");
    const req = fetchMock.mock.calls[0][1] as RequestInit;
    expect(req.headers).toMatchObject({ Authorization: "Bearer old-token" });
  });

  it("clears auth after account deletion", async () => {
    setAuth("delete-token", { id: 11, email: "del@example.com", displayName: "Del" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "deleted" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await deleteMyAccount({ password: "password123" });

    expect(localStorage.getItem("budgeteer_token")).toBeNull();
    expect(localStorage.getItem("budgeteer_user")).toBeNull();
  });

  it("surfaces backend validation message for login failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Invalid email or password" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(
      login({
        email: "bad@example.com",
        password: "wrong",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("stores auth after successful password reset", async () => {
    clearAuth();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            token: "reset-token-1",
            user: { id: 5, email: "reset@example.com", displayName: "Reset User" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const { resetPassword } = await import("../src/api");
    await resetPassword({ token: "token-from-email", newPassword: "newPassword123" });

    expect(localStorage.getItem("budgeteer_token")).toBe("reset-token-1");
    expect(localStorage.getItem("budgeteer_user")).toContain("reset@example.com");
  });
});
