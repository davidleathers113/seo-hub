// Test credentials that will be used across all tests
export const TEST_USER = {
  email: 'cypress_test@example.com',
  password: 'TestPassword123!'
};

// Helper function to register a test user
export const registerTestUser = () => {
  // Clear any existing auth state
  cy.clearLocalStorage();
  cy.clearCookies();

  // First try to login
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    body: {
      email: TEST_USER.email,
      password: TEST_USER.password
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    failOnStatusCode: false
  }).then((loginResponse) => {
    console.log('Initial login response:', {
      status: loginResponse.status,
      body: loginResponse.body
    });

    // If login fails, try to register
    if (loginResponse.status !== 200) {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/register',
        body: {
          email: TEST_USER.email,
          password: TEST_USER.password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((registerResponse) => {
        console.log('Register response:', {
          status: registerResponse.status,
          body: registerResponse.body
        });

        // Registration should succeed or user might already exist
        expect(registerResponse.status).to.be.oneOf([200, 201, 409]);

        // If registration was successful, store the token
        if (registerResponse.status === 200 || registerResponse.status === 201) {
          if (registerResponse.body?.token) {
            cy.window().then((win) => {
              win.localStorage.setItem('token', registerResponse.body.token);
              // Force a reload to ensure auth context picks up the token
              win.location.reload();
            });
          }
        }

        // If user exists, try logging in again
        if (registerResponse.status === 409) {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/auth/login',
            body: {
              email: TEST_USER.email,
              password: TEST_USER.password
            },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }).then((finalLoginResponse) => {
            console.log('Final login response:', {
              status: finalLoginResponse.status,
              body: finalLoginResponse.body
            });
            expect(finalLoginResponse.status).to.equal(200);
            
            if (finalLoginResponse.body?.token) {
              cy.window().then((win) => {
                win.localStorage.setItem('token', finalLoginResponse.body.token);
                // Force a reload to ensure auth context picks up the token
                win.location.reload();
              });
            }
          });
        }
      });
    } else {
      // Login successful, store the token
      if (loginResponse.body?.token) {
        cy.window().then((win) => {
          win.localStorage.setItem('token', loginResponse.body.token);
          // Force a reload to ensure auth context picks up the token
          win.location.reload();
        });
      }
    }

    // Visit the app after setting up auth
    cy.visit('/');
    cy.url({ timeout: 15000 }).should('include', '/niche-selection');
  });
};

// Helper function to ensure auth state is preserved
export const preserveAuth = () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    if (token) {
      win.localStorage.setItem('token', token);
      // Force a reload to ensure auth context picks up the token
      win.location.reload();
    }
  });
};
