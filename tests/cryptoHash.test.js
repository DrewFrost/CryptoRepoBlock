const cryptoHash = require("../app/cryptoHash");

describe("cryptoHash()", () => {
  it("Has to generate SHA-256 output", () => {
    expect(cryptoHash("testinghashtext")).toEqual(
      "86cd031fd8dc598e01ec5931965fdce8803e46487c7a2b5450cdfd5fe97c1658"
    );
  });
  it("Has to check if hash is the same with args in any order", () => {
    expect(cryptoHash("test1", "test2", "test3")).toEqual(
      cryptoHash("test2", "test1", "test3")
    );
  });
});
