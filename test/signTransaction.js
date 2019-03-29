const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");

const providers = baseHelpers.providers;
const ACCOUNT_0_PRIVATE_KEY = "0x650dec85be94330d93c512b9b8a241e404929c1c73b88881bad4b6722efd6731";

providers.forEach(web3 => {
    describe("signTransaction - " + web3.currentProvider.constructor.name, () => {
        it("should sign and send tx ", async () => {
            // Works with beta36 HttpProvider but failing with WebsocketProvider(no confirmations received).
            // failing on beta51 when chainId is not in the txToSign struct: "Method eth_chainId not supported."
            // Failing both on both beta36 and beta 51 (sendTransaction never resolves. confirmations are still not received with WebsocketProvider)
            return new Promise(async resolve => {
                const accounts = await web3.eth.personal.getAccounts();

                const dummyContract = await baseHelpers.getWeb3ContractInstance(
                    web3,
                    "../../build/contracts/DummyContract.json"
                );

                const transactionHashSpy = sinon.spy();
                const confirmationSpy = sinon.spy();
                const receiptSpy = sinon.spy();

                const dummyFx2Tx = dummyContract.methods.dummyFx2(222);
                const encodedABI = dummyFx2Tx.encodeABI();

                const txToSign = {
                    from: accounts[0],
                    to: dummyContract.options.address,
                    data: encodedABI
                    // signTransaction failing without these on beta51:
                    // chainId: await web3.eth.net.getId(),
                    // gas: 60000
                };

                const signedTx = await web3.eth.accounts.signTransaction(txToSign, ACCOUNT_0_PRIVATE_KEY);

                // testing:
                // 1. transactionHash and receipt events are triggered once and before any confirmation event
                // 2. confirmations event triggered  TRANSACTION_CONFIRMATION_BLOCKS times
                // 3. tx resolved before confirmation event triggered on the TRANSACTION_CONFIRMATION_BLOCKS time
                let resolved = false;
                const receipt = await web3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
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
