describe('Niche Creation and Management', () => {
  beforeEach(() => {
    // Custom command to handle login
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should complete full niche creation workflow', () => {
    const nicheName = `Test Niche ${Date.now()}`;

    // Create niche
    cy.visit('/niches');
    cy.get('[data-testid=niche-input]').type(nicheName);
    cy.get('[data-testid=create-niche-button]').click();

    // Verify niche creation
    cy.get('[data-testid=niche-list]')
      .should('contain', nicheName);

    // Generate pillars
    cy.get(`[data-testid=niche-${nicheName}]`)
      .find('[data-testid=generate-pillars-button]')
      .click();

    // Wait for pillar generation
    cy.get('[data-testid=pillar-list]')
      .should('exist')
      .find('[data-testid=pillar-item]')
      .should('have.length.at.least', 1);
  });
});
