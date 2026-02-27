describe('Authorization', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  it('display the correct page', () => {
    cy.contains('Sport Map')
    cy.get('input[type="email"]').should('exist').should('be.visible')
    cy.get('input[type="password"]').should('exist').should('be.visible')
  })

  it('succesful login', () => {
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
    cy.contains('Welcome to GPS Session Tracker')
  })
})
