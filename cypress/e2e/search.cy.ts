describe('App search function', () => {
    beforeEach(() => {
        cy.visit('/a');
    });

    it('Has correct results for Android', () => {
        cy.get('#search-term').type('whatsapp');
        cy.get('button[type="submit"]').click();

        cy.contains('WhatsApp Messenger');
    });

    it('Has correct results for iOS', () => {
        cy.get('#search-term').type('garageband');
        cy.contains('iOS').click();
        cy.get('button[type="submit"]').click();

        cy.contains('GarageBand');
    });

    it('Switching from Android to iOS works', () => {
        cy.get('#search-term').type('move to ios');
        cy.get('button[type="submit"]').click();

        cy.contains('Move to iOS');

        cy.contains('iOS').click();
        cy.get('button[type="submit"]').click();

        cy.contains('Move to iOS').should('not.exist');
    });

    it('Shows no results for gibberish', () => {
        cy.get('#search-term').type('djlasdjasdajksdhkjahdkjahsd');
        cy.get('button[type="submit"]').click();

        cy.get('li').should('not.exist');
    });
});
