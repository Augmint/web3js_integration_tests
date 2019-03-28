const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");

const Web3 = require("web3");

const TRANSACTION_CONFIRMATION_BLOCKS = 3;
const OPTIONS = {
    transactionConfirmationBlocks: TRANSACTION_CONFIRMATION_BLOCKS
};

const providers = [
    new Web3(Web3.providers.WebsocketProvider("ws://localhost:8545"), null, OPTIONS),
    new Web3(Web3.providers.HttpProvider("http://localhost:8545"), null, OPTIONS)
];
providers.forEach(web3 => {
    describe("Basic web3 and ganache integration tests - " + web3.currentProvider.constructor.name, () => {
        it("should trigger tx events after send", async () => {
            assert.equal(web3.transactionConfirmationBlocks, TRANSACTION_CONFIRMATION_BLOCKS);
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
            sinon.assert.callCount(confirmationSpy, TRANSACTION_CONFIRMATION_BLOCKS);
            sinon.assert.notCalled(errorSpy);
            assert(receipt.status);
        });
    });
});
