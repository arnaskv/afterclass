import { defineConfig } from "orval";

// Reads the reviewed snapshot, never a running server, so generated code only changes with the contract.
export default defineConfig({
  afterclass: {
    input: { target: "../../openapi/afterclass-api.json" },
    output: {
      mode: "tags-split",
      target: "src/shared/api/generated/endpoints",
      schemas: "src/shared/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "src/shared/api/client/fetcher.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
