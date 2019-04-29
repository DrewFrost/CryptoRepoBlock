const cryptoHash = require("../utils/cryptoHash");
const hexToBinara = require("hex-to-binary");

describe("cryptoHash()", () => {
  it("Has to generate SHA-256 output", () => {
    expect(cryptoHash("testinghashtext")).toEqual(
      "f18cb1dc2626bf18dc94368775cde803809e80da1ba6494666b120b99e994177"
    );
  });
  it("Has to check if hash is the same with args in any order", () => {
    expect(cryptoHash("test1", "test2", "test3")).toEqual(
      cryptoHash("test2", "test1", "test3")
    );
  });
  it("should produce new hash on changed properties in input", () => {
    const test = {};
    const originalHash = cryptoHash(test);
    test["testprop"] = "testprop";

    expect(cryptoHash(test)).not.toEqual(originalHash);
  });
});
