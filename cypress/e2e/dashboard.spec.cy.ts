import { convertDateToDialogFormat, createAccount, Credentials, fillAddListDialog, findList, getDateWithOffset, getDateWithOffsetAsDate, login, makeid } from "./helpers";

describe('Dashboard', () => {
  let creds: Credentials;

  before(() => {
    creds = createAccount();
  })

  beforeEach(() => {
    cy.visit('/management')
    cy.wait(1000);
  });

  it('Should add and display shopping lists with proper name and realization date', () => {
    const id = makeid(10);
    cy.get('#addListBtn').click();

    const date = getDateWithOffsetAsDate(1);
    fillAddListDialog(id, convertDateToDialogFormat(date));

    cy.get('#addList').click();
    cy.wait(2000);

    cy.get('#listItem-0').children('span').first().contains(id);

    const id2 = makeid(10);
    cy.get('#addListBtn').click();

    fillAddListDialog(id2, getDateWithOffset(1));

    cy.get('#addList').click();
    cy.wait(2000);

    findList(id2)
        .should('exist')
        .find('span')
        .filter(':contains(realizationAt)')
        .then(e => {
            const dateFromList = new Date(e.text().split('realizationAt:')[1]);
            expect(dateFromList.getFullYear()).to.equal(date.getFullYear())
            expect(dateFromList.getMonth()).to.equal(date.getMonth())
            expect(dateFromList.getDate()).to.equal(date.getDate())
        })
        .parent()
        .contains('span', 'Items:')
        .then(e => {
            const itemsCount = e.text().split('Items:')[1];
            expect(itemsCount.trim()).to.equal('0');
        })
  });

  it('Should display invalid name message when adding list with empty name', () => {
    cy.get('#addListBtn').click();

    fillAddListDialog('a', getDateWithOffset(1));
    cy.get('#listName').clear();

    cy.get('#requiredNameMessage').contains('Please enter name');
  });

  it('Should display to long name message when adding list with to long name', () => {
    cy.get('#addListBtn').click();

    fillAddListDialog('a'.repeat(41), getDateWithOffset(1));

    cy.get('#tooLongNameMessage').contains('Name can have max 40 chars');
  });


  it('Should display invalid date message when putting past date', () => {
    const id = makeid(10);
    cy.get('#addListBtn').click();

    fillAddListDialog(id, getDateWithOffset(-1));
    cy.get('#invalidDate').contains('Please select valid date');
  });

  it('Should display invalid date message when putting invalid date', () => {
    const id = makeid(10);
    cy.get('#addListBtn').click();

    fillAddListDialog(id, "asdasd");
    cy.get('#invalidDate').contains('Please select valid date');
  });

});