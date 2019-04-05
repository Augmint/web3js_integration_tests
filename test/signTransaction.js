const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");
const ganache = require("./helpers/ganache.js");

const providers = baseHelpers.providers;
const ACCOUNT_0_PRIVATE_KEY = "0x586ad5c6b783aba623827a1075423d281078dea57ba1c12f6c9f0fe185a88b31";

let accounts;
let dummyContract;
let dummyFx2Tx;
let encodedABI;
let txToSign;

providers.forEach(web3 => {
    describe("signTransaction - " + web3.currentProvider.constructor.name, () => {
        before(async () => {
            accounts = await web3.eth.personal.getAccounts();

            dummyContract = await baseHelpers.getWeb3ContractInstance(web3, "../../build/contracts/DummyContract.json");

            dummyFx2Tx = dummyContract.methods.dummyFx2(222);
            encodedABI = dummyFx2Tx.encodeABI();
            assert.equal(encodedABI, "0xb7e44f9c00000000000000000000000000000000000000000000000000000000000000de");

            txToSign = {
                from: accounts[0],
                to: dummyContract.options.address,
                data: encodedABI,
                // signTransaction failing without these on beta52:
                chainId: await web3.eth.net.getId(),
                gas: 60000
            };
        });

        // Works with beta36 HttpProvider but failing with WebsocketProvider(no confirmations received).
        // failing on beta52 when chainId is not in the txToSign struct: "Method eth_chainId not supported."
        // Failing both on both beta36 and beta 51 (sendTransaction never resolves. confirmations are still not received with WebsocketProvider)

        it("should sign and send tx - txHash ", async () => {
            const transactionHashSpy = sinon.spy();
            const confirmationSpy = sinon.spy();
            const receiptSpy = sinon.spy();
            const signedTx = await web3.eth.accounts.signTransaction(txToSign, ACCOUNT_0_PRIVATE_KEY);

            const tx = web3.eth
                .sendSignedTransaction(signedTx.rawTransaction)
                .on("transactionHash", txHash => {
                    console.log("txhash received:", txHash);
                    ganache.advanceBlock(web3); // .sendSignedTransaction seems to block ganache's evm_mine... call (beta52)
                    ganache.advanceBlock(web3);
                    ganache.advanceBlock(web3);
                    transactionHashSpy(txHash);
                })
                .on("receipt", receipt => {
                    console.log("receipt recevied");
                    receiptSpy(receipt);
                })
                .on("confirmation", (confirmationNumber, receipt) => {
                    console.log("confirmation no:", confirmationNumber, web3.currentProvider.constructor.name);
                    confirmationSpy(confirmationNumber, receipt);
                })
                .on("error", error => console.log);

            const receipt = await tx;
            assert(receipt.status);
            sinon.assert.calledOnce(transactionHashSpy);
            sinon.assert.calledOnce(receiptSpy);
            sinon.assert.callCount(confirmationSpy, baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS);
        }).timeout(baseHelpers.TRANSACTION_CONFIRMATION_BLOCKS * 1000 + 2000);

        it.skip("should sign and send tx ", async () => {
            // Works with beta36 HttpProvider but failing with WebsocketProvider(no confirmations received).
            // failing on beta52 when chainId is not in the txToSign struct: "Method eth_chainId not supported."
            // Failing both on both beta36 and beta 51 (sendTransaction never resolves. confirmations are still not received with WebsocketProvider)
            return new Promise(async resolve => {
                const transactionHashSpy = sinon.spy();
                const confirmationSpy = sinon.spy();
                const receiptSpy = sinon.spy();
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
