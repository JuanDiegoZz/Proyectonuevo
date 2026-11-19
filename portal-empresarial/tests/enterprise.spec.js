import { expect, test } from "@playwright/test";

test("exploración agrupada, búsqueda y listas paginadas", async ({ page }) => {
  await page.goto("/#/mapa");
  const cluster = page
    .getByRole("button", { name: /Explorar \d+ productores/ })
    .first();
  await expect(cluster).toBeVisible();
  const before = await page.locator(".map-cluster").count();
  await cluster.press("Enter");
  await expect(page.locator(".map-cluster")).toHaveCount(before - 1);
  await page.getByLabel("Buscar municipio").fill("buenaventura");
  await expect(page.locator(".mapresults button")).toHaveCount(2);

  await page.goto("/#/productores");
  await page
    .locator(".market-card")
    .first()
    .getByRole("link", { name: "Comprar" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Selecciona tu suministro" }),
  ).toBeVisible();

  await page.goto("/#/nodess");
  await page.getByLabel("Buscar agrupación").fill("desierto");
  await page
    .locator(".group-list")
    .getByRole("link", { name: /Desierto Productivo/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "NODESS Desierto Productivo" }),
  ).toBeVisible();

  await page.goto("/#/ordenes");
  await expect(page.locator("tbody tr")).toHaveCount(12);
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByLabel("Buscar orden o productor").fill("OC-015");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("OC-015");

  await page.goto("/#/comprobantes");
  await page.getByLabel("Buscar comprobante o productor").fill("CR-1-5");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.goto("/#/reportes");
  await expect(
    page.getByRole("heading", { name: "Ranking municipal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Distribución por producto" }),
  ).toBeVisible();
});
