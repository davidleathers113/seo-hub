// Import commands.js using ES2015 syntax:
import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
      login(email: string, password: string): void
    }
  }
}

// Hide fetch/XHR requests from command log
const app = window.top;
if (app) {
  app.document.addEventListener('DOMContentLoaded', () => {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    app.document.head.appendChild(style);
  });
}

// Make this file a module by adding an export
export {}
