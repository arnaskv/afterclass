import type { Translations } from "./lt";

export const en: Translations = {
  app: {
    name: "Afterclass",
    loadingSession: "Checking your session…",
    skipToContent: "Skip to content",
  },
  nav: {
    main: "Main navigation",
    dashboard: "Overview",
    profile: "Profile",
  },
  auth: {
    signInTitle: "Welcome back",
    signInDescription: "Sign in to manage your clubs, groups and schedules.",
    signIn: "Sign in",
    signingIn: "Redirecting…",
    signOut: "Sign out",
    accountMenu: "Account menu",
  },
  dashboard: {
    greeting: "Hi, {{name}}!",
    emptyTitle: "Nothing here yet",
    emptyDescription:
      "Today's sessions and new enrollments will show up here. Let's start with your profile.",
    goToProfile: "Edit profile",
  },
  profile: {
    title: "Profile",
    description: "Coaches and parents see this name.",
    displayName: "Display name",
    email: "Email",
    emailDescription: "Your email is managed by the sign-in service.",
    save: "Save",
    saving: "Saving…",
    saved: "Profile saved.",
    loading: "Loading profile",
    loadError: "We couldn't load your profile.",
    conflict:
      "Your profile was just changed in another window or device. Reload the latest version and try again.",
    reload: "Reload",
    validation: {
      tooShort: "Name must be at least {{min}} characters.",
      tooLong: "Name can be at most {{max}} characters.",
    },
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    retry: "Try again",
    notFoundTitle: "Page not found",
    notFoundDescription: "This page doesn't exist or has moved.",
    backHome: "Back to start",
    forbidden: "You don't have access to this content.",
  },
};
