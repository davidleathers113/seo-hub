/// <reference types="cypress" />

describe('URL Configuration Check', () => {
  it('should connect to frontend', () => {
    cy.visit('/')
    cy.window().then((win) => {
      expect(win.location.port).to.equal('5174')
    })
  })

  it('should connect to backend API', () => {
    cy.request({
      url: 'http://localhost:3001/api/health',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401) // Update expectation since health endpoint requires auth
      // We expect 401 because the health endpoint is protected
    })
  })
})
