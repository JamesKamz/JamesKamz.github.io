import { expect, test } from "@playwright/test";

test.describe("Contact", () => {
  test("validates the form and sends the message", async ({ page }) => {
    let payload: Record<string, unknown> | null = null;
    // Stub the API so the journey runs without a database or email provider.
    await page.route("**/api/contact", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Parlons de votre projet");

    // Empty submit → client-side validation, no request
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByText("Indiquez votre nom")).toBeVisible();
    await expect(page.getByText("Adresse email invalide.")).toBeVisible();
    expect(payload).toBeNull();

    await page.getByLabel("Nom").fill("Alice Martin");
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Sujet").fill("Automatisation n8n");
    await page.getByLabel("Message").fill("Bonjour, je voudrais automatiser la facturation de mon entreprise.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.getByRole("status")).toContainText("Merci");
    expect(payload).toMatchObject({
      name: "Alice Martin",
      email: "alice@example.com",
      subject: "Automatisation n8n",
      locale: "fr",
      website: "",
    });
  });

  test("shows a rate-limit message", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 429, body: "{}" }));
    await page.goto("/contact");
    await page.getByLabel("Nom").fill("Bob");
    await page.getByLabel("Email").fill("bob@example.com");
    await page.getByLabel("Sujet").fill("Question");
    await page.getByLabel("Message").fill("Une question sur vos services Odoo.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Trop de tentatives" })).toBeVisible();
  });
});
