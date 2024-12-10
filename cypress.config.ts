import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Your React frontend URL
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:3001', // Your Express backend URL
    },
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        // Add custom tasks if needed
        log(message) {
          console.log(message);
          return null;
        },
        // Clear test data from MongoDB between tests if needed
        clearTestData() {
          // You can add MongoDB cleanup logic here
          return null;
        },
      });
    },
    // Handle React hydration issues
    experimentalRunAllSpecs: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    // Retry failed tests
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
  // Component testing configuration
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite', // Since you're using Vite
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});
