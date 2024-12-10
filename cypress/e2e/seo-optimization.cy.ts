describe('SEO Optimization Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should complete full SEO optimization workflow', () => {
    // Navigate to an existing article
    cy.visit('/articles');
    cy.get('[data-testid=article-item]').first().click();

    // Perform SEO analysis
    cy.get('[data-testid=seo-analyze-button]').click();

    // Verify SEO score components
    cy.get('[data-testid=seo-score]').should('exist');
    cy.get('[data-testid=detailed-scores]').should('exist');
    cy.get('[data-testid=seo-suggestions]').should('exist');

    // Apply SEO improvements
    cy.get('[data-testid=apply-improvements-button]').click();

    // Verify improved score
    cy.get('[data-testid=seo-score]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 70);
  });
});
