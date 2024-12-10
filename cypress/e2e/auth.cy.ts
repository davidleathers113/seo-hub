describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should complete full registration flow', () => {
    const testEmail = `test${Date.now()}@example.com`;

    cy.visit('/register');
    cy.get('[data-testid=email-input]').type(testEmail);
    cy.get('[data-testid=password-input]').type('TestPassword123!');
    cy.get('[data-testid=register-button]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=welcome-message]')
      .should('contain', 'Welcome to your dashboard');
  });

  it('should handle login with valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('TestPassword123!');
    cy.get('[data-testid=login-button]').click();

    cy.url().should('include', '/dashboard');
  });
});
