import promisify from "cypress-promise";

const dayjs = require('dayjs')

export function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export interface Credentials {
    mail: string,
    password: string;
}

export function fillRegistrationForm(email: string, userName: string, password: string, confirmPassword: string) {
    cy.get('[formcontrolname="email"]').type(email)
    cy.get('[formcontrolname="username"]').type(userName)
    cy.get('[formcontrolname="password"]').type(password)
    cy.get('[formcontrolname="confirmPassword"]').type(confirmPassword)

    cy.get('[formcontrolname="username"]').click() // unfocus
}

export function fillLoginForm(email: string, password: string) {
    cy.get('[formcontrolname="email"]').type(email)
    cy.get('[formcontrolname="password"]').type(password)

    cy.get('[formcontrolname="email"]').click() // unfocus 
}

export function fillAddListDialog(name: string, date: string) {
    return new Cypress.Promise((resolve, reject) => {
        cy.get('#listName').type(name)
        cy.wait(500);
        cy.get('#datePicker').clear()
        cy.wait(500);
        cy.get('#datePicker').type(date)
        cy.wait(500);
        cy.get('#listName').click() // unfocus 
        resolve();
    })
}

export function getDateWithOffsetAsDate(offSetInDays: number): Date {
  const today = Date.now();

  return new Date(today + offSetInDays*24*60*60*1000)
}

export function getDateWithOffset(offSetInDays: number) {
    const date = getDateWithOffsetAsDate(offSetInDays);
    return convertDateToDialogFormat(date);
}

export function convertDateToDialogFormat(date: Date) {
  const year = date.getFullYear();
  const days = date.getUTCDate();
  const month = date.getUTCMonth() + 1;

  return `${month}/${days}/${year}`;
}

export function createAccount(): Credentials {
    cy.visit('/auth/register')

    const id = makeid(10);

    fillRegistrationForm(`${id}mail12@mail.com`, id, 'pa$$worD', 'pa$$worD');

    cy.get("#registerBtn").click();

    cy.wait(5000);
    return {mail: `${id}mail12@mail.com`, password: 'pa$$worD'};
}


export function login(email: string, password: string) {
    cy.visit('/auth/login')

    fillLoginForm(email, password);

    cy.get("#loginBtn").click();

    cy.wait(5000);
}

export function addList(): string {
    cy.visit('/management')
    cy.wait(1000);
    const id = makeid(10);

    cy.get('#addListBtn').click()

    fillAddListDialog(id, getDateWithOffset(3))

    cy.get('#addList').click()

    cy.wait(4000);

    return id;
}

  export function findList(name: string): Cypress.Chainable<JQuery<HTMLElement>> {
    const query = '[id^=listItem]';

    return cy.get(query).contains(name).parent();
  }

  export function findProduct(name: string, quantity: string, weight: string){
    const query = 'app-shopping-list-item';

    return cy.get(query)
        .filter(`:contains(${quantity})`)
        .filter(`:contains(${weight})`)
        .filter(`:contains(${name})`);
  }

	export function productShouldNotExists(name: string, quantity: string, weight: string) {
        const query = 'app-shopping-list-item';

        if(Cypress.$(query).length === 0) {
            return true;
        }

        return cy.get(query)
            .should('not.contain', quantity)
            .and('not.contain', weight)
            .and('not.contain', name)
			.should('not.exist');
	}
	
  export function addProduct(standardOption: string | undefined, nonStandardOption: string | undefined, quantity: string, basicWeight: string, addImage: boolean) {
    cy.get('#addListItem').click()
    cy.wait(500);
    fillProductForm(standardOption, nonStandardOption, quantity, basicWeight, addImage);
    cy.wait(500);
    cy.get('#confirmItemAdd').click()
    cy.wait(4000);
  }

  export function fillProductForm(standardOption: string | undefined, nonStandardOption: string | undefined, quantity: string, basicWeight: string,  addImage: boolean): void {
    if(standardOption !== undefined) {
        cy.get('#defaultWeightsSelect').click();
        cy.get('mat-option').contains(standardOption).click();
    }

    if(nonStandardOption !== undefined) {
        cy.get('[formcontrolname="name"]').clear().type(nonStandardOption);
    }

    cy.get('[formcontrolname="quantity"]').clear().type(quantity)
    cy.get('[formcontrolname="basicWeight"]').click();
    cy.get('mat-option').contains(basicWeight).click();
		if(addImage) {
			cy.get('#itemFile').selectFile('cypress/fixtures/test.jpg');
		}
  }
