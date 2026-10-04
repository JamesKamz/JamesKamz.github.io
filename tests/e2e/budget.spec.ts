import { expect, test } from "@playwright/test";

test.describe("Budget estimator", () => {
  test("computes a range and sends the lead", async ({ page }) => {
    let payload: Record<string, unknown> | null = null;
    await page.route("**/api/leads", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/budget");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Estimez votre budget");

    // Step 1 is required
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.getByText("Choisissez une option pour continuer.")).toBeVisible();

    await page.getByRole("radio", { name: /SaaS sur mesure/ }).click();
    await page.getByRole("button", { name: "Continuer" }).click();

    await page.getByRole("checkbox", { name: /Paiement en ligne/ }).click();
    await page.getByRole("button", { name: "Continuer" }).click();

    await expect(page.getByRole("radio", { name: /Standard/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Continuer" }).click();

    await page.getByRole("button", { name: "Voir l'estimation" }).click();

    const estimate = page.getByTestId("estimate");
    await expect(estimate).toContainText("EUR");
    await expect(estimate).toContainText("MAD");
    await expect(estimate).toContainText("USD");
    // Default pricing: (4 500 + 500) × 1 × 1 ± 20 %
    await expect(estimate).toContainText(/4\s000\s€/);
    await expect(estimate).toContainText(/6\s000\s€/);

    await page.getByLabel("Nom").fill("Client Test");
    await page.getByLabel("Email").fill("client@example.com");
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();

    await expect(page.getByRole("status")).toContainText("Demande envoyée");
    expect(payload).toMatchObject({
      name: "Client Test",
      email: "client@example.com",
      projectType: "saas",
      features: ["payments"],
      timeline: "standard",
      design: "custom",
      locale: "fr",
    });
  });
});

test("English locale uses localized routes", async ({ page }) => {
  await page.goto("/en/projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Case studies");
  await page.getByRole("button", { name: /^Odoo/ }).click();
  await expect(page.getByText("coming soon")).toBeVisible();
});
