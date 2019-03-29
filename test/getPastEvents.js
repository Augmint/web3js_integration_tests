const chai = require("chai");
const assert = chai.assert;
const baseHelpers = require("./helpers/base.js");

const providers = baseHelpers.providers;

providers.forEach(web3 => {
    describe("getPastEvents - " + web3.currentProvider.constructor.name, () => {
        it("should filter past logs", async () => {
            // Failed with beta 46, works with beta 51
            const accounts = await web3.eth.personal.getAccounts();
            const dummyContract = await baseHelpers.getWeb3ContractInstance(
                web3,
                "../../build/contracts/DummyContract.json"
            );

            const events = await dummyContract.getPastEvents("DummyEvent1", {
                fromBlock: 0,
                filter: { from: accounts[0], to: accounts[2] }
            });

            assert(events.length, 2);
            events.forEach(e => {
                assert.equal(e.event, "DummyEvent1");
                assert.equal(e.returnValues.from, accounts[0]);
                assert.equal(e.returnValues.to, accounts[2]);
            });
            assert.equal(events[0].returnValues.value, 400);
            assert.equal(events[1].returnValues.value, 500);
        });
    });
});
