const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");
const ganache = require("./helpers/ganache.js");

const providers = baseHelpers.providers;

providers.forEach(web3 => {
    describe("tx fails - " + web3.currentProvider.constructor.name, () => {
        it("should resolve when VM revert error", async () => {
            // fails on beta36 and beta52 - confirmations or receipt events never triggered
            //      receipt is not available neither in resolved tx or in error event args
            return new Promise(async resolve => {
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

                // testing:
                // 1. transactionHash and receipt events are triggered once and before any confirmation event
                // 2. confirmations event triggered  TRANSACTION_CONFIRMATION_BLOCKS times
                // 3. tx resolved before confirmation event triggered on the TRANSACTION_CONFIRMATION_BLOCKS time
                // 4. error event triggered before confirmation event
                // 5. error thrown before confirmation event
                let resolved = false;
                const receipt = await dummyContract.methods
                    .revertMe()
                    .send({ from: accounts[0] })
                    .on("transactionHash", txHash => {
                        console.log("txHash:", txHash);
                        transactionHashSpy(txHash);
                    })
                    .on("receipt", receiptSpy)
                    .on("confirmation", (confirmationNumber, receipt) => {
                        console.log("con");
                        confirmationSpy(confirmationNumber, receipt);
                        assert(receipt);
                        assert(!receipt.status);
                        sinon.assert.calledOnce(transactionHashSpy);
                        sinon.assert.calledOnce(receiptSpy);
                        sinon.assert.calledOnce(onErrorSpy);
                        sinon.assert.calledOnce(catchErrorSpy);
                        if (confirmationNumber === baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS) {
                            assert(resolved);
                            resolve();
                        }
                    })
                    .on("error", (error, receipt) => {
                        ganache.advanceBlock(web3); // .sendTransaction seems to block ganache's evm_mine... call (beta52)
                        ganache.advanceBlock(web3);
                        ganache.advanceBlock(web3);

                        assert(error);
                        console.log("error received");
                        // this is not happening with web3 beta52:
                        // assert(receipt);
                        /// assert(!receipt.status);
                        onErrorSpy(error, receipt);
                    })
                    .catch(catchErrorSpy);

                // It's never resolves with receipt but should it?
                // assert(receipt);
                // assert(!receipt.status);
                sinon.assert.calledOnce(onErrorSpy);
                sinon.assert.calledOnce(catchErrorSpy);

                sinon.assert.calledOnce(transactionHashSpy);
                sinon.assert.calledOnce(receiptSpy);
                resolved = true;
            });
        }).timeout(baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS * 1000 + 2000);
    });
});
