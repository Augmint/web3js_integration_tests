module.exports = {
    takeSnapshot,
    revertSnapshot,
    advanceBlock
};

async function takeSnapshot(web3) {
    return await web3.currentProvider.send("evm_snapshot");
}

async function revertSnapshot(web3, snapshotId) {
    await web3.currentProvider.send("evm_revert", [snapshotId]);
}

async function advanceBlock(web3) {
    // let block = await web3.eth.getBlock("latest");
    // console.log("evm mine before:", block.number);

    await web3.currentProvider.send("evm_mine");

    // block = await web3.eth.getBlock("latest");
    // console.log("evm mine after:", block.number);
}
