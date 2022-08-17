describe("Test", () => {
  beforeEach(() => cy.login().visit("/home"));

  it("can add task", () => {
    let itemsLengthBefore = 0;
    cy.get(".list-item")
      .then((items) => (itemsLengthBefore = items.length))
      .then(() => {
        cy.get(".add-btn")
          .click()
          .get(".list-item")
          .should("have.length", itemsLengthBefore + 1);
      });
  });
});
