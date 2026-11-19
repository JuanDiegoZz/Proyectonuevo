import { expect, test } from "@playwright/test";

test("filtros, ficha y compra dan retroalimentación sin depender del movimiento", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/dashboard");
  await expect(
    page.getByRole("progressbar", { name: "Comprometidas" }),
  ).toHaveAttribute("aria-valuenow", "850");
  expect(
    await page
      .locator(".live-progress i")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.getByRole("link", { name: "Completar 150 pacas" }).click();
  await page.getByRole("button", { name: "Acercar", exact: true }).click();
  await page.getByRole("button", { name: "Alejar", exact: true }).click();
  await page
    .getByRole("button", { name: "José Hernández", exact: true })
    .press("Enter");
  await expect(
    page.getByRole("button", { name: "José Hernández", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText(/Cosecha demo.*Capacidad 240 pacas/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Producto agregado");
  await page.getByRole("button", { name: "Cerrar aviso" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("button", { name: "Limpiar", exact: true }).click();
  await expect(page.locator(".mapresults button")).toHaveCount(24);
  await page.goto("/#/productores/1");
  await expect(page.getByText(/6 hectáreas productivas/)).toBeVisible();
  await page.goto("/#/ordenes/OC-015");
  await expect(page.getByText(/Entrega prevista/)).toBeVisible();
  await page.goto("/#/reportes");
  const chart = page.getByRole("group", {
    name: "Valor mensual de compras en MXN",
  });
  await chart.locator(".charttrack").first().focus();
  await expect(chart.locator(".chart-tooltip").first()).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "reporte-regional.csv",
  );
});
