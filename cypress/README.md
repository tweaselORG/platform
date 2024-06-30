# Browser testing

Our browser integration tests are based on [Cypress](https://www.cypress.io/). We are using End-to-End (E2E) tests. To get an overview of Cypress, we recommend going through their very extensive and well-written [guides](https://docs.cypress.io/guides/overview/why-cypress), especially *[Your First Test with Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test)* and *[Introduction to Cypress](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress)*.

## Running the tests

The tests are automatically run by the CI environment.

To run them locally, you can use the Cypress test runner. Make sure you have the correct dependencies installed by running: `yarn cypress verify`. Check the Cypress docs for details on [which dependencies you need for which platform](https://docs.cypress.io/guides/getting-started/installing-cypress#System-requirements).

For the tests, we use a mock analysis runner instead of a real one. This not only makes the tests *significantly* faster but also allows us to control the analysis results and test accordingly. Start the mock analysis runner by running:

```sh
yarn mock-analysis-runner
```

To open the test runner, run:

```sh
yarn cypress open --e2e --browser electron
```

## Interacting with the database during tests

Sometimes you will need to manipulate the database during a test. For that, we have a small utility script in [`scripts/db-test-util.ts`](/scripts/db-test-util.ts). You can use the existing commands or add new ones.

Here's how you can run a command during a test:

```ts
cy.exec('yarn db-test-util delete-qd');
```
