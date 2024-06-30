import { mockAnalysisToken } from '../../fixtures/consts';
import trackHarResultEmpty from '../../fixtures/qd/trackhar-empty.json';
import trackHarResult from '../../fixtures/qd/trackhar.json';
import harEmpty from '../../fixtures/qd/traffic-empty.har.json';
import har from '../../fixtures/qd/traffic.har.json';

const simulateRunnerResponse = (type: 'empty' | 'results') =>
    cy.request({
        method: 'POST',
        url: 'http://localhost:4321/private-api/analysis-result',
        headers: { 'Content-Type': 'application/json' },
        body: {
            analysisToken: mockAnalysisToken,
            status: 'success',
            har: type === 'empty' ? harEmpty : har,
            trackHarResult: type === 'empty' ? trackHarResultEmpty : trackHarResult,
        },
    });

const useCases = {
    'initial-found-nothing': 'No results in initial analysis',
    'notice-worked': 'No results in second analysis (notice worked)',
    'informal-complaint': 'Sending an informal complaint',
    'formal-complaint': 'Sending a formal complaint',
};

describe('Use case: Analysing Android apps', () => {
    beforeEach(() => {
        cy.exec('yarn db-test-util delete-qd');
    });

    for (const [useCase, description] of Object.entries(useCases)) {
        it(description, () => {
            cy.visit('/');

            cy.contains('Analyse an Android app').click();

            cy.get('#search-term').type('quizduel');
            cy.get('button[type="submit"]').click();

            cy.contains('QuizDuel! Quiz').click();
            cy.url().should('include', 'se.maginteractive.quizduel2');

            cy.contains('Android').click();

            cy.contains('Analysing app…');

            simulateRunnerResponse(useCase === 'initial-found-nothing' ? 'empty' : 'results');
            cy.reload();

            cy.contains('Analysis of “QuizDuel! Quiz & Trivia Game”');
            if (useCase === 'initial-found-nothing') {
                cy.contains('We did not detect any tracking data transmissions');
                return;
            }
            cy.contains('Firebase Installations SDK');
            cy.contains('Facebook Graph App Events API');
            cy.contains('Device advertising ID');
            cy.contains('e5MKLJp8QGi6-NUMLkUOMm');
            cy.contains('se.maginteractive.quizduel2');

            cy.contains('Send notice to developer').click();

            cy.contains('We have generated the message');
            cy.contains('To Whom It May Concern:');

            cy.get('#upload').selectFile('cypress/fixtures/qd/notice.eml');
            cy.get('button').contains('Upload').click();

            cy.contains('Waiting for the developer');
            cy.get('#upload');

            cy.contains('Continue with the process').click();

            cy.contains('How did the developer react?');
            cy.contains('The developer has not responded').should('be.disabled');
            cy.contains('The developer told me that they removed').click();

            cy.contains('Analysing app again…');

            simulateRunnerResponse(useCase === 'notice-worked' ? 'empty' : 'results');
            cy.reload();

            if (useCase === 'notice-worked') {
                cy.contains('Congrats, looks like your notice helped');
                return;
            }
            cy.contains('Analysis of “QuizDuel! Quiz & Trivia Game”');
            cy.contains('Firebase Installations SDK');
            cy.contains('Facebook Graph App Events API');
            cy.contains('Device advertising ID');
            cy.contains('e5MKLJp8QGi6-NUMLkUOMm');
            cy.contains('se.maginteractive.quizduel2');

            cy.contains('Contact data protection authorities').click();

            cy.contains('Are you a user of the app?');
            cy.contains('Yes').click();

            cy.contains('Which authority do you want to contact?');
            cy.contains('Irish Data Protection Commission').click();

            cy.contains('How to contact the DPA about the app?');
            if (useCase === 'informal-complaint') cy.contains('Informally ask the DPA to look in the app').click();
            else cy.contains('Check whether I am personally affected').click();

            if (useCase === 'formal-complaint') {
                cy.contains('Prove that you are affected by the tracking');

                cy.get('#upload').selectFile('cypress/fixtures/qd/trackercontrol.csv');
                cy.get('button').contains('Upload').click();

                cy.contains('How did you install the app?');
                cy.contains('through the Google Play Store').click();

                cy.contains('Do you have a SIM card in your phone?');
                cy.contains('I have a SIM card').click();
            }

            cy.contains('Almost done');
            cy.contains('Irish Data Protection Commission');
            cy.contains('I have sent the complaint').click();

            cy.contains('What’s next?');
            if (useCase === 'informal-complaint') cy.contains('Since you have only sent an informal complaint');
            else cy.contains('the DPA has to inform you on the progress');
        });
    }
});
