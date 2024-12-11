/// <reference types="cypress" />
import { AuthResponse, NicheResponse, PillarResponse, SubpillarResponse } from './api-types';

// Login command with retry strategy
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.intercept('POST', '**/auth/login').as('login');

  return cy.wrap(
    new Promise<AuthResponse>((resolve, reject) => {
      const attempt = (retries = 3) => {
        cy.get('[data-testid=login-button]')
          .should('be.visible')
          .click()
          .then(() => {
            cy.get('[data-testid=email-input]')
              .should('be.visible')
              .clear()
              .type(email);

            cy.get('[data-testid=password-input]')
              .should('be.visible')
              .clear()
              .type(password);

            cy.get('[data-testid=submit-login]')
              .should('be.enabled')
              .click();

            cy.wait('@login', { timeout: 10000 })
              .then((interception) => {
                if (!interception.response || interception.response.statusCode !== 200) {
                  if (retries > 0) {
                    cy.log(`Login failed, retrying... (${retries} attempts left)`);
                    attempt(retries - 1);
                  } else {
                    reject(new Error(`Login failed: ${JSON.stringify(interception.response)}`));
                  }
                } else {
                  resolve(interception.response.body as AuthResponse);
                }
              });
          });
      };

      attempt();
    })
  );
});

// Create niche command with validation
Cypress.Commands.add('createNiche', (name: string) => {
  cy.intercept('POST', '**/niches').as('createNiche');

  return cy.wrap(
    new Promise<NicheResponse>((resolve, reject) => {
      cy.get('#nicheName')
        .should('be.visible')
        .clear()
        .type(name);

      cy.contains('button', 'Create Niche')
        .should('be.enabled')
        .click();

      cy.wait('@createNiche', { timeout: 10000 })
        .then((interception) => {
          if (!interception.response || interception.response.statusCode !== 201) {
            reject(new Error(`Niche creation failed: ${JSON.stringify(interception.response)}`));
          } else {
            resolve(interception.response.body as NicheResponse);
          }
        });
    })
  );
});

// Generate pillars command with error handling
Cypress.Commands.add('generatePillars', (nicheId: string) => {
  cy.intercept('POST', `**/niches/${nicheId}/pillars/generate`).as('generatePillars');

  return cy.wrap(
    new Promise<PillarResponse>((resolve, reject) => {
      cy.get('[data-testid=generate-pillars-button]')
        .should('be.enabled')
        .click()
        .should('be.disabled');

      cy.wait('@generatePillars', { timeout: 30000 })
        .then((interception) => {
          if (!interception.response || interception.response.statusCode !== 201) {
            reject(new Error(`Pillar generation failed: ${JSON.stringify(interception.response)}`));
          } else {
            resolve(interception.response.body as PillarResponse);
          }
        });
    })
  );
});

// Generate subpillars command with state verification
Cypress.Commands.add('generateSubpillars', (pillarId: string) => {
  cy.intercept('POST', `**/pillars/${pillarId}/subpillars/generate`).as('generateSubpillars');
  cy.intercept('GET', `**/pillars/${pillarId}/subpillars`).as('getSubpillars');

  return cy.wrap(
    new Promise<SubpillarResponse>((resolve, reject) => {
      cy.get('[data-testid=generate-subpillars-button]')
        .should('be.enabled')
        .click()
        .should('be.disabled');

      cy.wait('@generateSubpillars', { timeout: 30000 })
        .then((interception) => {
          if (!interception.response || interception.response.statusCode !== 201) {
            reject(new Error(`Subpillar generation failed: ${JSON.stringify(interception.response)}`));
          } else {
            // Wait for UI update
            cy.wait('@getSubpillars');
            resolve(interception.response.body as SubpillarResponse);
          }
        });
    })
  );
});

// Wait for element with retry strategy
Cypress.Commands.add(
  'waitForElement',
  (
    selector: string,
    options: { timeout?: number; interval?: number; errorMessage?: string } = {
      timeout: 10000,
      interval: 500,
      errorMessage: 'Element not found'
    }
  ) => {
    const startTime = Date.now();
    const { timeout, interval, errorMessage } = options;

    return cy.wrap(
      new Promise<JQuery<HTMLElement>>((resolve, reject) => {
        const attempt = () => {
          cy.get(selector, { timeout: interval })
            .then((element) => resolve(element))
            .then(undefined, () => {
              if (Date.now() - startTime > (timeout || 10000)) {
                reject(new Error(errorMessage));
              } else {
                setTimeout(attempt, interval || 500);
              }
            });
        };

        attempt();
      })
    );
  }
);

// Cleanup command with error handling
Cypress.Commands.add('cleanup', (type: 'niche' | 'pillar' | 'subpillar', id: string) => {
  const endpoints = {
    niche: `/api/niches/${id}`,
    pillar: `/api/pillars/${id}`,
    subpillar: `/api/subpillars/${id}`
  };

  cy.request({
    method: 'DELETE',
    url: endpoints[type],
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200 && response.status !== 404) {
      cy.log(`Warning: Cleanup of ${type} ${id} failed with status ${response.status}`);
    }
  });
});

export {};
