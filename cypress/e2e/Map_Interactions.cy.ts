describe('Map Interactions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
    cy.contains("User's GPS Sessions ").click()
    cy.contains('Evening Run')
      .parent()
      .within(() => {
        cy.contains('Map view').click()
      })
  })

  it('Add Marks', () => {
    cy.get('.map-container').click(200, 200)
    cy.get('.map-container').click(200, 201)
  })
})
