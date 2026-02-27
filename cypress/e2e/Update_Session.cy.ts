describe('Update Session', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
    cy.contains("User's GPS Sessions ").click()
  })

  it('Update a session', () => {
    cy.contains('Morning Run')
      .parent()
      .within(() => {
        cy.contains('Update').click()
      })
    cy.contains('Update Gps Session')
    cy.get('input[id="name"]').clear()
    cy.get('input[id="name"]').type('Evening Run')
    cy.get('textarea[id="description"]').clear()
    cy.get('textarea[id="description"]').type('A relaxing evening run by the river.')
    cy.get('input[id="paceMin"]').clear()
    cy.get('input[id="paceMin"]').type('65')
    cy.get('input[id="paceMax"]').clear()
    cy.get('input[id="paceMax"]').type('66')
    cy.get('select[id="gpsSessionType"]').select('Running - easy')
    cy.get('button').contains('Edit').click()
    cy.contains('Evening Run')
  })
})
