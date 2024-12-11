import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },

  e2e: {
    baseUrl: "http://localhost:5174",
    env: {
      apiUrl: "http://localhost:3001",
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
