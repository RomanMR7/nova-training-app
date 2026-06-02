import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  async function loginAs(email = "trader@training.local") {
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), email);
    await user.clear(screen.getByLabelText("Пароль"));
    await user.type(screen.getByLabelText("Пароль"), "Training123!");
    await user.click(screen.getByRole("button", { name: "Войти в тренажер" }));
    return user;
  }

  it("renders the local login screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Anchor Pay" })).toBeInTheDocument();
    expect(screen.getByText(/Нет реальных денег/i)).toBeInTheDocument();
  });

  it("allows admin to switch role training paths", async () => {
    const user = await loginAs("admin@training.local");

    await user.click(screen.getByRole("button", { name: "Сменить роль" }));
    await user.click(screen.getByRole("button", { name: /MERCHANT_MANAGER/i }));

    expect(screen.getByText("Учебные модули роли")).toBeInTheDocument();
    expect(screen.getAllByText("MERCHANT_MANAGER").length).toBeGreaterThan(0);
  });

  it("filters modules by selected role", async () => {
    await loginAs("trader@training.local");

    expect(screen.getAllByText("TRADER: реквизиты, устройство, ордера").length).toBeGreaterThan(0);
    expect(screen.queryByText("MERCHANT: api_key и входящие ордера")).not.toBeInTheDocument();
  });

  it("shows login error for wrong credentials", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText("Пароль"));
    await user.type(screen.getByLabelText("Пароль"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Войти в тренажер" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Неверный email или пароль");
  });
});
