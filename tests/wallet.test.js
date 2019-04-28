const Wallet = require("../src/wallet/wallet");
const { verifySignature } = require("../utils/ec");

describe("Wallet", () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it("Should have a balance", () => {
    expect(wallet).toHaveProperty("balance");
  });
  it("should have a public key", () => {
    expect(wallet).toHaveProperty("publicKey");
  });

  describe("Has to sign data", () => {
    const data = "test data";

    it("should verify digital signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it("should not verify invalid digital signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
    });
  });
});
