const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");
const baseHelpers = require("./helpers/base.js");

const providers = baseHelpers.providers;

providers.forEach(web3 => {
    if (web3.currentProvider.constructor.name !== "HttpProvider") {
        // Skipping test for HttpProvider, Subscriptions are not supported
        describe("contract events - " + web3.currentProvider.constructor.name, () => {
            it("should trigger contract events", async () => {
                const accounts = await web3.eth.personal.getAccounts();
                const dummyContract = await baseHelpers.getWeb3ContractInstance(
                    web3,
                    "../../build/contracts/DummyContract.json"
                );

                const eventSpy = sinon.spy();

                dummyContract.events.DummyEvent2().on("data", eventSpy);

                const tx = await dummyContract.methods.dummyFx2(111).send({ from: accounts[0] });

                assert(tx.status);
                sinon.assert.callCount(eventSpy, 1);
            });
        });
    }
});
