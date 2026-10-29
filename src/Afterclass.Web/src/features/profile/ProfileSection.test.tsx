import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { describe, expect, it } from "vitest";

import { ANTIFORGERY_TOKEN, testProfile } from "@/mocks/handlers";
import { server } from "@/mocks/server";
import { renderWithClient } from "@/test/render";

import { ProfileSection } from "./ProfileSection";

describe("ProfileSection", () => {
  it("shows a labelled skeleton while loading, then the form", async () => {
    renderWithClient(<ProfileSection />);

    expect(
      screen.getByRole("status", { name: "Įkeliamas profilis" }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("Rodomas vardas")).toHaveValue(
      testProfile.displayName,
    );
  });

  it("saves the display name with the antiforgery token and the version it read", async () => {
    let received: { body: unknown; token: string | null } | undefined;
    server.use(
      http.put("/api/profile", async ({ request }) => {
        received = {
          body: await request.json(),
          token: request.headers.get("X-XSRF-TOKEN"),
        };
        return HttpResponse.json({
          ...testProfile,
          displayName: "Rūta",
          version: 2,
        });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<ProfileSection />);

    const input = await screen.findByLabelText("Rodomas vardas");
    await user.clear(input);
    await user.type(input, "  Rūta  ");
    await user.click(screen.getByRole("button", { name: "Išsaugoti" }));

    expect(await screen.findByText("Profilis išsaugotas.")).toBeInTheDocument();
    expect(received).toEqual({
      body: { displayName: "Rūta", version: 1 },
      token: ANTIFORGERY_TOKEN,
    });
  });

  it("validates on the client before calling the API", async () => {
    let calls = 0;
    server.use(
      http.put("/api/profile", () => {
        calls += 1;
        return HttpResponse.json(testProfile);
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<ProfileSection />);

    const input = await screen.findByLabelText("Rodomas vardas");
    await user.clear(input);
    await user.type(input, "A");
    await user.click(screen.getByRole("button", { name: "Išsaugoti" }));

    expect(
      await screen.findByText("Vardas turi būti bent 2 simbolių."),
    ).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(calls).toBe(0);
  });

  it("marks the submit button busy and blocks double submits while saving", async () => {
    let calls = 0;
    server.use(
      http.put("/api/profile", async () => {
        calls += 1;
        await delay(50);
        return HttpResponse.json({ ...testProfile, version: 2 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<ProfileSection />);

    await screen.findByLabelText("Rodomas vardas");
    await user.click(screen.getByRole("button", { name: "Išsaugoti" }));

    const pendingButton = screen.getByRole("button", { name: "Saugoma…" });
    expect(pendingButton).toHaveAttribute("aria-busy", "true");
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    await screen.findByText("Profilis išsaugotas.");
    expect(calls).toBe(1);
  });

  it("explains a concurrency conflict and offers a reload", async () => {
    server.use(
      http.put("/api/profile", () =>
        HttpResponse.json(
          { status: 409, title: "Conflict" },
          {
            status: 409,
            headers: { "Content-Type": "application/problem+json" },
          },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<ProfileSection />);

    await screen.findByLabelText("Rodomas vardas");
    await user.click(screen.getByRole("button", { name: "Išsaugoti" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Profilį ką tik pakeitė",
    );
    await user.click(screen.getByRole("button", { name: "Įkelti iš naujo" }));
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });

  it("shows server validation messages next to the field", async () => {
    server.use(
      http.put("/api/profile", () =>
        HttpResponse.json(
          {
            status: 400,
            title: "Validation failed",
            errors: { DisplayName: ["Serverio klaida."] },
          },
          {
            status: 400,
            headers: { "Content-Type": "application/problem+json" },
          },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<ProfileSection />);

    await screen.findByLabelText("Rodomas vardas");
    await user.click(screen.getByRole("button", { name: "Išsaugoti" }));

    expect(await screen.findByText("Serverio klaida.")).toBeInTheDocument();
  });

  it("offers a retry when the profile cannot be loaded", async () => {
    server.use(
      http.get("/api/profile", () =>
        HttpResponse.json({ status: 500 }, { status: 500 }),
      ),
    );
    renderWithClient(<ProfileSection />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nepavyko įkelti profilio.",
    );
    expect(
      screen.getByRole("button", { name: "Bandyti dar kartą" }),
    ).toBeInTheDocument();
  });
});
