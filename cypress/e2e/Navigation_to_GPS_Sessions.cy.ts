describe('Navigation to GPS Sessions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
  })

  it('navigate to GPS Session Page', () => {
    cy.contains('GPS Sessions').click()
    cy.contains('Search:')
    cy.contains('Distance')
  })
})
