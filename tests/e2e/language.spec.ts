import { expect, test, type Page } from "@playwright/test";

// Start as a first-time visitor: no language chosen yet.
test.use({ storageState: { cookies: [], origins: [] } });

const switcher = (page: Page) => page.getByRole("navigation", { name: "Language / භාෂාව / மொழி" }).last();

test("the front page is the language choice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose your language" })).toBeVisible();
  await expect(page.getByText("භාෂාව තෝරන්න")).toBeVisible();
  await expect(page.getByText("மொழியைத் தெரிவு செய்யவும்")).toBeVisible();

  await page.getByRole("link", { name: /සිංහල/ }).click();
  await expect(page).toHaveURL(/\/si$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ඔබේ මලල ක්‍රීඩා ගමන එක් SLA අංකයකින් අරඹන්න");
  await expect(page.locator("html")).toHaveAttribute("lang", "si");

  // the language is part of the address, and the athlete form is its own page
  await page.getByTestId("home-athlete").click();
  await expect(page).toHaveURL(/\/si\/register\/athlete$/);
  await expect(page.getByRole("heading", { name: "ඔබේ හැඳුනුම්පත පරීක්ෂා කරන්න" })).toBeVisible();
  await page.getByLabel("ජාතික හැඳුනුම්පත් අංකය").fill("853202937V");
  await expect(page.getByTestId("nic-decoded")).toContainText("1985 නොවැම්බර් 15");

  // change language from the header: same page, new language
  await switcher(page).getByRole("link", { name: "த" }).click();
  await expect(page).toHaveURL(/\/ta\/register\/athlete$/);
  await expect(page.getByRole("heading", { name: "உங்கள் அடையாள அட்டையைச் சரிபார்க்கவும்" })).toBeVisible();
  await page.getByLabel("தேசிய அடையாள அட்டை இலக்கம்").fill("854002937V");
  await page.getByRole("button", { name: "தொடரவும்" }).click();
  await expect(page.getByText("இந்த அடையாள அட்டை இலக்கம் செல்லுபடியற்றது (பிறந்த நாள் இலக்கங்கள் வரம்புக்கு வெளியே உள்ளன).").first())
    .toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/ta\/register\/athlete$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ta");
});

test("an old deep link (e.g. from a QR code) asks first, then continues there", async ({ page }) => {
  await page.goto("/register/coach");
  await expect(page).toHaveURL(/localhost:\d+\/\?next=%2Fregister%2Fcoach$/);
  await page.getByRole("link", { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en\/register\/coach$/);
  await expect(page.getByText("Coach registration").first()).toBeVisible();
});

test("an old address remembers the language chosen before", async ({ page }) => {
  await page.goto("/ta");
  await page.goto("/home");
  await expect(page).toHaveURL(/\/ta$/);
  await page.goto("/register/check");
  await expect(page).toHaveURL(/\/ta\/register\/athlete$/);
});

test("the language screen will not redirect to another website", async ({ page }) => {
  for (const evil of ["//evil.example.com", "/\\evil.example.com", "https://evil.example.com"]) {
    await page.goto(`/?next=${encodeURIComponent(evil)}`);
    await page.getByRole("link", { name: /English/ }).click();
    await expect(page).toHaveURL(/localhost:\d+\/en$/);
  }
});

test("an unknown language is a 404", async ({ page }) => {
  const res = await page.goto("/fr/register");
  expect(res?.status()).toBe(404);
});

test("returning visitors still see the language choice on the front page", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: "tests/e2e/english.storage.json" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose your language" })).toBeVisible();
  await expect(page.getByRole("link", { name: /English/ })).toHaveAttribute("aria-current", "true");
  // the old address still works
  await page.goto("/language");
  await expect(page).toHaveURL(/localhost:\d+\/$/);
  await ctx.close();
});
