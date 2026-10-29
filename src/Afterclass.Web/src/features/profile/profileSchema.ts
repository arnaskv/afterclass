import { z } from "zod";

// Mirrors UpdateProfileRequest on the API, which stays the authority.
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 80;

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN, { error: "tooShort" })
    .max(DISPLAY_NAME_MAX, { error: "tooLong" }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
