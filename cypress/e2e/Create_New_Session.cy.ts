describe('Create New Session', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
    cy.get('input[type="email"]').type('testAB@eesti.ee')
    cy.get('input[type="password"]').type('Foobar.1')
    cy.get('button[type="submit"]').click()
    cy.contains("User's GPS Sessions ").click()
  })

  it('Create new session', () => {
    cy.contains('Create New').click()
    cy.contains('GPS Session Create')
    cy.get('input[id="name"]').type('Morning Run')
    cy.get('textarea[id="description"]').type('A refreshing morning run in the park.')
    cy.get('select[id="gpsSessionTypeId"]').select('Running')
    cy.get('input[id="paceMin"]').clear()
    cy.get('input[id="paceMin"]').type('60')
    cy.get('input[id="paceMax"]').clear()
    cy.get('input[id="paceMax"]').type('61')
    cy.get("button[type='submit']").contains('Create').click()
    cy.contains('Morning Run')
  })
})
