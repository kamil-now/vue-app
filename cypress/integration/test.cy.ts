describe("Test", () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it("should work", () => {
    expect(true).to.eq(true);
  });
});
