// Custom commands for common operations
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
  });
});

Cypress.Commands.add('createTestNiche', (nicheName: string) => {
  cy.request({
    method: 'POST',
    url: '/api/niches',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`
    },
    body: { name: nicheName }
  });
});

// Add more custom commands as needed
