const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");

const providers = baseHelpers.providers;

providers.forEach(web3 => {
    describe("sendTransaction - " + web3.currentProvider.constructor.name, () => {
        it("should trigger tx events after send", async () => {
            // Works with beta36 HttpProvider but failing with WebsocketProvider(no confirmations received).
            // Failing both with beta 51 (sendTransaction never resolves. confirmations are still not received with WebsocketProvider)
            return new Promise(async resolve => {
                const accounts = await web3.eth.personal.getAccounts();

                const transactionHashSpy = sinon.spy();
                const confirmationSpy = sinon.spy();
                const receiptSpy = sinon.spy();

                // testing:
                // 1. transactionHash and receipt events are triggered once and before any confirmation event
                // 2. confirmations event triggered  TRANSACTION_CONFIRMATION_BLOCKS times
                // 3. tx resolved before confirmation event triggered on the TRANSACTION_CONFIRMATION_BLOCKS time
                let resolved = false;
                const receipt = await web3.eth
                    .sendTransaction({ to: accounts[1], from: accounts[0], value: web3.utils.toWei("0.1", "ether") })
                    .on("transactionHash", transactionHashSpy)
                    .on("receipt", receiptSpy)
                    .on("confirmation", (confirmationNumber, receipt) => {
                        confirmationSpy(confirmationNumber, receipt);
                        assert(receipt.status);
                        sinon.assert.calledOnce(transactionHashSpy);
                        sinon.assert.calledOnce(receiptSpy);
                        if (confirmationNumber === baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS) {
                            assert(resolved);
                            resolve();
                        }
                    });

                assert(receipt.status);
                sinon.assert.calledOnce(transactionHashSpy);
                sinon.assert.calledOnce(receiptSpy);
                resolved = true;
            });
        }).timeout(baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS * 1000 + 2000);
    });
});
