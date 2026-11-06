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
    // One quote currency picked from the visitor's location, switchable between USD / MAD / FCFA; never EUR.
    await expect(estimate).not.toContainText("EUR");
    for (const c of ["USD", "MAD", "FCFA"]) await expect(estimate.getByRole("button", { name: c })).toBeVisible();
    // Default pricing: (4 500 + 500) € × 1 × 1 ± 20 % = 4 000 – 6 000 €, shown in USD (× 1.08, rounded)
    await estimate.getByRole("button", { name: "USD" }).click();
    await expect(estimate.getByRole("button", { name: "USD" })).toHaveAttribute("aria-pressed", "true");
    await expect(estimate).toContainText(/4\s300/);
    await expect(estimate).toContainText(/6\s500/);

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
  // The filter keeps only the projects of that category (its button shows the count).
  const odoo = page.getByRole("button", { name: /^Odoo \d+$/ });
  const count = Number((await odoo.innerText()).match(/\d+/)?.[0]);
  expect(count).toBeGreaterThan(0);
  await odoo.click();
  await expect(odoo).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("main article")).toHaveCount(count);
});
