describe('GPS Session Page Map View', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
    cy.contains('GPS Sessions').click()
  })

  it('display map view', () => {
    cy.contains('Map view').click()
    cy.get('.leaflet-container').should('exist').should('be.visible')
  })

  it('Refresh time setting', () => {
    cy.contains('Map view').click()
    cy.get("input[type='number']").clear()
    cy.get("input[type='number']").type('10')
    cy.contains('Set Refresh Time').click()
  })

  it('Return to list view', () => {
    cy.contains('Map view').click()
    cy.contains('Back').click()
    cy.contains('Search:')
  })
})
