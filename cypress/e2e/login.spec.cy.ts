import { createAccount, Credentials, fillLoginForm, fillRegistrationForm, makeid } from "./helpers";

describe('Login', () => {
  let creds: Credentials;

  before(() => {
    creds = createAccount();
    cy.get('#logout').click();
    cy.wait(2000);
  })

  afterEach(() => {
    cy.visit('/auth/login');
  });

  it('Should redirect to login page when accessing dashboard route without being logged in', () => {
    cy.visit('/management');
    cy.location({timeout: 20000}).should(loc => expect(loc.pathname).equal("/auth/login"))
  });


  it('Should login and logout when account exists', () => {
    fillLoginForm(creds.mail, creds.password);
    cy.get("#loginBtn").click();
    cy.location({timeout: 20000}).should(loc => expect(loc.pathname).equal("/management"))
    cy.get('#logout').click();
    cy.wait(2000);
  })

  it('Should display error message when email is empty or invalid', () => {
    fillLoginForm('invalid', creds.password);

    cy.get("#invalidEmailMessage").contains('Please enter a valid email address');
    cy.get('[formcontrolname="email"]').clear();
    cy.get("#invalidEmailMessage").contains('Please enter a valid email address');
  });

  it('Should display error message when password is empty or invalid', () => {
    fillLoginForm(creds.mail, 'weak');
    cy.get('[formcontrolname="password"]').clear();
    cy.get("#invalidPasswordMessage").contains('Please enter valid password');
  });

  it('Should display error message when credentials for account are invalid', () => {
    fillLoginForm(creds.mail, 'invalid');

    cy.get("#loginBtn").click();
    cy.wait(3000);
    cy.get('.mat-simple-snack-bar-content').contains('invalid credentials')
  });

})