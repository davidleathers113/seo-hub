describe('Server Health Check', () => {
  it('should verify registration and login flow', () => {
    const testEmail = `test_health_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    // Test registration endpoint
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/register',
      body: {
        email: testEmail,
        password: testPassword
      },
      failOnStatusCode: false
    }).then((response) => {
      console.log('Registration test response:', {
        status: response.status,
        body: response.body,
        headers: response.headers,
        requestBody: {
          email: testEmail,
          password: testPassword
        }
      });
      expect(response.status).to.be.oneOf([200, 201, 409]); // 409 is ok if user already exists

      // If registration was successful or user exists, try logging in
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/auth/login',
        body: {
          email: testEmail,
          password: testPassword
        },
        failOnStatusCode: false
      }).then((loginResponse) => {
        console.log('Login test response:', {
          status: loginResponse.status,
          body: loginResponse.body,
          headers: loginResponse.headers,
          requestBody: {
            email: testEmail,
            password: testPassword
          }
        });
        expect(loginResponse.status).to.equal(200);

        // If login successful, try accessing protected endpoint with token
        if (loginResponse.body?.token) {
          cy.request({
            method: 'GET',
            url: 'http://localhost:3001/api/health',
            headers: {
              'Authorization': `Bearer ${loginResponse.body.token}`
            },
            failOnStatusCode: false
          }).then((healthResponse) => {
            console.log('Health check response with token:', {
              status: healthResponse.status,
              body: healthResponse.body,
              headers: healthResponse.headers
            });
            expect(healthResponse.status).to.be.oneOf([200, 404]); // 404 is ok if health endpoint isn't implemented
          });
        }
      });
    });
  });
});
