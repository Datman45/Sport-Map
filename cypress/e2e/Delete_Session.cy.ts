describe('Delete Session', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
    cy.contains("User's GPS Sessions ").click()
  })

  it('Delete a session', () => {
    cy.contains('Evening Run')
      .parent()
      .within(() => {
        cy.contains('Delete').click()
      })
    cy.contains('Evening Run').should('not.exist')
  })
})
