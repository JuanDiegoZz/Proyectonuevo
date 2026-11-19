import { test, expect } from "@playwright/test";
const nav = [
  "dashboard",
  "mapa",
  "productores",
  "nodess",
  "ordenes",
  "comprobantes",
  "reportes",
  "configuracion",
];
test("pantallas principales sin red externa ni desbordamiento", async ({
  page,
  baseURL,
}) => {
  const localOrigin = new URL(baseURL).origin;
  const issues = [];
  page.on("response", (r) => {
    if (r.status() >= 400) issues.push(r.url() + " " + r.status());
  });
  page.on("pageerror", (e) => issues.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") issues.push(m.text());
  });
  await page.route("**/*", (r) => {
    if (new URL(r.request().url()).origin !== localOrigin) {
      issues.push(r.request().url());
      return r.abort();
    }
    return r.continue();
  });
  for (const [width, height] of [
    [1366, 768],
    [1920, 1080],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (const name of nav) {
      await page.goto("/#/" + name);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width + 1);
      await page.screenshot({
        path: "screenshots/" + width + "-" + name + ".png",
        fullPage: true,
      });
    }
  }
  expect(issues).toEqual([]);
});
test("compra colectiva, persistencia, recepción y reset", async ({ page }) => {
  page.setDefaultTimeout(5000);
  await page.goto("/");
  await expect(page.getByText("85%", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Completar 150 pacas" }).click();
  await page
    .getByRole("button", { name: "José Hernández", exact: true })
    .locator("circle")
    .first()
    .click();
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page.getByRole("button", { name: "Volver a resultados" }).click();
  await page
    .getByRole("button", { name: "María González", exact: true })
    .press("Enter");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page.getByRole("link", { name: "Revisar compra (2)" }).click();
  await page.getByRole("button", { name: "Revisar orden" }).click();
  await page.getByRole("button", { name: "Confirmar orden simulada" }).click();
  await expect(page.getByRole("heading", { name: "OC-016" })).toBeVisible();
  await page.reload();
  for (const [index, progress] of [
    [0, "94%"],
    [1, "100%"],
  ]) {
    await page
      .locator(".supplierlist section")
      .nth(index)
      .getByRole("button", { name: "Simular aceptación" })
      .click();
    await page.goto("/#/nodess/0");
    await expect(page.getByText(progress, { exact: true })).toBeVisible();
    await page.goto("/#/ordenes/OC-016");
  }
  for (const index of [0, 1]) {
    const section = page.locator(".supplierlist section").nth(index);
    await section.getByRole("button", { name: "Simular envío" }).click();
    await section.getByRole("button", { name: "Confirmar recepción" }).click();
    await expect(
      section.getByRole("link", { name: "Ver comprobante" }),
    ).toBeVisible();
    await page.reload();
  }
  await page.goto("/#/nodess/0");
  await expect(page.getByText("15%", { exact: true })).toBeVisible();
  await page.goto("/#/comprobantes");
  await expect(page.locator("tbody tr")).toHaveCount(12);
  await page.getByRole("link", { name: "CR-16-0" }).click();
  await expect(page.getByText(/SIN VALIDEZ FISCAL/)).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("aside")).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await page.goto("/#/reportes");
  await expect(page.getByText("$148,850.00", { exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("control", "preservado"));
  await page.goto("/#/configuracion");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Restablecer demo" }).click();
  await expect(page.getByText("85%", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("control"))).toBe(
    "preservado",
  );
});

test("orden individual, perfil, agrupación y preferencias", async ({
  page,
}) => {
  await page.goto("/#/productores/0");
  await expect(
    page.getByRole("heading", { name: "José Hernández", exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Contactar", exact: true }).click();
  await page
    .getByRole("button", { name: "Registrar contacto simulado" })
    .click();
  await expect(page.getByRole("status")).toContainText("Contacto registrado");
  await page.goto("/#/ordenes/nueva");
  const options = page.getByLabel("Seleccionar oferta").locator("option");
  const option = await options
    .filter({ hasText: "Rafael Méndez · Sorgo forrajero" })
    .getAttribute("value");
  await page.getByLabel("Seleccionar oferta").selectOption(option);
  await page.getByRole("button", { name: "Añadir oferta" }).click();
  await page.getByRole("button", { name: "Revisar orden" }).click();
  await page.getByRole("button", { name: "Confirmar orden simulada" }).click();
  await expect(page.getByText(/Orden individual/)).toBeVisible();
  await page.goto("/#/nodess");
  await page.getByRole("button", { name: "Nueva agrupación" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Red del Valle");
  await page.getByLabel("Meta", { exact: true }).fill("200");
  await page.getByLabel("Fecha objetivo").fill("2026-12-01");
  await page.getByRole("button", { name: "Crear agrupación" }).click();
  await expect(
    page.getByRole("heading", { name: "NODESS Red del Valle" }),
  ).toBeVisible();
  await page.goto("/#/configuracion");
  await page.getByLabel("Empresa", { exact: true }).fill("Compras del Valle");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page.reload();
  await expect(page.getByLabel("Empresa", { exact: true })).toHaveValue(
    "Compras del Valle",
  );
});
