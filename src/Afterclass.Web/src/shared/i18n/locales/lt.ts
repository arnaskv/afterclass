export const lt = {
  app: {
    // The brand name is decided in Milestone 1; "Afterclass" is the internal codename.
    name: "Afterclass",
    loadingSession: "Tikrinama sesija…",
    skipToContent: "Pereiti prie turinio",
  },
  nav: {
    main: "Pagrindinė navigacija",
    dashboard: "Apžvalga",
    profile: "Profilis",
  },
  auth: {
    signInTitle: "Sveiki sugrįžę",
    signInDescription:
      "Prisijunkite, kad tvarkytumėte būrelius, grupes ir tvarkaraščius.",
    signIn: "Prisijungti",
    signingIn: "Nukreipiama…",
    signOut: "Atsijungti",
    accountMenu: "Paskyros meniu",
  },
  dashboard: {
    greeting: "Labas, {{name}}!",
    emptyTitle: "Kol kas tuščia",
    emptyDescription:
      "Čia matysite šiandienos užsiėmimus ir naujas registracijas. Pradėkime nuo profilio.",
    goToProfile: "Tvarkyti profilį",
  },
  profile: {
    title: "Profilis",
    description: "Šis vardas rodomas treneriams ir tėvams.",
    displayName: "Rodomas vardas",
    email: "El. paštas",
    emailDescription: "El. paštas valdomas prisijungimo paslaugoje.",
    save: "Išsaugoti",
    saving: "Saugoma…",
    saved: "Profilis išsaugotas.",
    loading: "Įkeliamas profilis",
    loadError: "Nepavyko įkelti profilio.",
    conflict:
      "Profilį ką tik pakeitė kitas langas ar įrenginys. Įkelkite naujausią versiją ir bandykite dar kartą.",
    reload: "Įkelti iš naujo",
    validation: {
      tooShort: "Vardas turi būti bent {{min}} simbolių.",
      tooLong: "Vardas gali būti ne ilgesnis nei {{max}} simbolių.",
    },
  },
  errors: {
    generic: "Kažkas nepavyko. Bandykite dar kartą.",
    retry: "Bandyti dar kartą",
    notFoundTitle: "Puslapis nerastas",
    notFoundDescription: "Tokio puslapio nėra arba jis buvo perkeltas.",
    backHome: "Grįžti į pradžią",
    forbidden: "Neturite teisės matyti šio turinio.",
  },
};

export type Translations = typeof lt;
