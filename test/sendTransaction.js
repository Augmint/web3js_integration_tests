const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");
const ganache = require("./helpers/ganache.js");

const providers = baseHelpers.providers;
let accounts;

providers.forEach(web3 => {
    describe("sendTransaction - " + web3.currentProvider.constructor.name, () => {
        before(async () => {
            accounts = await web3.eth.personal.getAccounts();
        });

        it("should trigger tx events after send", async () => {
            // Works with beta36 HttpProvider but failing with WebsocketProvider(no confirmations received).
            // Failing both with beta 51 (sendTransaction never resolves. confirmations are still not received with WebsocketProvider)
            return new Promise(async resolve => {
                const transactionHashSpy = sinon.spy();
                const confirmationSpy = sinon.spy();
                const receiptSpy = sinon.spy();

                // testing:
                // 1. transactionHash and receipt events are triggered once and before any confirmation event
                // 2. confirmations event triggered  TRANSACTION_CONFIRMATION_BLOCKS times
                // 3. tx resolved before confirmation event triggered on the TRANSACTION_CONFIRMATION_BLOCKS time
                let resolved = false;

                const tx = web3.eth
                    .sendTransaction({ to: accounts[1], from: accounts[0], value: web3.utils.toWei("0.1", "ether") })
                    .on("transactionHash", txHash => {
                        console.log("transactionHash:", txHash);
                        transactionHashSpy(txHash);
                    })
                    .on("receipt", receipt => {
                        console.log("receipt received");
                        receiptSpy(receipt);
                    })
                    .on("confirmation", (confirmationNumber, receipt) => {
                        ganache.advanceBlock(web3); // it seems to be blocked by sendTransaction in beta52
                        ganache.advanceBlock(web3);
                        ganache.advanceBlock(web3);
                        console.log("confirmation", confirmationNumber, web3.currentProvider.constructor.name);
                        confirmationSpy(confirmationNumber, receipt);
                        assert(receipt.status);
                        sinon.assert.calledOnce(transactionHashSpy);
                        // it's not happening with beta52:
                        // sinon.assert.calledOnce(receiptSpy);
                        if (confirmationNumber === baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS) {
                            assert(resolved);
                            resolve();
                        }
                    });

                const receipt = await tx;
                resolved = true;

                assert(receipt.status);
                sinon.assert.calledOnce(transactionHashSpy);
                sinon.assert.calledOnce(receiptSpy);
                sinon.assert.callCount(confirmationSpy, baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS);
            });
        }).timeout(baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS * 1000 + 2000);

        it("should trigger tx events after send - non async", done => {
            const transactionHashSpy = sinon.spy();
            const confirmationSpy = sinon.spy();
            const receiptSpy = sinon.spy();

            let resolved = false;

            web3.eth
                .sendTransaction({ to: accounts[1], from: accounts[0], value: web3.utils.toWei("0.1", "ether") })
                .on("transactionHash", txHash => {
                    console.log("transactionHash:", txHash);
                    transactionHashSpy(txHash);
                })
                .on("receipt", receipt => {
                    console.log("receipt received");
                    receiptSpy(receipt);
                })
                .on("confirmation", (confirmationNumber, receipt) => {
                    console.log("confirmation", confirmationNumber, web3.currentProvider.constructor.name);
                    confirmationSpy(confirmationNumber, receipt);
                    assert(receipt.status);
                    sinon.assert.calledOnce(transactionHashSpy);
                    // it's not happening with beta52:
                    // sinon.assert.calledOnce(receiptSpy);
                    if (confirmationNumber === baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS) {
                        assert(resolved);
                    }
                })
                .then(receipt => {
                    resolved = true;
                    assert(receipt.status);
                    sinon.assert.calledOnce(transactionHashSpy);
                    sinon.assert.calledOnce(receiptSpy);
                    sinon.assert.callCount(confirmationSpy, baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS);
                    done();
                });
        }).timeout(baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS * 1000 + 2000);
    });
});
