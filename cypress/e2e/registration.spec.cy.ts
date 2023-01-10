import { fillRegistrationForm, makeid } from "./helpers";

describe('registration', () => {
  it('Should register and redirect to dashboard when registration data is correct', () => {
    cy.visit('/auth/register')
    const id = makeid(10);

    fillRegistrationForm(`${id}mail12@mail.com`, id, 'pa$$worD', 'pa$$worD');

    cy.get("#registerBtn").click();

    cy.location({timeout: 5000}).should(loc => expect(loc.pathname).equal("/management"))
  })

  it('Should display passwords mismatch', () => {
    cy.visit('/auth/register')
    const id = makeid(10);

    fillRegistrationForm(`${id}mail12@mail.com`, id, 'pa$$worD', 'pa$$worD12');

    cy.get("#passwordsMismatchMessage").contains('Passwords must be the same');
  })


  it('Should display invalid email', () => {
    cy.visit('/auth/register')
    const id = makeid(10);

    fillRegistrationForm(`@mail.com`, id, 'pa$$worD', 'pa$$worD');

    cy.get("#invalidEmailMessage").contains('Please enter a valid email address');
  })

  it('Should submit be disabled when username is to short or not specified', () => {
    cy.visit('/auth/register')
    const id = makeid(10);

    fillRegistrationForm(`${id}mail12@mail.com`, 'a', 'pa$$worD', 'pa$$worD');

    cy.get('[formcontrolname="username"]').clear();
    cy.get("#registerBtn").should('be.disabled');

    fillRegistrationForm(`${id}mail12@mail.com`, 'abc', 'pa$$worD', 'pa$$worD');
    cy.get("#registerBtn").should('be.disabled');
  })

  it('Should display message about weak password', () => {
    cy.visit('/auth/register')
    const id = makeid(10);

    fillRegistrationForm(`${id}mail12@mail.com`, id, 'weak', 'weak');

    cy.get("#strongPasswordHint").contains('Must contain at least 5 characters and one special sign');
  })

})