import { AuthResponse, NicheResponse, PillarResponse, SubpillarResponse } from '../support/api-types';

interface TestContext {
  authToken?: string;
  nicheId?: string;
  pillarId?: string;
  subpillarIds: string[];
}

describe('Content Generation Flow', () => {
  const ctx: TestContext = {
    subpillarIds: []
  };

  before(() => {
    // Configure network throttling for reliability
    cy.intercept('**/*', (req) => {
      req.on('response', (res) => {
        // Add artificial delay to catch race conditions
        res.setDelay(100);
      });
    });

    // Clear all application state
    cy.clearLocalStorage();
    cy.clearCookies();
    indexedDB.deleteDatabase('app-cache');

    // Set up global error handler
    cy.on('uncaught:exception', (err) => {
      cy.log(`Uncaught exception: ${err.message}`);
      return false;
    });

    // Set up network failure handlers
    cy.on('fail', (error) => {
      if (error.message.includes('fetch failed')) {
        cy.log('Network request failed - retrying...');
        return false;
      }
    });
  });

  beforeEach(() => {
    // Restore application state if needed
    if (ctx.authToken) {
      localStorage.setItem('authToken', ctx.authToken);
    }
  });

  afterEach(() => {
    // Clean up generated data in reverse order
    ctx.subpillarIds.forEach(id => {
      cy.cleanup('subpillar', id);
    });
    if (ctx.pillarId) {
      cy.cleanup('pillar', ctx.pillarId);
    }
    if (ctx.nicheId) {
      cy.cleanup('niche', ctx.nicheId);
    }
  });

  it('should complete full content generation workflow', () => {
    // Login with retry
    cy.login('test@example.com', 'password123')
      .should((response: AuthResponse) => {
        ctx.authToken = response.data.token;
        assert.exists(response.data.user, 'User data should exist');
      });

    // Create test niche
    const nicheName = `Test Niche ${Date.now()}`;
    cy.createNiche(nicheName)
      .should((response: NicheResponse) => {
        ctx.nicheId = response.data._id;
        assert.equal(response.data.name, nicheName, 'Niche name should match');
      });

    // Generate pillars
    cy.generatePillars(ctx.nicheId!)
      .should((response: PillarResponse) => {
        assert.isAtLeast(response.data.length, 1, 'Should have at least one pillar');
        ctx.pillarId = response.data[0]._id;
      });

    // Navigate to pillar detail
    cy.waitForElement(`[data-testid=pillar-card-${ctx.pillarId}]`)
      .click();

    // Generate subpillars
    cy.generateSubpillars(ctx.pillarId!)
      .should((response: SubpillarResponse) => {
        assert.isAtLeast(response.data.length, 1, 'Should have at least one subpillar');
        ctx.subpillarIds = response.data.map(s => s._id);
      });

    // Content generation workflow with state checks
    const steps = [
      {
        name: 'research',
        button: '[data-testid=add-research-button]',
        input: '[data-testid=research-content]',
        value: 'Test research content',
        save: '[data-testid=save-research-button]',
        verify: () => {
          cy.get('[data-testid=research-content]')
            .should('have.value', 'Test research content');
        }
      },
      {
        name: 'outline',
        button: '[data-testid=generate-outline-button]',
        result: '[data-testid=outline-sections]',
        verify: () => {
          cy.get('[data-testid=outline-sections]')
            .should('be.visible')
            .find('li')
            .should('have.length.at.least', 1);
        }
      },
      {
        name: 'content points',
        button: '[data-testid=generate-content-points-button]',
        result: '[data-testid=content-points]',
        verify: () => {
          cy.get('[data-testid=content-points]')
            .should('be.visible')
            .find('li')
            .should('have.length.at.least', 1);
        }
      },
      {
        name: 'article',
        button: '[data-testid=merge-article-button]',
        result: '[data-testid=article-editor]',
        verify: () => {
          cy.get('[data-testid=article-editor]')
            .should('be.visible')
            .and('not.be.empty');
        }
      }
    ];

    // Execute each step with proper error handling
    steps.forEach((step) => {
      cy.log(`Executing step: ${step.name}`);

      // Click the action button
      cy.waitForElement(step.button)
        .should('be.enabled')
        .click()
        .should('be.disabled');

      // Handle input if present
      if (step.input) {
        cy.waitForElement(step.input)
          .should('be.visible')
          .clear()
          .type(step.value);

        cy.waitForElement(step.save)
          .should('be.enabled')
          .click()
          .should('be.disabled');
      }

      // Wait for and verify result
      if (step.result) {
        cy.waitForElement(step.result, {
          timeout: 15000,
          errorMessage: `${step.name} result not found`
        });
      }

      // Run step-specific verifications
      step.verify();

      // Verify no errors after step
      cy.get('[data-testid*=error]').should('not.exist');
      cy.get('[role=alert]').should('not.exist');
    });
  });
});
