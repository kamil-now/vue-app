/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.overwrite("visit", (originalFn, url) => {
  const request = {
    method: "POST",
    url: `https://login.microsoftonline.com/${Cypress.env(
      "VUE_APP_AAD_TENANT"
    )}/oauth2/v2.0/token`,
    form: true,
    body: {
      client_id: Cypress.env("VUE_APP_AAD_CLIENT_ID"),
      scope: `api://${Cypress.env("VUE_APP_AAD_CLIENT_ID")}/full`,
      password: Cypress.env("VUE_APP_AAD_TEST_PASSWORD"),
      username: Cypress.env("VUE_APP_AAD_TEST_USERNAME"),
      client_secret: Cypress.env("VUE_APP_AAD_TEST_SECRET"),
      grant_type: "password",
    },
  };

  cy.request(request).then((response) => {
    response.body.type = "azure";
    const authValue = JSON.stringify(response.body);
    window.localStorage.setItem("auth", authValue);

    originalFn(url);
  });
});
