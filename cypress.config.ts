import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8200/",
    specPattern: "**/cypress/integration/*",
    excludeSpecPattern: "**/examples/*",
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(_, config) {
      config.env = process.env;
      return config;
    },
  },
});

/* 
to override env values in pipeline use
npx cypress open --env AUTH_TENANT_ID=...
*/
