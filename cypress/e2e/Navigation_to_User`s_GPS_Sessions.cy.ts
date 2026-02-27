describe('Navigation to User`s GPS Sessions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
  })

  it('Navigate to User`s GPS Sessions', () => {
    cy.contains("User's GPS Sessions ").click()
    cy.contains('Create New')
    cy.contains(' Delete')
  })
})
