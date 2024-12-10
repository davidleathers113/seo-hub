describe('Content Generation Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should complete full content generation workflow', () => {
    // Navigate to an existing pillar
    cy.visit('/pillars');
    cy.get('[data-testid=pillar-item]').first().click();

    // Generate subpillars
    cy.get('[data-testid=generate-subpillars-button]').click();
    cy.get('[data-testid=subpillar-list]')
      .should('exist')
      .find('[data-testid=subpillar-item]')
      .should('have.length.at.least', 1);

    // Add research to first subpillar
    cy.get('[data-testid=subpillar-item]').first().click();
    cy.get('[data-testid=add-research-button]').click();
    cy.get('[data-testid=research-content]')
      .type('Test research content');
    cy.get('[data-testid=research-source]')
      .type('Test source');
    cy.get('[data-testid=save-research-button]').click();

    // Generate outline
    cy.get('[data-testid=generate-outline-button]').click();
    cy.get('[data-testid=outline-sections]')
      .should('exist');

    // Generate content points
    cy.get('[data-testid=generate-content-points-button]').click();
    cy.get('[data-testid=content-points]')
      .should('exist');

    // Merge into article
    cy.get('[data-testid=merge-article-button]').click();
    cy.get('[data-testid=article-editor]')
      .should('exist');
  });
});
