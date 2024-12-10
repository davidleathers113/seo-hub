// Import commands.js using ES2015 syntax:
import './commands';

// Configure global behavior
beforeEach(() => {
  // Preserve cookie and localStorage between tests
  Cypress.Cookies.preserveOnce('session_id');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  return false;
});
