/// <reference types="cypress" />

import { AuthResponse, NicheResponse, PillarResponse, SubpillarResponse } from './api-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login to the application
       * @param email - User email
       * @param password - User password
       * @example
       * cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<AuthResponse>;

      /**
       * Create a new niche
       * @param name - Niche name
       * @example
       * cy.createNiche('Test Niche')
       */
      createNiche(name: string): Chainable<NicheResponse>;

      /**
       * Generate pillars for a niche
       * @param nicheId - ID of the niche
       * @example
       * cy.generatePillars('nicheId123')
       */
      generatePillars(nicheId: string): Chainable<PillarResponse>;

      /**
       * Generate subpillars for a pillar
       * @param pillarId - ID of the pillar
       * @example
       * cy.generateSubpillars('pillarId123')
       */
      generateSubpillars(pillarId: string): Chainable<SubpillarResponse>;

      /**
       * Wait for element with retry strategy
       * @param selector - Element selector
       * @param options - Wait options
       * @example
       * cy.waitForElement('[data-testid=my-element]')
       */
      waitForElement(
        selector: string,
        options?: {
          timeout?: number;
          interval?: number;
          errorMessage?: string;
        }
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Clean up test data
       * @param type - Type of data to clean up
       * @param id - ID of the item to clean up
       * @example
       * cy.cleanup('niche', 'nicheId123')
       */
      cleanup(
        type: 'niche' | 'pillar' | 'subpillar',
        id: string
      ): Chainable<void>;
    }
  }
}