const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");

const providers = baseHelpers.providers;

providers.forEach(web3 => {
    describe("tx fails - " + web3.currentProvider.constructor.name, () => {
        it("should resolve whith VM revert error", async () => {
            const transactionHashSpy = sinon.spy();
            const confirmationSpy = sinon.spy();
            const receiptSpy = sinon.spy();
            const onErrorSpy = sinon.spy();
            const catchErrorSpy = sinon.spy();

            const accounts = await web3.eth.personal.getAccounts();
            const dummyContract = await baseHelpers.getWeb3ContractInstance(
                web3,
                "../../build/contracts/DummyContract.json"
            );

            const receipt = dummyContract.methods
                .revertMe()
                .send({ from: accounts[0] })
                .on("transactionHash", transactionHashSpy)
                .on("confirmation", confirmationSpy)
                .on("receipt", receiptSpy)
                .on("error", onErrorSpy);

            await receipt.catch(catchErrorSpy);

            assert(!receipt.status);
            sinon.assert.calledOnce(onErrorSpy);
            sinon.assert.calledOnce(catchErrorSpy);

            sinon.assert.calledOnce(transactionHashSpy);
            sinon.assert.calledOnce(receiptSpy);
            sinon.assert.callCount(confirmationSpy, baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS);
        });
    });
});
