import { expect, test } from "@playwright/test";

import { mockApi } from "./support/mockApi";

test("visitors without a session are sent to sign-in with their return path", async ({
  page,
}) => {
  await mockApi(page, { signedIn: false });

  await page.goto("/profile");

  await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fprofile/);
  await expect(
    page.getByRole("heading", { name: "Sveiki sugrįžę" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Prisijungti" })).toBeEnabled();
});

test("signed-in users can update their display name", async ({ page }) => {
  const api = await mockApi(page, { signedIn: true });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Labas, Ona Savininkė!" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Tvarkyti profilį" }).click();
  const displayName = page.getByLabel("Rodomas vardas");
  await expect(displayName).toHaveValue("Ona Savininkė");

  await displayName.fill("Ona Trenerė");
  await page.getByRole("button", { name: "Išsaugoti" }).click();

  await expect(
    page.getByRole("status").filter({ hasText: "Profilis išsaugotas." }),
  ).toBeVisible();
  expect(api.savedNames).toEqual(["Ona Trenerė"]);
});

test("unknown pages show a way back", async ({ page }) => {
  await mockApi(page, { signedIn: true });

  await page.goto("/does-not-exist");

  await expect(
    page.getByRole("heading", { name: "Puslapis nerastas" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Grįžti į pradžią" }).click();
  await expect(
    page.getByRole("heading", { name: "Labas, Ona Savininkė!" }),
  ).toBeVisible();
});
