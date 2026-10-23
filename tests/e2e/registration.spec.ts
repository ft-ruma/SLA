import { expect, test, type Page } from "@playwright/test";

async function checkIdentity(page: Page, nic: string) {
  await page.goto("/en");
  await page.getByTestId("home-athlete").click();
  await page.getByLabel("NIC number").fill(nic);
  await expect(page.getByTestId("nic-decoded")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
}

test("athletes and coaches each have their own registration page", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("home-athlete")).toHaveAttribute("href", "/en/register/athlete");
  await expect(page.getByTestId("home-coach")).toHaveAttribute("href", "/en/coach");
  // there is no page that offers both forms
  await page.goto("/en/register");
  await expect(page).toHaveURL(/\/en\/register\/athlete$/);
  await expect(page.locator('[data-portal="athlete"]')).toBeVisible();
  await expect(page.locator('[data-portal="coach"]')).toHaveCount(0);
  await expect(page.getByText("Coach registration")).toHaveCount(0);
  // the athlete page only points coaches to their own portal
  await expect(page.getByTestId("coach-note")).toHaveAttribute("href", "/en/coach");
  await page.goto("/en/coach");
  await expect(page.getByTestId("home-athlete")).toHaveCount(0);
  await expect(page.locator('main a[href="/en/register/athlete"]')).toHaveCount(0);
  // an athlete session cannot be carried into the coach form
  await page.goto("/en/register/coach/details");
  await expect(page).toHaveURL(/\/en\/register\/coach$/);
});

test("coach registers with a certificate, a photo and the three statements", async ({ page }) => {
  await page.goto("/en");
  await page.getByTestId("home-coach").click();
  await expect(page).toHaveURL(/\/en\/coach$/);
  await page.getByTestId("coach-start").first().click();
  await expect(page.locator('[data-portal="coach"]')).toBeVisible();
  await page.getByLabel("NIC number").fill("198012345678");
  await expect(page.getByTestId("nic-decoded")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Coach details" })).toBeVisible({ timeout: 45_000 });

  await page.getByLabel("Full name", { exact: true }).fill("Chaminda Prasad Silva");
  await page.getByLabel("Name with initials").fill("C. P. Silva");
  await page.getByLabel("District", { exact: true }).selectOption("Galle");
  await page.getByLabel("Mobile number").fill("0723456789");
  await page.getByLabel("Email address").fill("chaminda@example.com");
  await page.getByTestId("photo-input").setInputFiles({
    name: "me.png", mimeType: "image/png",
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]),
  });
  await expect(page.getByText("Photo added")).toBeVisible();
  await page.getByRole("button", { name: "100 metres", exact: true }).click();
  await page.getByRole("button", { name: "Long jump" }).click();

  await page.getByRole("button", { name: "Add a qualification" }).click();
  await page.locator("#q-0-level").selectOption("CECS_L1_YOUTH");
  await page.locator("#q-0-issuer").fill("World Athletics");
  await page.locator("#q-0-year").fill("2019");
  await page.locator("#q-0-file").setInputFiles({
    name: "cecs-level-1.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% e2e\n"),
  });
  await expect(page.getByText("cecs-level-1.pdf")).toBeVisible();

  // there is no step for listing athletes
  await expect(page.getByText("Athletes you coach")).toHaveCount(0);

  for (const label of await page.locator("label", { hasText: "I confirm" }).all()) await label.click();
  await expect(page.getByText(/3 of 3/)).toBeVisible();
  await page.getByLabel("Type your full name to sign").fill("chaminda prasad silva");
  await expect(page.getByText("Signature matches your full name.")).toBeVisible();

  await page.getByRole("button", { name: /Register and get my coach SLA ID/ }).click();
  await expect(page).toHaveURL(/\/en\/register\/coach\/done$/);
  await expect(page.getByTestId("slaa-id")).toHaveText(/^SL\d{2}-\d{6}-\d$/);
  // athlete-only benefits are not shown to coaches
  await expect(page.getByRole("heading", { name: "What your SLA ID gives you" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("a registered person's NIC (other format) lands on 'already registered'", async ({ page }) => {
  await checkIdentity(page, "781231234V"); // seeded coach 197812301234
  await expect(page.getByTestId("already-registered")).toBeVisible();
  await expect(page.getByText("S. P*****")).toBeVisible();
  await expect(page.getByText("Colombo")).toBeVisible();
});

test("athlete registers with a listed coach and a past coach", async ({ page }) => {
  await checkIdentity(page, "201015501234"); // 2010, male, under 18
  await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
  await page.getByLabel("Full name", { exact: true }).fill("Tharindu Lakshan Wijesinghe");
  await page.getByLabel("Name with initials").fill("T. L. Wijesinghe");
  await page.getByLabel("District", { exact: true }).selectOption("Colombo");
  await expect(page.getByTestId("province")).toHaveText("Province: Western");
  await page.getByLabel("Mobile number (athlete or guardian)").fill("0712345678");
  // school, and a club chosen from SLA's verified list
  await page.locator("#academicStatus label", { hasText: "School student" }).click();
  await page.getByLabel("Name of your school").fill("Royal College");
  await page.locator("#representsClub label", { hasText: "Yes" }).click();
  await page.locator("#clubCategory label", { hasText: "A registered club or institution" }).click();
  await page.getByLabel("Your club").selectOption({ label: "Colombo Track Club · Colombo" });
  // one main event and optional additional events, with a personal best
  await page.getByLabel("Event 1").selectOption("400m");
  await page.getByRole("button", { name: /Add personal best/ }).first().click();
  await page.getByLabel("Personal best").first().fill("49.80");
  await page.locator("#pbyear-0").fill("2025");
  await page.locator("#pbcomp-0").fill("Junior Nationals");
  await page.getByRole("button", { name: "Add another event" }).click();
  await page.getByLabel("Event 2").selectOption("200m");
  await page.getByRole("button", { name: "Add another event" }).click();
  await page.getByLabel("Event 3").selectOption("LJ");
  // personal-best fields are folded away until asked for; long jump is measured in metres
  await expect(page.locator("#pb-2")).toHaveCount(0);
  await page.getByTestId("event-row").nth(2).getByRole("button", { name: /Add personal best/ }).click();
  await expect(page.getByText("Metres, e.g. 6.45")).toBeVisible();
  // an additional event
  await page.getByRole("button", { name: "Add another event" }).click();
  await page.getByLabel("Event 4").selectOption("4x400m");

  // under 18, so the guardian section appears
  await expect(page.getByRole("heading", { name: "Parent or guardian" })).toBeVisible();
  await page.getByLabel("Guardian's full name").fill("Lakshman Wijesinghe");
  await page.getByLabel("Relationship to athlete").fill("Father");
  await page.getByLabel("Guardian's mobile number").fill("0779998887");

  // 1. Who coaches you now? The athlete lives in Colombo, so the Colombo coach is suggested
  //    before anything is typed.
  const finder = page.getByRole("combobox", { name: "Coach's name or SLA ID" });
  await finder.first().click();
  await expect(page.getByText("Coaches in Colombo")).toBeVisible();
  await page.getByRole("option", { name: /S\. K\. Perera/ }).click();
  const main = page.getByTestId("coach-card").first();
  await expect(main).toContainText("Main coach");
  await main.getByLabel("Coaching me since").selectOption("2023");

  // 2. Did anyone coach you before? Yes: one registered coach found by search...
  await page.locator("#sec-coaches").getByRole("radio", { name: "Yes" }).click();
  await finder.last().fill("fernando");
  await page.getByRole("option", { name: /D\. C\. Fernando/ }).click();
  const pastCard = page.getByTestId("coach-card").nth(1);
  await pastCard.getByLabel("From year").selectOption("2019");
  await pastCard.getByLabel("To year").selectOption("2022");

  // ...and one who is not registered: typing a name offers "Add as a new coach"
  await page.getByRole("button", { name: "Add another past coach" }).click();
  await finder.last().fill("Mr. Bandara");
  await page.getByRole("option", { name: /Add “Mr\. Bandara” as a new coach/ }).click();
  const newCard = page.locator('[data-testid="coach-card"][data-kind="new"]');
  await expect(newCard).toContainText("New: SLA will contact them");
  await newCard.getByLabel("From year").selectOption("2017");

  for (const box of await page.getByRole("checkbox", { name: /agree/ }).all()) await box.check();
  await page.getByRole("button", { name: /Register and get my SLA ID/ }).click();

  await expect(page.getByTestId("slaa-id")).toHaveText(/^SL\d{2}-\d{6}-\d$/);
  await expect(page.getByText(/coaches you listed must confirm/)).toBeVisible();
  // after registering, the athlete sees why the SLA ID matters
  await expect(page.getByRole("heading", { name: "What your SLA ID gives you" })).toBeVisible();
  for (const title of ["Compete in official championships", "Make your results count", "Open doors to scholarships and support"]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  // no horizontal scroll at phone width
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("an athlete adds the coach role to the same SLA ID", async ({ page }) => {
  await page.goto("/en/register/coach");
  await page.getByLabel("NIC number").fill("199205001234"); // seeded athlete A. M. Herath
  await expect(page.getByTestId("nic-decoded")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  const offer = page.getByTestId("add-coach-role");
  await expect(offer).toBeVisible({ timeout: 45_000 });
  const id = (await offer.getByText(/^SL\d{2}-\d{6}-\d$/).textContent())!;
  await offer.getByRole("button", { name: "Add my coach profile" }).click();

  await expect(page.getByTestId("existing-member")).toContainText(`Verified identity found (${id})`);
  // personal details are not asked again (and not shown)
  await expect(page.getByLabel("Full name", { exact: true })).toHaveCount(0);
  await page.getByLabel("Email address").fill("asanka@example.com");
  await page.getByRole("button", { name: "400 metres", exact: true }).click();
  for (const label of await page.locator("label", { hasText: "I confirm" }).all()) await label.click();
  await page.getByLabel("Type your full name to sign").fill("Asanka Madushan Herath");
  await page.getByRole("button", { name: /Register and get my coach SLA ID/ }).click();

  await expect(page).toHaveURL(/\/en\/register\/coach\/done$/);
  await expect(page.getByRole("heading", { name: "Your coach profile is added" })).toBeVisible();
  await expect(page.getByTestId("slaa-id")).toHaveText(id);

  await page.goto(`/en/verify?id=${id}`);
  await expect(page.getByTestId("role-badge")).toHaveText("[A | C]");
});
