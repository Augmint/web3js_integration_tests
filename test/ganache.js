const chai = require("chai");
const assert = chai.assert;
const baseHelpers = require("./helpers/base.js");
const ganache = require("./helpers/ganache.js");

const providers = baseHelpers.providers;

providers.forEach(web3 => {
    describe("ganache - " + web3.currentProvider.constructor.name, () => {
        it("should mine new block with evm_mine", async () => {
            const blockBefore = await web3.eth.getBlock("latest");

            await ganache.advanceBlock(web3);

            const blockAfter = await web3.eth.getBlock("latest");

            assert.notEqual(blockAfter.hash, blockBefore.hash);
        });

        it("should take and revert an evm snapshot");
    });
});
