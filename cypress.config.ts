import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8200',
    specPattern: "**/cypress/integration/*",
    excludeSpecPattern: "**/examples/*",
    viewportWidth: 1920,
    viewportHeight: 1080
  },
});
