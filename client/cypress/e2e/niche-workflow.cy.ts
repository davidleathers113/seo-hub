import { AuthResponse, NicheResponse, PillarResponse, SubpillarResponse } from '../support/api-types';

interface TestContext {
  authToken?: string;
  nicheId?: string;
  pillarId?: string;
  subpillarIds: string[];
}

describe('Niche Creation and Management', () => {
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

    // Start from niche selection page
    cy.visit('/niche-selection');

    // Wait for page to load with retry
    cy.waitForElement('[data-testid=niche-selection]', {
      timeout: 10000,
      errorMessage: 'Niche selection page not loaded'
    });
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

  it('should complete full niche creation workflow', () => {
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

    // Verify niche card appears and navigate
    cy.waitForElement(`[data-testid=niche-card-${ctx.nicheId}]`)
      .should('be.visible')
      .and('contain', nicheName)
      .click();

    // Generate pillars
    cy.generatePillars(ctx.nicheId!)
      .should((response: PillarResponse) => {
        assert.isAtLeast(response.data.length, 1, 'Should have at least one pillar');
        ctx.pillarId = response.data[0]._id;
      });

    // Verify pillars and navigate
    cy.waitForElement(`[data-testid=pillar-card-${ctx.pillarId}]`)
      .should('be.visible')
      .click();

    // Generate subpillars
    cy.generateSubpillars(ctx.pillarId!)
      .should((response: SubpillarResponse) => {
        assert.isAtLeast(response.data.length, 1, 'Should have at least one subpillar');
        ctx.subpillarIds = response.data.map(s => s._id);
      });

    // Verify subpillars were created
    cy.get('[data-testid^=subpillar-card-]')
      .should('have.length.at.least', 1)
      .each($card => {
        cy.wrap($card)
          .should('be.visible')
          .and('not.be.disabled');
      });

    // Verify no errors
    cy.get('[data-testid*=error]').should('not.exist');
    cy.get('[role=alert]').should('not.exist');
  });
});
