import { addList, addProduct, createAccount, Credentials, fillProductForm, findList, findProduct, productShouldNotExists } from "./helpers";

describe('shopping list editor', () => {
  let creds: Credentials;
  let listName: string;

  before(() => {
    creds = createAccount();
    })

  beforeEach(() => {
    cy.visit('/management')
    cy.wait(3000);
    listName = addList();
    cy.wait(3000);
  });

  it('Should navigate to proper list', () => {
    const list = findList(listName)

    list!.trigger('click');
    cy.wait(2000);

    cy.get('h2').contains(`List ${listName}`);
  });

  it('Should add items to list', () => {
    const list = findList(listName);

    list!.trigger('click')

		cy.wait(2000);
    addProduct('bread', undefined, '3', 'pcs', true);

		const x = findProduct('bread', '3', 'pcs')
		expect(x).not.to.be.undefined;

    addProduct(undefined, 'vinegar', '2.5', 'l', false);
		const y =findProduct('vinegar', '2.5', 'l')
		expect(y).not.to.be.undefined;
  });
	
	it('Should add and delete items from list with element count update', () => {
    const list = findList(listName);

    list!.trigger('click')

		cy.wait(2000);
		cy.contains('Elements (0)');
    addProduct('bread', undefined, '3', 'pcs', true);
    addProduct(undefined, 'vinegar', '2.5', 'l', false);

		cy.contains('Elements (2)');
		findProduct('bread', '3', 'pcs').find('[id^=delete-item]').click();
		cy.wait(2000);
		
		productShouldNotExists('bread', '3', 'pcs');
    cy.contains('Elements (1)');
		findProduct('vinegar', '2.5', 'l').find('[id^=delete-item]').click();
		cy.wait(2000);

		productShouldNotExists('vinegar', '2.5', 'l');
    cy.contains('Elements (0)');
  });

	
  it('Should mark list as realized and hide edit buttons', () => {
    const list = findList(listName);

    list!.trigger('click')

		cy.wait(2000);
    addProduct('bread', undefined, '3', 'pcs', true);
    addProduct(undefined, 'vinegar', '21.5', 'l', false);

		cy.get('#markAsRealized').click();

		cy.get('#markAsRealized').should('not.exist');
		cy.get('#addListItem').should('not.exist');
		cy.get('[id^=delete-item]').should('not.exist');

		cy.visit('/management');
		cy.wait(2000);

		const realizedList = findList(listName);

		realizedList.children('hr').should('exist');
  });

	it('Should display invalid name message when product name is invalid', () => {
 		cy.wait(2000);

		const list = findList(listName)
		
		list!.trigger('click')

		cy.wait(2000);

		cy.get('#addListItem').click();
		fillProductForm('bread', undefined, '3', 'pcs', false);

		cy.get('[formcontrolname="name"]').clear();
		cy.get('[formcontrolname="quantity"]').click(); // unfocus
		cy.get('#itemNameErrorMessage').should('contain.text', 'Name can have max from one to 40 chars');

		cy.get('[formcontrolname="name"]').type('a'.repeat(41));
		cy.get('[formcontrolname="quantity"]').click(); // unfocus
		cy.get('#itemNameErrorMessage').should('contain.text', 'Name can have max from one to 40 chars');
  });


	it('Should display invalid name message when product quantity is invalid', () => {
    const list = findList(listName)

    list!.trigger('click')

    cy.get('#addListItem').click();
    fillProductForm('bread', undefined, '3', 'pcs', false);

    cy.wait(2000);
    cy.get('[formcontrolname="quantity"]').clear();
    cy.get('[formcontrolname="quantity"]').type('0');
    cy.get('#itemQuantityErrorMessage').should('contain.text', 'Quantity cannot be negative or equal 0');

    cy.get('[formcontrolname="quantity"]').clear()
    cy.get('[formcontrolname="quantity"]').type('-2.5');
    cy.get('#itemQuantityErrorMessage').should('contain.text', 'Quantity cannot be negative or equal 0');
    
    
    cy.get('[formcontrolname="quantity"]').clear()
    cy.get('[formcontrolname="quantity"]').type('23');
    cy.get('#itemQuantityErrorMessage').should('not.exist');
  });

	it('Should delete empty list', () => {
    const list = findList(listName);
    list!.trigger('click')

		cy.wait(5000);

    cy.get('#deleteList').click();

    cy.wait(5000);

		cy.contains(listName).should('not.exist');
  });

});


