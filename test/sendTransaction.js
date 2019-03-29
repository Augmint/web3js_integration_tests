const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");

const providers = baseHelpers.providers;
console.log(providers[0].version);

providers.forEach(web3 => {
    describe("Basic web3 and ganache integration tests - " + web3.currentProvider.constructor.name, () => {
        it.skip("should trigger tx events after send", async () => {
            // Failing with beta 51
            assert.equal(web3.transactionConfirmationBlocks, baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS);
            const accounts = await web3.eth.personal.getAccounts();

            const transactionHashSpy = sinon.spy();
            const confirmationSpy = sinon.spy();
            const receiptSpy = sinon.spy();
            const errorSpy = sinon.spy();

            const receipt = await web3.eth
                .sendTransaction({ to: accounts[1], from: accounts[0], value: web3.utils.toWei("0.1", "ether") })
                .on("transactionHash", transactionHashSpy)
                .on("confirmation", confirmationSpy)
                .on("receipt", receiptSpy)
                .on("error", errorSpy);

            sinon.assert.calledOnce(transactionHashSpy);
            sinon.assert.calledOnce(receiptSpy);
            sinon.assert.callCount(confirmationSpy, baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS);
            sinon.assert.notCalled(errorSpy);
            assert(receipt.status);
        });
    });
});