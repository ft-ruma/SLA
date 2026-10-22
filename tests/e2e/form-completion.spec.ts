import { expect, test } from "@playwright/test";

async function startForm(page: import("@playwright/test").Page, nic: string) {
  await page.goto("/en/register/athlete");
  await page.getByLabel("NIC number").fill(nic);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible({ timeout: 45_000 });
}

test("progress bar, section status and jump to the first missing part", async ({ page }) => {
  await startForm(page, "199214501234"); // adult, so no guardian section
  const progress = page.getByRole("progressbar", { name: "Your progress" });
  // date of birth and gender come from the NIC: 2 of the 12 required answers
  await expect(progress).toHaveAttribute("aria-valuenow", "17");

  // pressing Register too early names the sections and jumps to the first one
  await page.getByRole("button", { name: /Register and get my SLA ID/ }).click();
  await expect(page.getByText(/Almost there\. Please check: About you, School and club, Events, Coaches, Consent/)).toBeVisible();
  await expect(page.getByLabel("Full name", { exact: true })).toBeFocused();

  // filling a section turns its label to "Done"
  await page.getByLabel("Full name", { exact: true }).fill("Kasun Rajitha");
  await page.getByLabel("Name with initials").fill("K. Rajitha");
  await page.getByLabel("District", { exact: true }).selectOption("Galle");
  await page.getByLabel("Mobile number (athlete or guardian)").fill("0771239876");
  await expect(page.locator("#sec-about")).toContainText("✓ Done");
  await page.locator("#academicStatus label", { hasText: "School student" }).click();
  await page.getByLabel("Name of your school").fill("Richmond College");
  await page.locator("#representsClub label", { hasText: "No" }).click();
  await expect(page.locator("#sec-affiliation")).toContainText("✓ Done");
  await expect(page.getByText("Please answer both questions about your coaches.")).toBeVisible();

  // the line above the button lists what is left; tapping it jumps there
  await page.getByRole("button", { name: "Events", exact: true }).last().click();
  await expect(page.locator("#event-0")).toBeFocused();
});

test("answers survive a language change and can be cleared with Start over", async ({ page }) => {
  await startForm(page, "199314601234");
  await page.getByLabel("Full name", { exact: true }).fill("Nimesha Perera");
  await page.getByLabel("Event 1").selectOption("800m");
  await page.getByRole("combobox", { name: "Coach's name or SLA ID" }).first().fill("New Coach Name");
  await page.getByRole("option", { name: /Add “New Coach Name” as a new coach/ }).click();
  await page.waitForTimeout(600); // saved after a short pause in typing

  // switch to Sinhala from the header: the same form, in Sinhala
  await page.getByRole("navigation", { name: "Language / භාෂාව / மொழி" }).last().getByRole("link", { name: "සිං" }).click();
  await expect(page).toHaveURL(/\/si\/register\/athlete\/details$/);
  await expect(page.getByText("ආපසු සාදරයෙන් පිළිගනිමු")).toBeVisible();
  await expect(page.getByLabel("සම්පූර්ණ නම", { exact: true })).toHaveValue("Nimesha Perera");
  await expect(page.locator("#event-0")).toHaveValue("800m");
  await expect(page.locator('[data-testid="coach-card"][data-kind="new"]')).toContainText("New Coach Name");

  await page.getByRole("button", { name: "නැවත අරඹන්න" }).click();
  await expect(page.getByLabel("සම්පූර්ණ නම", { exact: true })).toHaveValue("");
  await expect(page.locator('[data-testid="coach-card"]')).toHaveCount(0);
});
