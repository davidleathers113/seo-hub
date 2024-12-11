import { TEST_USER } from '../support/test-utils';

describe('SEO Optimization Flow', () => {
  before(() => {
    cy.visit('/');
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Register/login through UI
    cy.visit('/login');
    cy.get('#email', { timeout: 10000 }).type(TEST_USER.email);
    cy.get('#password', { timeout: 10000 }).type(TEST_USER.password);

    // Intercept the login endpoint
    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.get('button[type="submit"]', { timeout: 10000 }).click();

    // Handle login response
    cy.wait('@loginRequest').then((interception) => {
      console.log('Login response:', {
        status: interception.response?.statusCode,
        body: interception.response?.body
      });

      // If login fails (user doesn't exist), register
      if (interception.response?.statusCode !== 200) {
        cy.visit('/register');
        cy.get('#email', { timeout: 10000 }).type(TEST_USER.email);
        cy.get('#password', { timeout: 10000 }).type(TEST_USER.password);

        // Intercept the registration endpoint
        cy.intercept('POST', '**/register').as('registerRequest');

        cy.get('button[type="submit"]', { timeout: 10000 }).click();

        // Wait for registration response
        cy.wait('@registerRequest').then((registerInterception) => {
          console.log('Register response:', {
            status: registerInterception.response?.statusCode,
            body: registerInterception.response?.body
          });
          cy.wrap(registerInterception.response?.statusCode).should('be.oneOf', [200, 201]);
        });
      } else {
        cy.wrap(interception.response?.statusCode).should('equal', 200);
      }
    });

    // Verify redirect to niche selection
    cy.url({ timeout: 15000 }).should('include', '/niche-selection');

    // Create a test niche if one doesn't exist
    const nicheName = `Test Niche ${Date.now()}`;
    cy.get('#nicheName').type(nicheName);

    // Intercept niche creation API call
    cy.intercept('POST', '**/niches').as('createNiche');
    cy.contains('button', 'Create Niche').click();

    // Wait for niche creation and store ID
    cy.wait('@createNiche').then((interception) => {
      cy.wrap(interception.response?.statusCode).should('equal', 201);
      const nicheId = interception.response?.body.id;
      window.localStorage.setItem('testNicheId', nicheId);

      // Click the niche card to go to pillars page
      cy.get(`[data-testid=niche-card-${nicheId}]`).click();

      // Set up intercept before clicking button
      cy.intercept('POST', `**/niches/${nicheId}/pillars/generate`).as('generatePillars');

      // Generate pillars
      cy.get('[data-testid=generate-pillars-button]').click();

      // Wait for pillars to be generated
      cy.wait('@generatePillars').then((pillarInterception) => {
        cy.wrap(pillarInterception.response?.statusCode).should('equal', 201);

        // Store first pillar ID for other tests
        const pillars = pillarInterception.response?.body.data;
        if (pillars && pillars.length > 0) {
          window.localStorage.setItem('testPillarId', pillars[0].id);
        }
      });
    });
  });

  beforeEach(() => {
    // Get the stored pillar ID
    cy.window().then((win) => {
      const pillarId = win.localStorage.getItem('testPillarId');
      if (pillarId) {
        cy.visit(`/pillars/${pillarId}`);
      }
    });
  });

  it('should complete full SEO optimization workflow', () => {
    // Generate subpillars
    cy.contains('button', 'Generate Subpillars').click();
    cy.get('.subpillar-node', { timeout: 15000 })
      .should('have.length.at.least', 1);

    // Click first subpillar to go to detail page
    cy.get('.subpillar-node').first().click();

    // Add research
    cy.get('[data-testid=add-research-button]').click();
    cy.get('[data-testid=research-content]')
      .type('Test research content');
    cy.get('[data-testid=research-source]')
      .type('Test source');
    cy.get('[data-testid=save-research-button]').click();

    // Generate outline
    cy.get('[data-testid=generate-outline-button]').click();
    cy.get('[data-testid=outline-sections]', { timeout: 15000 })
      .should('exist');

    // Generate content points
    cy.get('[data-testid=generate-content-points-button]').click();
    cy.get('[data-testid=content-points]', { timeout: 15000 })
      .should('exist');

    // Merge into article
    cy.get('[data-testid=merge-article-button]').click();
    cy.get('[data-testid=article-editor]', { timeout: 15000 })
      .should('exist');

    // Optimize SEO
    cy.get('[data-testid=optimize-seo-button]').click();
    cy.get('[data-testid=seo-suggestions]', { timeout: 15000 })
      .should('exist');

    // Apply SEO suggestions
    cy.get('[data-testid=apply-seo-button]').click();
    cy.get('[data-testid=seo-score]', { timeout: 15000 })
      .should('exist')
      .and('contain', 'SEO Score');
  });
});
