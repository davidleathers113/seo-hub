import { TEST_USER } from '../support/test-utils';

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should complete full registration flow', () => {
    const testEmail = `test_${Date.now()}@example.com`;
    
    cy.visit('/register');
    cy.get('#email', { timeout: 10000 }).type(testEmail);
    cy.get('#password', { timeout: 10000 }).type(TEST_USER.password);
    
    // Intercept the registration endpoint
    cy.intercept('POST', '**/api/register').as('registerRequest');
    
    cy.get('button[type="submit"]', { timeout: 10000 }).click();

    // Wait for registration response and log it
    cy.wait('@registerRequest').then((interception) => {
      console.log('Register response:', {
        status: interception.response?.statusCode,
        body: interception.response?.body,
        request: interception.request?.body,
        url: interception.request?.url
      });
      
      // Registration should succeed or user might already exist
      expect(interception.response?.statusCode).to.be.oneOf([200, 201, 409]);
      
      // If we get a token, it means registration was successful
      if (interception.response?.body?.token) {
        // Store the token
        window.localStorage.setItem('token', interception.response.body.token);
      }
    });

    // Verify redirect to niche selection
    cy.url({ timeout: 15000 }).should('include', '/niche-selection');
  });

  it('should handle login with valid credentials', () => {
    cy.visit('/login');
    cy.get('#email', { timeout: 10000 }).type(TEST_USER.email);
    cy.get('#password', { timeout: 10000 }).type(TEST_USER.password);
    
    // Intercept the login endpoint
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    
    cy.get('button[type="submit"]', { timeout: 10000 }).click();

    // Wait for login response and log it
    cy.wait('@loginRequest').then((interception) => {
      console.log('Login response:', {
        status: interception.response?.statusCode,
        body: interception.response?.body,
        request: interception.request?.body,
        url: interception.request?.url
      });
      expect(interception.response?.statusCode).to.equal(200);
      
      // Store the token
      if (interception.response?.body?.token) {
        window.localStorage.setItem('token', interception.response.body.token);
      }
    });

    // Verify redirect to niche selection
    cy.url({ timeout: 15000 }).should('include', '/niche-selection');
  });
});
