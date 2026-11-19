import { test, expect } from "@playwright/test";

test("guía de exposición, ficha y comprobante impreso", async ({ page }) => {
  for (const [width, height] of [[1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/#/dashboard");
    await expect(page.getByText("150 pacas por comprometer", { exact: true })).toBeVisible();
    await page.getByText("Guía de exposición", { exact: false }).click();
    await expect(page.getByText("90 y 60 pacas", { exact: false })).toBeVisible();
    await page.screenshot({ path: "screenshots/expo-" + width + "-guia.png" });
    await page.getByRole("link", { name: "Opciones para restablecer la demo" }).click();
    await expect(page.getByRole("button", { name: "Restablecer demo" })).toBeVisible();

    await page.goto("/#/mapa?campana=0");
    await page.getByRole("button", { name: "José Hernández", exact: true }).locator("circle").first().click();
    await expect(page.getByText("90 pacas disponibles", { exact: false })).toBeVisible();
    await page.screenshot({ path: "screenshots/expo-" + width + "-ficha.png" });

    await page.goto("/#/comprobantes/1-5");
    await page.emulateMedia({ media: "print" });
    await expect(page.getByText(/SIN VALIDEZ FISCAL/)).toBeVisible();
    await expect(page.locator("aside")).toBeHidden();
    await page.screenshot({ path: "screenshots/expo-" + width + "-comprobante.png" });
    await page.emulateMedia({ media: "screen" });
  }
});
